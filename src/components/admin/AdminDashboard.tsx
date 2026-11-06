import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  Settings,
  Search,
  CheckCircle,
  Truck,
  X,
  Phone,
  MessageCircle,
  Clock,
  AlertCircle,
  Save,
  Eye,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Product, Order, Category, ColorVariation, SizeStock, OrderStatus } from '../../types';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const AdminDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const { user, isAdmin, signInAsAdminDemo } = useAuth();
  const {
    products,
    categories,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'categories' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Orders search & filter
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Product Add / Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodForm, setProdForm] = useState<{
    name: string;
    slug: string;
    description: string;
    category: string;
    subcategory: string;
    fabric: string;
    regularPrice: number;
    salePrice: number;
    sku: string;
    defaultColor: string;
    isNewArrival: boolean;
    isBestSeller: boolean;
    isFeatured: boolean;
    isActive: boolean;
    colors: ColorVariation[];
  }>({
    name: '',
    slug: '',
    description: '',
    category: 'Stitched',
    subcategory: '3 Piece',
    fabric: 'Pure Lawn / Raw Silk',
    regularPrice: 8500,
    salePrice: 6990,
    sku: 'NS-ST-009',
    defaultColor: 'Midnight Black',
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: true,
    isActive: true,
    colors: [
      {
        name: 'Midnight Black',
        hex: '#111111',
        sku: 'NS-ST-009-BLK',
        images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800'],
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 6 },
        ],
      },
    ],
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // PostEx Booking Modal state
  const [bookingOrder, setBookingOrder] = useState<Order | null>(null);
  const [trackingGenerated, setTrackingGenerated] = useState<string | null>(null);

  // Fetch real-time orders from Firestore
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const ords: Order[] = [];
        snapshot.forEach((d) => {
          ords.push({ ...d.data(), id: d.id } as Order);
        });
        setOrders(ords);
        setLoadingOrders(false);
      },
      (err) => {
        console.warn('Orders snapshot warning', err);
        setLoadingOrders(false);
      }
    );
    return () => unsub();
  }, []);

  // Sync settings when context loads
  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  // Auth Guard
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-red-200 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-xl font-bold text-[#1F1C1A]">Authorized Access Only</h2>
        <p className="text-xs text-[#7A7169]">
          The NOOR STUDIO Admin Portal requires verified administrative privileges.
          Please sign in with the authorized store admin account (sawairamaryam837@gmail.com).
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => signInAsAdminDemo()}
            className="px-5 py-2.5 rounded-lg bg-[#C5A059] text-[#191715] text-xs font-bold hover:bg-[#B88E3E] hover:text-white transition"
          >
            Sign In as Store Admin (sawaira)
          </button>
          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-lg bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Analytics
  const totalSales = orders.reduce((sum, o) => sum + (o.orderStatus !== 'Cancelled' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending');
  const processingOrders = orders.filter((o) => o.orderStatus === 'Processing');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer.phone.includes(orderSearchQuery) ||
      o.customer.city.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails({ ...selectedOrderDetails, orderStatus: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handlePostExBooking = async (order: Order) => {
    const generatedTracking = `PEX-${Date.now().toString().slice(-8)}`;
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        trackingNumber: generatedTracking,
        courier: 'PostEx Express COD',
        orderStatus: 'Shipped',
        updatedAt: new Date().toISOString(),
      });
      setTrackingGenerated(generatedTracking);
    } catch (err) {
      console.error('PostEx booking error', err);
    }
  };

  // Open Product Modal (New or Edit)
  const openProductModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setProdForm({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        category: prod.category,
        subcategory: prod.subcategory || '3 Piece',
        fabric: prod.fabric,
        regularPrice: prod.regularPrice,
        salePrice: prod.salePrice || prod.regularPrice,
        sku: prod.sku,
        defaultColor: prod.defaultColor || prod.colors[0]?.name || 'Black',
        isNewArrival: !!prod.isNewArrival,
        isBestSeller: !!prod.isBestSeller,
        isFeatured: !!prod.isFeatured,
        isActive: prod.isActive,
        colors: JSON.parse(JSON.stringify(prod.colors)),
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        name: '',
        slug: '',
        description: '',
        category: 'Stitched',
        subcategory: '3 Piece',
        fabric: 'Pure Lawn / Raw Silk',
        regularPrice: 8500,
        salePrice: 6990,
        sku: `NS-ST-${Math.floor(100 + Math.random() * 900)}`,
        defaultColor: 'Midnight Black',
        isNewArrival: true,
        isBestSeller: false,
        isFeatured: true,
        isActive: true,
        colors: [
          {
            name: 'Midnight Black',
            hex: '#111111',
            sku: 'NS-BLK',
            images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800'],
            sizes: [
              { size: 'S', stock: 5 },
              { size: 'M', stock: 8 },
              { size: 'L', stock: 4 },
            ],
          },
        ],
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = prodForm.slug.trim() || prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      ...prodForm,
      slug,
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 1,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }
    setShowProductModal(false);
  };

  // Add Color Variation in Form
  const handleAddColorVariation = () => {
    setProdForm((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        {
          name: 'Royal Maroon',
          hex: '#800000',
          sku: `${prev.sku}-MRN`,
          images: ['https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=800'],
          sizes: [
            { size: 'S', stock: 5 },
            { size: 'M', stock: 5 },
            { size: 'L', stock: 3 },
          ],
        },
      ],
    }));
  };

  const handleRemoveColorVariation = (index: number) => {
    if (prodForm.colors.length <= 1) return;
    setProdForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] pb-20">
      {/* Top Admin Navigation Header */}
      <div className="bg-[#191715] text-white border-b border-[#2D2825] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl tracking-[0.2em] font-bold uppercase text-[#FAF8F5]">
              NOOR STUDIO
            </span>
            <span className="px-2 py-0.5 rounded bg-[#C5A059] text-[#191715] text-[10px] font-bold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#A89D93] hidden md:inline">
              Logged in: <strong className="text-white">{user?.email}</strong>
            </span>
            <button
              onClick={onExit}
              className="px-4 py-1.5 rounded-lg bg-[#2D2825] hover:bg-[#C5A059] hover:text-[#191715] text-xs font-semibold transition"
            >
              Back to Storefront
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-6 mt-4 pt-3 border-t border-[#2D2825] overflow-x-auto text-xs font-medium uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            <span>Orders</span>
            {pendingOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'products' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'inventory' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Inventory Matrix
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'categories' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-lg transition whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-[#C5A059] text-[#191715] font-bold' : 'text-[#D8CCC4] hover:text-white'
            }`}
          >
            Store Settings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Total Revenue</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1 text-[#B88E3E]">
                  Rs. {totalSales.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#A89D93] mt-1">Cash on Delivery & Raast</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Total Orders</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
                  {orders.length}
                </p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">
                  {pendingOrders.length} Pending Verification
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Active Catalog</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
                  {products.filter((p) => p.isActive).length}
                </p>
                <p className="text-[11px] text-[#A89D93] mt-1">Across {categories.length} categories</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">Delivered Orders</span>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-1">
                  {deliveredOrders.length}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1">Successfully completed</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders List (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#B88E3E] hover:underline"
                  >
                    View All Orders
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#8C827A] py-6 text-center">No customer orders placed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedOrderDetails(ord);
                          setActiveTab('orders');
                        }}
                        className="p-3.5 rounded-xl border border-[#EADBCE] hover:border-[#B88E3E] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#1F1C1A]">
                              {ord.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.orderStatus === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A423D] mt-1 font-medium">
                            {ord.customer.fullName} • {ord.customer.city}
                          </p>
                          <p className="text-[11px] text-[#8C827A]">
                            {ord.items.length} item(s) • {new Date(ord.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1F1C1A]">
                            Rs. {ord.total.toLocaleString()}
                          </p>
                          <span className="text-[11px] text-[#B88E3E] font-medium">
                            {ord.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Store Health & Contact Snapshot (1 Col) */}
              <div className="bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1F1C1A] border-b border-[#EADBCE] pb-3">
                  Store Operations
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Customer Support Helpline</span>
                    <span className="font-bold text-[#1F1C1A] text-sm">{settings.helpline || '03284454746'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">WhatsApp Business Contact</span>
                    <span className="font-bold text-[#25D366] text-sm">{settings.whatsapp || '+923284454746'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Primary Courier Provider</span>
                    <span className="font-bold text-[#1F1C1A]">PostEx Express (Nationwide COD)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                    <span className="text-[#8C827A] block">Free Shipping Threshold</span>
                    <span className="font-bold text-[#1F1C1A]">Orders over Rs. {settings.freeShippingThreshold?.toLocaleString() || '5,000'}</span>
                  </div>
                </div>

                <button
                  onClick={() => openProductModal()}
                  className="w-full py-3 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Product Management</h2>
                <p className="text-xs text-[#7A7169]">
                  Manage luxury Pakistani fashion ensembles, color variations, galleries, and sizes.
                </p>
              </div>
              <button
                onClick={() => openProductModal()}
                className="py-2.5 px-4 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#4A423D]">
                  <thead className="bg-[#FAF8F5] text-[#1F1C1A] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (PKR)</th>
                      <th className="py-3 px-4">Color Variations</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {products.map((p) => {
                      const totalStock = p.colors.reduce(
                        (sum, c) => sum + c.sizes.reduce((sSum, s) => sSum + s.stock, 0),
                        0
                      );
                      return (
                        <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.colors[0]?.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200'}
                              alt={p.name}
                              className="w-12 h-14 object-cover object-top rounded-lg border border-[#EADBCE] shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-xs text-[#1F1C1A] line-clamp-1">{p.name}</p>
                              <p className="text-[11px] text-[#A89D93] font-mono">SKU: {p.sku}</p>
                              <div className="flex gap-1 mt-1">
                                {p.isNewArrival && (
                                  <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold">
                                    NEW
                                  </span>
                                )}
                                {p.isBestSeller && (
                                  <span className="text-[9px] bg-[#B88E3E] text-white px-1.5 py-0.2 rounded font-bold">
                                    BESTSELLER
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1F1C1A]">
                            {p.category} {p.subcategory ? `• ${p.subcategory}` : ''}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1F1C1A]">
                            Rs. {(p.salePrice || p.regularPrice).toLocaleString()}
                            {p.salePrice && p.salePrice < p.regularPrice && (
                              <span className="block text-[10px] text-gray-400 line-through">
                                Rs. {p.regularPrice.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {p.colors.map((c) => (
                                <span
                                  key={c.name}
                                  className="w-4 h-4 rounded-full border border-black/20"
                                  style={{ backgroundColor: c.hex }}
                                  title={`${c.name} (${c.sizes.reduce((sum, s) => sum + s.stock, 0)} in stock)`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-[#8C827A] mt-1 block">
                              Total Stock: {totalStock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => openProductModal(p)}
                              className="p-1.5 rounded bg-gray-100 hover:bg-[#B88E3E] hover:text-white transition"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 rounded bg-gray-100 hover:bg-red-600 hover:text-white transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= INVENTORY MATRIX TAB ================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Inventory Management Matrix</h2>
              <p className="text-xs text-[#7A7169]">
                View and edit live stock counts partitioned by product, color variation, and size.
              </p>
            </div>

            <div className="space-y-4">
              {products.map((prod) => (
                <div key={prod.id} className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EADBCE] pb-2.5">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1F1C1A]">{prod.name}</h4>
                      <p className="text-[11px] text-[#8C827A]">
                        {prod.category} | SKU: {prod.sku}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                    {prod.colors.map((color, colIdx) => (
                      <div key={color.name} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="font-semibold text-xs text-[#1F1C1A]">{color.name}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {color.sizes.map((s, szIdx) => (
                            <div key={s.size} className="p-2 rounded bg-white border border-[#D9CCC2] text-center">
                              <span className="font-bold text-[11px] block">{s.size}</span>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <button
                                  onClick={() => {
                                    const updatedColors = [...prod.colors];
                                    updatedColors[colIdx].sizes[szIdx].stock = Math.max(0, s.stock - 1);
                                    updateProduct(prod.id, { colors: updatedColors });
                                  }}
                                  className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                                >
                                  -
                                </button>
                                <span className="font-mono font-bold text-xs w-6">{s.stock}</span>
                                <button
                                  onClick={() => {
                                    const updatedColors = [...prod.colors];
                                    updatedColors[colIdx].sizes[szIdx].stock = s.stock + 1;
                                    updateProduct(prod.id, { colors: updatedColors });
                                  }}
                                  className="w-5 h-5 rounded bg-gray-100 hover:bg-gray-200 text-xs font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Customer Orders Management</h2>
              <p className="text-xs text-[#7A7169]">
                View nationwide orders, update fulfillment statuses, and book shipments with PostEx.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EADBCE]">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by Order #, Name, Phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] text-xs focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
                {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                        orderStatusFilter === status
                          ? 'bg-[#1F1C1A] text-white font-semibold'
                          : 'bg-[#FAF8F5] text-[#5A524C] hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-[#EADBCE] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-[#4A423D]">
                  <thead className="bg-[#FAF8F5] text-[#1F1C1A] uppercase tracking-wider font-semibold border-b border-[#EADBCE]">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Courier & Tracking</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCE]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF8F5]/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-[#1F1C1A]">
                            {ord.orderNumber}
                            <span className="block text-[10px] text-[#A89D93] font-sans font-normal">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#1F1C1A]">{ord.customer.fullName}</p>
                            <p className="text-[11px] text-[#6F665F]">{ord.customer.phone}</p>
                            <p className="text-[10px] text-[#A89D93] line-clamp-1">{ord.customer.city}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{ord.items.length} item(s)</span>
                            <span className="block text-[10px] text-[#8C827A] line-clamp-1">
                              {ord.items.map((i) => `${i.productName} (${i.colorName}/${i.size})`).join(', ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1F1C1A]">
                            Rs. {ord.total.toLocaleString()}
                            <span className="block text-[10px] text-emerald-700 font-normal">
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#D9CCC2] text-xs font-semibold focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            {ord.trackingNumber ? (
                              <div>
                                <span className="font-mono text-xs text-blue-700 font-bold">
                                  {ord.trackingNumber}
                                </span>
                                <span className="block text-[10px] text-gray-500">{ord.courier}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handlePostExBooking(ord)}
                                className="px-2 py-1 rounded bg-[#B88E3E] text-white text-[10px] font-semibold hover:bg-[#9E7730] transition flex items-center gap-1"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Book PostEx</span>
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-2.5 py-1 rounded bg-gray-100 hover:bg-[#1F1C1A] hover:text-white text-xs font-medium transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= CATEGORIES TAB ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Categories Management</h2>
                <p className="text-xs text-[#7A7169]">
                  Manage store navigation categories, subcategories, and banner photos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 relative">
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600'}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                      Order: {cat.order}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1F1C1A]">{cat.name}</h4>
                    <p className="text-xs text-[#7A7169] mt-1 line-clamp-2">{cat.description}</p>
                  </div>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pt-2 border-t border-[#F2ECE6]">
                      <span className="text-[11px] font-bold text-[#1F1C1A] block mb-1">Subcategories:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.subcategories.map((sub) => (
                          <span key={sub} className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EADBCE] text-[10px]">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SETTINGS TAB ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-[#EADBCE] p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="border-b border-[#EADBCE] pb-3">
              <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Store Settings & Contact</h2>
              <p className="text-xs text-[#7A7169] mt-0.5">
                Update NOOR STUDIO official business parameters, helpline, and shipping rates.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Store settings updated successfully!</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateSettings(settingsForm);
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.brandName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Customer Helpline (Voice)</label>
                  <input
                    type="text"
                    value={settingsForm.helpline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, helpline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Website URL</label>
                  <input
                    type="url"
                    value={settingsForm.websiteUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Standard Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.shippingFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Free Delivery Minimum (PKR)</label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Top Announcement Banner</label>
                <textarea
                  rows={2}
                  value={settingsForm.announcement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <div>
                <span className="font-mono text-base font-bold text-[#1F1C1A]">
                  Order #{selectedOrderDetails.orderNumber}
                </span>
                <p className="text-xs text-[#8C827A]">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                <p className="font-bold text-[#1F1C1A] mb-1">Customer Information</p>
                <p>Name: {selectedOrderDetails.customer.fullName}</p>
                <p>Phone: {selectedOrderDetails.customer.phone}</p>
                <p>Email: {selectedOrderDetails.customer.email || 'N/A'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EADBCE]">
                <p className="font-bold text-[#1F1C1A] mb-1">Shipping Address</p>
                <p>{selectedOrderDetails.customer.address}</p>
                <p>City: {selectedOrderDetails.customer.city}</p>
                {selectedOrderDetails.customer.notes && (
                  <p className="text-amber-800 mt-1">Note: {selectedOrderDetails.customer.notes}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="font-bold text-xs text-[#1F1C1A] uppercase tracking-wider mb-2">
                Purchased Ensembles
              </p>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#EADBCE] text-xs">
                    <img
                      src={i.image}
                      alt={i.productName}
                      className="w-12 h-14 object-cover object-top rounded-md border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1F1C1A]">{i.productName}</p>
                      <p className="text-[#8C827A]">
                        Color: {i.colorName} | Size: {i.size} | Qty: {i.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-[#1F1C1A]">
                      Rs. {(i.price * i.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-[#EADBCE] text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {selectedOrderDetails.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{selectedOrderDetails.shippingCost === 0 ? 'FREE' : `Rs. ${selectedOrderDetails.shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1F1C1A] pt-1">
                <span>Total Payable (COD):</span>
                <span className="font-serif text-[#B88E3E]">
                  Rs. {selectedOrderDetails.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions: Update status & WhatsApp confirmation template */}
            <div className="pt-3 border-t border-[#EADBCE] flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${selectedOrderDetails.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${selectedOrderDetails.customer.fullName}, Thank you for your order with NOOR STUDIO (Order #${selectedOrderDetails.orderNumber}). Your order of Rs. ${selectedOrderDetails.total.toLocaleString()} is confirmed and will be dispatched via PostEx Express courier.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-lg bg-[#25D366] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#20ba5a] transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp Confirmation</span>
              </a>

              {!selectedOrderDetails.trackingNumber && (
                <button
                  onClick={() => handlePostExBooking(selectedOrderDetails)}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#B88E3E] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#9E7730] transition"
                >
                  <Truck className="w-4 h-4" />
                  <span>Generate PostEx Tracking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT PRODUCT MODAL ================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">
                {editingProduct ? 'Edit Fashion Ensemble' : 'Add New Fashion Ensemble'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mah-e-Noor Handcrafted Organza Peshwas"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Subcategory</label>
                  <select
                    value={prodForm.subcategory}
                    onChange={(e) => setProdForm({ ...prodForm, subcategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none"
                  >
                    <option value="1 Piece">1 Piece (Kurti / Shirt)</option>
                    <option value="2 Piece">2 Piece (Shirt + Trouser)</option>
                    <option value="3 Piece">3 Piece (Complete Ensemble)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Regular Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={prodForm.regularPrice}
                    onChange={(e) => setProdForm({ ...prodForm, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Sale Discount Price (PKR)</label>
                  <input
                    type="number"
                    value={prodForm.salePrice}
                    onChange={(e) => setProdForm({ ...prodForm, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Fabric & Material Composition</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Raw Silk Shirt with Organza Jacquard Dupatta"
                  value={prodForm.fabric}
                  onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none"
                />
              </div>

              {/* Badges / Checkboxes */}
              <div className="flex flex-wrap gap-4 py-2 border-y border-[#EADBCE]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isNewArrival}
                    onChange={(e) => setProdForm({ ...prodForm, isNewArrival: e.target.checked })}
                  />
                  <span>Mark as New Arrival</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isBestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                  />
                  <span>Mark as Best Seller</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isActive}
                    onChange={(e) => setProdForm({ ...prodForm, isActive: e.target.checked })}
                  />
                  <span>Active in Store</span>
                </label>
              </div>

              {/* DYNAMIC COLOR VARIATIONS BUILDER */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F1C1A] uppercase tracking-wider text-xs">
                    Dynamic Color Variations ({prodForm.colors.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddColorVariation}
                    className="px-2.5 py-1 rounded bg-[#B88E3E] text-white text-[11px] font-semibold hover:bg-[#9E7730] transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Color</span>
                  </button>
                </div>

                {prodForm.colors.map((color, colIdx) => (
                  <div key={colIdx} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#1F1C1A]">
                        Color Variation #{colIdx + 1}
                      </span>
                      {prodForm.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColorVariation(colIdx)}
                          className="text-red-600 hover:text-red-800 text-[11px] font-semibold"
                        >
                          Remove Color
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Color Name</label>
                        <input
                          type="text"
                          required
                          value={color.name}
                          onChange={(e) => {
                            const newCols = [...prodForm.colors];
                            newCols[colIdx].name = e.target.value;
                            setProdForm({ ...prodForm, colors: newCols });
                          }}
                          className="w-full px-3 py-1.5 rounded border border-[#D9CCC2] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Hex Color Code</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => {
                              const newCols = [...prodForm.colors];
                              newCols[colIdx].hex = e.target.value;
                              setProdForm({ ...prodForm, colors: newCols });
                            }}
                            className="w-8 h-8 rounded border p-0.5 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={color.hex}
                            onChange={(e) => {
                              const newCols = [...prodForm.colors];
                              newCols[colIdx].hex = e.target.value;
                              setProdForm({ ...prodForm, colors: newCols });
                            }}
                            className="flex-1 px-3 py-1.5 rounded border border-[#D9CCC2] bg-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Variant SKU</label>
                        <input
                          type="text"
                          value={color.sku}
                          onChange={(e) => {
                            const newCols = [...prodForm.colors];
                            newCols[colIdx].sku = e.target.value;
                            setProdForm({ ...prodForm, colors: newCols });
                          }}
                          className="w-full px-3 py-1.5 rounded border border-[#D9CCC2] bg-white"
                        />
                      </div>
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">
                        High-Resolution Image URL (Specific to {color.name})
                      </label>
                      <input
                        type="url"
                        required
                        value={color.images[0] || ''}
                        onChange={(e) => {
                          const newCols = [...prodForm.colors];
                          newCols[colIdx].images = [e.target.value];
                          setProdForm({ ...prodForm, colors: newCols });
                        }}
                        className="w-full px-3 py-1.5 rounded border border-[#D9CCC2] bg-white"
                      />
                    </div>

                    {/* Size and Stock */}
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Sizes & Stock Levels</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {color.sizes.map((s, szIdx) => (
                          <div key={s.size} className="p-2 rounded bg-white border border-[#D9CCC2] text-center">
                            <span className="font-bold text-[10px] block">{s.size}</span>
                            <input
                              type="number"
                              min={0}
                              value={s.stock}
                              onChange={(e) => {
                                const newCols = [...prodForm.colors];
                                newCols[colIdx].sizes[szIdx].stock = Number(e.target.value);
                                setProdForm({ ...prodForm, colors: newCols });
                              }}
                              className="w-full text-center border-t mt-1 pt-1 font-mono font-bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EADBCE]">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] text-white font-semibold hover:bg-[#B88E3E] transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
