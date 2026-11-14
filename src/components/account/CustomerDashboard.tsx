import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  LogOut,
  Search,
  CheckCircle,
  MessageCircle,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { Order, Product } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

interface CustomerDashboardProps {
  initialTab?: 'orders' | 'profile' | 'wishlist' | 'tracking';
  onSelectProduct: (p: Product) => void;
  onBackToShop: () => void;
  onOpenAuth?: () => void;
}

interface TrackedOrderSummary {
  orderNumber: string;
  orderStatus: string;
  courier?: string;
  trackingNumber?: string | null;
  city?: string;
  paymentMethod?: string;
  total: number;
  createdAt: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = 'orders',
  onSelectProduct,
  onBackToShop,
  onOpenAuth,
}) => {
  const { user, userProfile, signOut, savedAddress, updateUserProfile, getIdToken } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { products } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'tracking'>(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Profile form (strictly updates customer's own allowed fields)
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || savedAddress?.fullName || user?.displayName || '',
    phone: userProfile?.phone || savedAddress?.phone || '',
    address: userProfile?.address || savedAddress?.address || '',
    city: userProfile?.city || savedAddress?.city || 'Lahore',
    postalCode: userProfile?.postalCode || savedAddress?.postalCode || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Tracking Lookup tool state (uses privacy-safe backend verification)
  const [trackOrderNum, setTrackOrderNum] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrderSummary | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setProfileForm({
      name: userProfile?.name || savedAddress?.fullName || user?.displayName || '',
      phone: userProfile?.phone || savedAddress?.phone || '',
      address: userProfile?.address || savedAddress?.address || '',
      city: userProfile?.city || savedAddress?.city || 'Lahore',
      postalCode: userProfile?.postalCode || savedAddress?.postalCode || '',
    });
  }, [user, userProfile, savedAddress]);

  // Fetch ONLY logged-in customer's own orders (from both Firestore & Backend API)
  useEffect(() => {
    let mounted = true;
    if (!user || !auth.currentUser || auth.currentUser.uid !== user.uid) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);

    const mergeCustomerOrders = (incoming: Order[]) => {
      if (!mounted) return;
      setOrders((prev) => {
        const map = new Map<string, Order>();
        prev.forEach((o) => {
          if (o.userId === user.uid || o.customerId === user.uid) {
            map.set(o.id || o.orderNumber, o);
          }
        });
        incoming.forEach((o) => {
          if (o.userId === user.uid || o.customerId === user.uid) {
            map.set(o.id || o.orderNumber, o);
          }
        });
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    };

    // 1. Authenticated backend /api/my-orders lookup
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const resp = await fetch('/api/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.success && Array.isArray(data.orders)) {
            mergeCustomerOrders(data.orders);
          }
        }
      } catch (err) {
        console.warn('Customer orders API note:', err);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    })();

    // 2. Real-time Firestore listener filtered strictly to userId == user.uid
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const userOrds: Order[] = [];
        snapshot.forEach((d) => {
          userOrds.push({ ...d.data(), id: d.id } as Order);
        });
        mergeCustomerOrders(userOrds);
        if (mounted) setLoadingOrders(false);
      },
      (err) => {
        console.warn('Orders fetch note:', err);
        if (mounted) setLoadingOrders(false);
      }
    );

    return () => {
      mounted = false;
      unsub();
    };
  }, [user, getIdToken]);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    setSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        postalCode: profileForm.postalCode,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || 'Unable to update your profile right now.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    setTrackedOrder(null);

    const cleanOrder = trackOrderNum.trim().toUpperCase();
    const cleanPhone = trackPhone.trim().replace(/[^0-9]/g, '');

    if (!cleanOrder) {
      setTrackError('Please enter your Order Number (e.g. NS-2026-XXXXX).');
      return;
    }
    if (cleanPhone.length < 7) {
      setTrackError('Please enter the recipient phone number used at checkout for privacy verification.');
      return;
    }

    setIsSearchingTrack(true);
    try {
      // 1. Check customer's own authenticated orders or same-browser cache first
      const ownMatch = orders.find((o) => o.orderNumber.toUpperCase() === cleanOrder);
      if (ownMatch) {
        const orderPhone = (ownMatch.phone || ownMatch.customer.phone || '').replace(/[^0-9]/g, '');
        if (!orderPhone.endsWith(cleanPhone.slice(-7))) {
          setTrackError('Phone number does not match this order number.');
        } else {
          setTrackedOrder({
            orderNumber: ownMatch.orderNumber,
            orderStatus: ownMatch.orderStatus,
            courier: ownMatch.courier,
            trackingNumber: ownMatch.trackingNumber,
            city: ownMatch.customer?.city,
            paymentMethod: ownMatch.paymentMethod,
            total: ownMatch.total,
            createdAt: ownMatch.createdAt,
          });
        }
        return;
      }

      // 2. Privacy-verified backend tracking endpoint (returns NO sensitive address/email PII)
      const resp = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: cleanOrder, phone: cleanPhone }),
      });
      const data = await resp.json();
      if (resp.ok && data?.success && data.tracking) {
        setTrackedOrder(data.tracking);
      } else {
        setTrackError(
          data?.error ||
            'Order not found. Please verify your Order Number and Phone Number or contact Helpline: 0328-0547200.'
        );
      }
    } catch {
      setTrackError('Unable to retrieve tracking information right now. Please contact 0328-0547200.');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-[#EADBCE] shadow-sm mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#B88E3E] shrink-0">
            <UserIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg sm:text-2xl font-bold text-[#1F1C1A] truncate">
              {userProfile?.name || user?.displayName || 'Customer Account'}
            </h1>
            <p className="text-xs text-[#7A7169] mt-0.5 truncate">
              {user?.email || 'Sign in to manage your personal profile, orders & wishlist'}
            </p>
            {userProfile?.phone && (
              <p className="text-[11px] text-[#8C827A] mt-0.5">{userProfile.phone}</p>
            )}
          </div>
        </div>

        {user ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:border-red-500 hover:text-red-600 text-xs font-semibold flex items-center justify-center gap-2 transition shrink-0 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold transition shrink-0 self-start sm:self-auto"
            >
              Sign In / Create Account
            </button>
          )
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#EADBCE] pb-3 mb-8 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#1F1C1A] text-white'
              : 'text-[#6F665F] hover:text-[#1F1C1A] hover:bg-[#FAF8F5]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`py-2 px-4 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tracking'
              ? 'bg-[#1F1C1A] text-white'
              : 'text-[#6F665F] hover:text-[#1F1C1A] hover:bg-[#FAF8F5]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Track Order</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`py-2 px-4 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-[#1F1C1A] text-white'
              : 'text-[#6F665F] hover:text-[#1F1C1A] hover:bg-[#FAF8F5]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistProducts.length})</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-[#1F1C1A] text-white'
                : 'text-[#6F665F] hover:text-[#1F1C1A] hover:bg-[#FAF8F5]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>My Profile &amp; Address</span>
          </button>
        )}
      </div>

      {/* ================= MY ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {!user ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EADBCE] space-y-4">
              <p className="font-serif text-lg font-bold text-[#1F1C1A]">Sign In Required</p>
              <p className="text-xs text-[#7A7169] max-w-sm mx-auto">
                Sign in to view your private order history and saved profile, or use the &quot;Track Order&quot; tab with your order number and phone.
              </p>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold transition"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          ) : loadingOrders ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-[#EADBCE] text-xs text-[#7A7169]">
              Loading your personal order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EADBCE] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#B88E3E]">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">No orders found yet</h3>
              <p className="text-xs text-[#7A7169] max-w-md mx-auto">
                Browse our couture collections to experience luxury Pakistani lawn, unstitched sets, and royal velvet shawls.
              </p>
              <button
                onClick={onBackToShop}
                className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-6 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EADBCE] pb-3 text-xs gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#1F1C1A]">
                      Order #{ord.orderNumber}
                    </span>
                    <span className="text-[#8C827A] block sm:inline sm:ml-3 mt-0.5 sm:mt-0">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : ord.orderStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      Status: {ord.orderStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetail(ord)}
                      className="px-3 py-1 rounded-lg border border-[#D9CCC2] hover:bg-[#FAF8F5] text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar timeline */}
                {ord.orderStatus !== 'Cancelled' && (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center text-[9px] sm:text-[10px] font-semibold text-[#8C827A]">
                      <div className="text-emerald-700 font-bold">1. {ord.orderStatus === 'Pending' ? 'Pending' : 'Confirmed'}</div>
                      <div
                        className={
                          ord.orderStatus === 'Processing' ||
                          ord.orderStatus === 'Shipped' ||
                          ord.orderStatus === 'Delivered'
                            ? 'text-emerald-700 font-bold'
                            : ''
                        }
                      >
                        2. Processing
                      </div>
                      <div
                        className={
                          ord.orderStatus === 'Shipped' || ord.orderStatus === 'Delivered'
                            ? 'text-emerald-700 font-bold'
                            : ''
                        }
                      >
                        3. Shipped
                      </div>
                      <div className={ord.orderStatus === 'Delivered' ? 'text-emerald-700 font-bold' : ''}>
                        4. Delivered
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-[#F2ECE6] rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all rounded-full"
                        style={{
                          width:
                            ord.orderStatus === 'Delivered'
                              ? '100%'
                              : ord.orderStatus === 'Shipped'
                              ? '75%'
                              : ord.orderStatus === 'Processing'
                              ? '50%'
                              : '25%',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-3 pt-2">
                  {ord.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <img
                        src={i.image}
                        alt={i.productName}
                        className="w-14 h-16 object-cover object-top rounded-lg border border-[#EADBCE] bg-[#FAF8F5] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1F1C1A] truncate">{i.productName}</p>
                        <p className="text-[11px] text-[#7A7169] mt-0.5">
                          Color: {i.colorName} • Size: {i.size} • Qty: {i.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-[#1F1C1A] shrink-0">
                        Rs. {(i.price * i.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking & Total info */}
                <div className="pt-3 border-t border-[#EADBCE] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                  <div>
                    {ord.trackingNumber ? (
                      <p className="text-[#1F1C1A]">
                        Courier: <strong>{ord.courier || 'PostEx Express'}</strong> | Tracking:{' '}
                        <span className="font-mono font-bold text-blue-700">{ord.trackingNumber}</span>
                      </p>
                    ) : (
                      <p className="text-[#8C827A]">PostEx Courier dispatch scheduled</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[#8C827A] mr-2">Total Amount ({ord.paymentMethod}):</span>
                    <span className="font-serif text-base font-bold text-[#B88E3E]">
                      Rs. {ord.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= TRACK ORDER ================= */}
      {activeTab === 'tracking' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-[#EADBCE] p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">Track Your Order</h3>
            <p className="text-xs text-[#7A7169]">
              Enter both your Order Number and the phone number used at checkout to check live fulfillment status securely.
            </p>

            <form onSubmit={handleTrackLookup} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Order Number</label>
                <input
                  type="text"
                  required
                  placeholder="NS-2026-84912"
                  value={trackOrderNum}
                  onChange={(e) => setTrackOrderNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] font-mono focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">
                  Recipient Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <button
                type="submit"
                disabled={isSearchingTrack}
                className="w-full py-3 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50"
              >
                {isSearchingTrack ? 'Searching...' : 'Track Order Status'}
              </button>
            </form>

            {trackError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {trackError}
              </div>
            )}
          </div>

          {/* Tracked Order Result Card (Sanitized summary) */}
          {trackedOrder && (
            <div className="bg-white rounded-2xl border border-[#B88E3E] p-4 sm:p-6 shadow-lg space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EADBCE] pb-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-sm text-[#1F1C1A]">
                    {trackedOrder.orderNumber}
                  </span>
                  <span className="block text-[11px] text-[#8C827A]">
                    Placed: {new Date(trackedOrder.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                  {trackedOrder.orderStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {trackedOrder.city && (
                  <p>
                    <strong>Destination City:</strong> {trackedOrder.city}
                  </p>
                )}
                {trackedOrder.paymentMethod && (
                  <p>
                    <strong>Payment Method:</strong> {trackedOrder.paymentMethod}
                  </p>
                )}
                <p>
                  <strong>Total Amount:</strong> Rs. {trackedOrder.total.toLocaleString()}
                </p>
                {trackedOrder.trackingNumber && (
                  <p className="text-blue-700 font-semibold">
                    {trackedOrder.courier || 'PostEx'} Tracking Number:{' '}
                    <span className="font-mono">{trackedOrder.trackingNumber}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#EADBCE]">
                <a
                  href={`https://wa.me/923280547200?text=${encodeURIComponent(
                    `Assalam-o-Alaikum NOOR STUDIO, I am inquiring about Order #${trackedOrder.orderNumber}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp Helpline</span>
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= WISHLIST ================= */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#EADBCE] space-y-3">
              <Heart className="w-12 h-12 text-[#E89A97] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">Your wishlist is currently empty</h3>
              <p className="text-xs text-[#7A7169]">
                Save your favorite luxury pret, organza dupattas, and winter shawls for quick ordering.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {wishlistProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-[#EADBCE] overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div
                    className="aspect-[3/4] bg-[#FAF8F5] relative overflow-hidden cursor-pointer"
                    onClick={() => onSelectProduct(prod)}
                  >
                    <img
                      src={prod.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 shadow-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="font-serif text-xs font-bold text-[#1F1C1A] line-clamp-1">{prod.name}</p>
                    <p className="text-xs font-bold text-[#B88E3E]">
                      Rs. {(prod.salePrice || prod.regularPrice).toLocaleString()}
                    </p>
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="w-full py-1.5 rounded bg-[#1F1C1A] text-white text-[11px] font-semibold hover:bg-[#B88E3E] transition"
                    >
                      View Options
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PROFILE & SAVED ADDRESS ================= */}
      {activeTab === 'profile' && user && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-8 shadow-sm space-y-4">
          <div className="border-b border-[#EADBCE] pb-3">
            <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">My Profile &amp; Delivery Details</h3>
            <p className="text-xs text-[#7A7169] mt-0.5">
              Update your personal contact details and default shipping address.
            </p>
          </div>

          {profileError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSaved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Your profile has been updated!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#EADBCE] bg-[#FAF8F5] text-[#7A7169] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Member Since</label>
                <input
                  type="text"
                  disabled
                  value={
                    userProfile?.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString()
                      : 'Active Member'
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-[#EADBCE] bg-[#FAF8F5] text-[#7A7169] cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1F1C1A] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1F1C1A] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1F1C1A] mb-1">Default Street Address</label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Postal Code</label>
                <input
                  type="text"
                  value={profileForm.postalCode}
                  onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile & Address'}
            </button>
          </form>
        </div>
      )}

      {/* ================= CUSTOMER ORDER DETAIL MODAL ================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-[#EADBCE] pb-3 gap-2">
              <div>
                <p className="font-mono font-bold text-base text-[#1F1C1A]">
                  Order #{selectedOrderDetail.orderNumber}
                </p>
                <p className="text-xs text-[#8C827A]">
                  Placed on {new Date(selectedOrderDetail.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                aria-label="Close order details"
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] text-xs space-y-1">
              <p className="font-bold text-[#1F1C1A]">Delivery Details</p>
              <p>{selectedOrderDetail.customer.fullName}</p>
              <p>{selectedOrderDetail.customer.phone}</p>
              <p>
                {selectedOrderDetail.customer.address}, {selectedOrderDetail.customer.city}
              </p>
            </div>

            <div className="space-y-2.5">
              {selectedOrderDetail.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-[#EADBCE] text-xs">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-14 object-cover object-top rounded-md border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1F1C1A] truncate">{item.productName}</p>
                    <p className="text-[#8C827A]">
                      {item.colorName} • Size: {item.size} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#1F1C1A]">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#EADBCE] text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {selectedOrderDetail.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>
                  {selectedOrderDetail.shippingCost === 0
                    ? 'FREE'
                    : `Rs. ${selectedOrderDetail.shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 text-[#1F1C1A]">
                <span>Total Payable ({selectedOrderDetail.paymentMethod}):</span>
                <span className="font-serif text-[#B88E3E]">
                  Rs. {selectedOrderDetail.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
