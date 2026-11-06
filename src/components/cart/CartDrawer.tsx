import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingCost,
    discount,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 5000;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#EADBCE]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#EADBCE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B88E3E]" />
              <h3 className="font-serif text-lg font-bold text-[#1F1C1A]">
                Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-3.5 bg-[#F4EFEB] border-b border-[#EADBCE] text-xs">
            <div className="flex items-center justify-between mb-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-[#1F1C1A]">
                <Truck className="w-4 h-4 text-[#B88E3E]" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-semibold">🎉 You unlocked FREE Nationwide Delivery!</span>
                ) : (
                  <span>
                    Add <strong className="text-[#B88E3E]">Rs. {amountNeededForFreeShipping.toLocaleString()}</strong> more for FREE Shipping!
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#8C827A]">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#D9CCC2]/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B88E3E] transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F2ECE6] flex items-center justify-center text-[#A89D93]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-lg font-semibold text-[#1F1C1A]">Your shopping bag is empty</p>
                <p className="text-xs text-[#7A7169] max-w-xs">
                  Discover our ready-to-wear luxury pret, festive organza, and winter velvet collections.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2.5 rounded-lg bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-xl bg-white border border-[#EADBCE] shadow-sm relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-24 object-cover object-top rounded-lg bg-[#F7F4EE] shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-xs font-bold text-[#1F1C1A] line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Variations */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#6F665F]">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: item.colorHex }}
                          />
                          {item.colorName}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-[#1F1C1A]">Size: {item.size}</span>
                      </div>
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-[#D9CCC2] rounded-md bg-[#FAF8F5]">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-semibold hover:bg-white transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[#1F1C1A]">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-semibold hover:bg-white transition disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#1F1C1A]">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#EADBCE] space-y-3.5">
              {/* Coupon Form */}
              {coupon ? (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{coupon.code}</strong> applied (-Rs. {discount.toLocaleString()})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. NOOR10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#D9CCC2] text-xs uppercase placeholder:normal-case focus:outline-none focus:border-[#B88E3E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#5A524C] pt-2 border-t border-[#F2ECE6]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F1C1A]">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Nationwide Delivery</span>
                  <span>{shippingCost === 0 ? <strong className="text-emerald-700">FREE</strong> : `Rs. ${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1F1C1A] pt-2 border-t border-[#EADBCE]">
                  <span>Total Amount (PKR)</span>
                  <span className="font-serif text-base text-[#B88E3E]">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Primary Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Cash on Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#8C827A]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure Checkout | Pay upon arrival</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
