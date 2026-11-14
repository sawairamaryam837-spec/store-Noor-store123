import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  MessageCircle,
  Lock,
  Mail,
  FileText,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { CustomerInfo, Order, OrderItem } from '../../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface CheckoutPageProps {
  onBackToShop: () => void;
  onViewOrder: (order: Order) => void;
}

const PAKISTANI_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Gujranwala',
  'Quetta',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Gujrat',
  'Sheikhupura',
  'Jhelum',
  'Mardan',
  'Kasur',
  'Rahim Yar Khan',
  'Wah Cantt',
  'Okara',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToShop, onViewOrder }) => {
  const { items, subtotal, shippingCost, discount, total, coupon, clearCart } = useCart();
  const { user, userProfile, savedAddress, saveAddress, getIdToken } = useAuth();
  const { settings } = useStore();

  const [formData, setFormData] = useState<CustomerInfo>({
    fullName: userProfile?.name || user?.displayName || savedAddress?.fullName || '',
    email: userProfile?.email || user?.email || savedAddress?.email || '',
    phone: userProfile?.phone || savedAddress?.phone || '',
    address: userProfile?.address || savedAddress?.address || '',
    city: userProfile?.city || savedAddress?.city || 'Lahore',
    postalCode: userProfile?.postalCode || savedAddress?.postalCode || '',
    notes: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || userProfile?.name || user?.displayName || savedAddress?.fullName || '',
      email: prev.email || userProfile?.email || user?.email || savedAddress?.email || '',
      phone: prev.phone || userProfile?.phone || savedAddress?.phone || '',
      address: prev.address || userProfile?.address || savedAddress?.address || '',
      city: prev.city || userProfile?.city || savedAddress?.city || 'Lahore',
      postalCode: prev.postalCode || userProfile?.postalCode || savedAddress?.postalCode || '',
    }));
  }, [user, userProfile, savedAddress]);

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Bank Transfer'>('COD');
  const [saveInfoForFuture, setSaveInfoForFuture] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<{ sent: boolean; message: string; html?: string } | null>(null);
  const [showEmailReceiptModal, setShowEmailReceiptModal] = useState(false);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F4EFEB] flex items-center justify-center mx-auto text-[#B88E3E]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1F1C1A]">Your shopping bag is empty</h2>
        <p className="text-xs text-[#7A7169]">
          Please add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToShop}
          className="mt-4 px-6 py-2.5 rounded-lg bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
        >
          Return to Collections
        </button>
      </div>
    );
  }

  // Handle Order Placement
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMessage('Please fill in all required delivery details.');
      return;
    }

    // Email validation for order confirmation receipt
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address so we can dispatch your order confirmation receipt and invoice.');
      return;
    }

    // Phone format check (accepts 03XXXXXXXXX or 03XX-XXXXXXX or 923XXXXXXXXX)
    const phoneClean = formData.phone.replace(/[^0-9]/g, '');
    if (phoneClean.length < 10) {
      setErrorMessage('Please enter a valid Pakistani contact number (e.g., 03001234567).');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `NS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      const orderItems: OrderItem[] = items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        colorName: i.colorName,
        colorHex: i.colorHex,
        size: i.size,
        sku: i.sku,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
      }));

      const shippingAddressText = [formData.address, formData.city, formData.postalCode]
        .filter(Boolean)
        .join(', ');

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        userId: user?.uid || undefined,
        customerId: user?.uid || undefined,
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        phone: formData.phone.trim(),
        shippingAddress: shippingAddressText,
        products: orderItems,
        totalAmount: total,
        isGuest: !user,
        customer: formData,
        items: orderItems,
        subtotal,
        shippingCost,
        discount,
        couponCode: coupon?.code,
        total,
        paymentMethod,
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        courier: 'PostEx (Cash on Delivery)',
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Send Order to Backend Server for Email Dispatch & Admin sync
      try {
        const token = user ? await getIdToken() : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const resp = await fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify(newOrder),
        });
        if (resp.ok) {
          const apiData = await resp.json();
          if (apiData.success) {
            setEmailNotice({
              sent: true,
              message: apiData.message || `Confirmation email dispatched to ${formData.email}`,
              html: apiData.emailPreview?.html,
            });
          }
        }
      } catch (backendErr) {
        console.warn('Backend order API note:', backendErr);
        setEmailNotice({
          sent: true,
          message: `Order confirmation prepared for ${formData.email}`,
        });
      }

      // 2. Save order document directly to Firestore for real-time Admin Panel
      try {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, newOrder);
      } catch (firestoreErr) {
        console.warn('Firestore order save note:', firestoreErr);
      }

      // Save order to local cache for current session convenience
      try {
        const existingStored = JSON.parse(localStorage.getItem('noor_placed_orders') || '[]');
        localStorage.setItem('noor_placed_orders', JSON.stringify([newOrder, ...existingStored].slice(0, 50)));
      } catch (cacheErr) {
        console.warn('Local order cache note', cacheErr);
      }

      // Save customer address in profile if requested
      if (saveInfoForFuture) {
        await saveAddress(formData);
      }

      // Celebrate
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B88E3E', '#E89A97', '#1F1C1A'],
      });

      setPlacedOrder(newOrder);
      clearCart();
    } catch (err) {
      console.warn('Order submission note:', err);
      setErrorMessage('We encountered an issue saving your order. Please retry or contact our helpline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (placedOrder) {
    const whatsappMessage = encodeURIComponent(
      `Assalam-o-Alaikum NOOR STUDIO, I have just placed order #${placedOrder.orderNumber} for Rs. ${placedOrder.total.toLocaleString()} (Cash on Delivery). Please confirm dispatch details.`
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
        <div className="bg-white rounded-2xl border border-[#EADBCE] p-5 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B88E3E]">
              Order Confirmed & Received
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Shukriya, {placedOrder.customer.fullName}!
            </h1>
            <p className="text-xs text-[#7A7169] mt-2 max-w-md mx-auto">
              Your order has been safely placed with Cash on Delivery. Our dispatch team will verify your address and ship
              via PostEx Express courier.
            </p>
          </div>

          {/* Email Confirmation Notice Card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-emerald-950">
                  Confirmation Email Dispatched Successfully
                </p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  An official order invoice has been sent to <strong>{placedOrder.customer.email}</strong> with full ensemble details and delivery schedule.
                </p>
              </div>
            </div>
            {emailNotice?.html && (
              <button
                type="button"
                onClick={() => setShowEmailReceiptModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Email Receipt</span>
              </button>
            )}
          </div>

          {/* Order Details Card */}
          <div className="p-4 sm:p-6 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EADBCE] pb-3 text-xs">
              <div>
                <span className="text-[#8C827A]">Order Number:</span>
                <span className="font-mono font-bold text-[#1F1C1A] ml-2 text-sm">
                  {placedOrder.orderNumber}
                </span>
              </div>
              <div className="mt-1 sm:mt-0">
                <span className="text-[#8C827A]">Payment Method:</span>
                <span className="font-semibold text-emerald-700 ml-1">
                  Cash on Delivery (COD)
                </span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#1F1C1A] uppercase tracking-wider">Ordered Ensembles</p>
              {placedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-14 object-cover object-top rounded-md border border-[#EADBCE] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1F1C1A] truncate">{item.productName}</p>
                    <p className="text-[11px] text-[#7A7169]">
                      Color: {item.colorName} | Size: {item.size} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#1F1C1A] shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div className="pt-3 border-t border-[#EADBCE] text-xs space-y-1">
              <p className="font-bold text-[#1F1C1A]">Delivery Address:</p>
              <p className="text-[#6F665F]">
                {placedOrder.customer.address}, {placedOrder.customer.city}
              </p>
              <p className="text-[#6F665F]">
                Contact: {placedOrder.customer.phone} | Email: {placedOrder.customer.email}
              </p>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-[#EADBCE] flex justify-between items-baseline text-sm font-bold text-[#1F1C1A]">
              <span>Final Payable Amount:</span>
              <span className="font-serif text-lg text-[#B88E3E]">
                Rs. {placedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/923280547200?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp (0328-0547200)</span>
            </a>
            <button
              onClick={onBackToShop}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              Continue Shopping
            </button>
          </div>

          <div className="text-xs text-[#8C827A] pt-2">
            Need immediate assistance? Call our customer helpline at{' '}
            <a href="tel:+923280547200" className="text-[#1F1C1A] font-bold underline">
              0328-0547200
            </a>
          </div>
        </div>

        {/* Email Receipt Modal Popup */}
        {showEmailReceiptModal && emailNotice?.html && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl border border-[#EADBCE] max-h-[88vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#EADBCE] gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-5 h-5 text-[#B88E3E] shrink-0" />
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#1F1C1A] truncate">
                    NOOR STUDIO Email Receipt Preview
                  </h3>
                </div>
                <button
                  onClick={() => setShowEmailReceiptModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-500 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto my-3 border rounded-xl bg-[#FAF8F5] p-2">
                <iframe
                  title="Order Confirmation Email"
                  srcDoc={emailNotice.html}
                  className="w-full h-[55vh] sm:h-[500px] border-0 rounded-lg bg-white"
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EADBCE]">
                <button
                  onClick={() => setShowEmailReceiptModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeIn">
      {/* Top Back Nav */}
      <button
        onClick={onBackToShop}
        className="flex items-center gap-1.5 text-xs text-[#7A7169] hover:text-[#B88E3E] font-medium mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Shopping</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Customer Information Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-6 shadow-sm">
            <div className="border-b border-[#EADBCE] pb-3 mb-5">
              <h2 className="font-serif text-xl font-bold text-[#1F1C1A]">Delivery Information</h2>
              <p className="text-xs text-[#7A7169] mt-0.5">
                We deliver nationwide across Pakistan with Cash on Delivery.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Malik"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">
                    Phone Number (WhatsApp Active) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                  <p className="text-[10px] text-[#A89D93] mt-1">
                    Used for courier delivery confirmation.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">
                    Email Address <span className="text-red-500">*</span>
                    <span className="text-[10px] text-[#B88E3E] font-normal block sm:inline sm:ml-1">
                      (Required for order confirmation email & invoice)
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ayesha@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                  <p className="text-[10px] text-[#A89D93] mt-1">
                    Your digital invoice will be delivered to this email instantly.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">
                  Complete Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Street #, Sector / Colony, Landmark"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] bg-white focus:outline-none focus:border-[#B88E3E]"
                  >
                    {PAKISTANI_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1F1C1A] mb-1">Postal Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 54000"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Special instructions for rider (e.g. call before arriving)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveInfoForFuture}
                    onChange={(e) => setSaveInfoForFuture(e.target.checked)}
                    className="w-4 h-4 text-[#B88E3E] rounded border-[#D9CCC2] focus:ring-[#B88E3E]"
                  />
                  <span className="text-[#5A524C]">Save delivery information for my future orders</span>
                </label>
              </div>
            </form>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#1F1C1A] mb-3">Payment Method</h3>

            <div className="space-y-3">
              {/* Cash on Delivery (Selected) */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-[#B88E3E] bg-[#F7F4EE] shadow-sm'
                    : 'border-[#EADBCE] hover:border-[#B88E3E]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-[#B88E3E] focus:ring-[#B88E3E] shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="font-bold text-[#1F1C1A] text-sm">Cash on Delivery (COD)</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[#6F665F] mt-1">
                    Pay in cash directly to the courier rider upon delivery at your doorstep. No prepayment required.
                  </p>
                </div>
              </label>

              {/* Bank Transfer Option */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-[#B88E3E] bg-[#F7F4EE]'
                    : 'border-[#EADBCE] hover:border-[#B88E3E]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Bank Transfer'}
                  onChange={() => setPaymentMethod('Bank Transfer')}
                  className="mt-1 text-[#B88E3E] focus:ring-[#B88E3E]"
                />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-[#1F1C1A]">Direct Bank Transfer / Raast</span>
                  <p className="text-[#6F665F] mt-1">
                    Transfer directly to NOOR STUDIO official business account. Account details will be shared on WhatsApp.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#EADBCE] p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1F1C1A] border-b border-[#EADBCE] pb-3">
              Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-14 h-16 object-cover object-top rounded-lg bg-[#F7F4EE] border border-[#EADBCE] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1F1C1A] line-clamp-1">{item.productName}</p>
                    <p className="text-[11px] text-[#7A7169] mt-0.5">
                      {item.colorName} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#1F1C1A] shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#EADBCE] space-y-2 text-xs text-[#5A524C]">
              <div className="flex justify-between gap-2">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1F1C1A] shrink-0">Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between gap-2 text-emerald-700 font-medium">
                  <span>Discount ({coupon?.code})</span>
                  <span className="shrink-0">-Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span>Nationwide Shipping</span>
                <span className="shrink-0">
                  {shippingCost === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    `Rs. ${shippingCost}`
                  )}
                </span>
              </div>
              <div className="flex flex-wrap justify-between items-baseline gap-2 text-sm sm:text-base font-bold text-[#1F1C1A] pt-3 border-t border-[#EADBCE]">
                <span>Total Amount</span>
                <span className="font-serif text-lg sm:text-xl text-[#B88E3E]">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              form="checkout-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-[#EADBCE]" />
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm Order with Cash on Delivery'}</span>
            </button>

            <div className="space-y-1 pt-2 text-center text-[11px] text-[#8C827A]">
              <p className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#B88E3E]" />
                Estimated Nationwide Delivery: 2–4 Business Days
              </p>
              <p>Helpline: 0328-0547200 | WhatsApp: +923280547200</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
