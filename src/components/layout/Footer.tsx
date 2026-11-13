import React, { useState } from 'react';
import { Phone, Mail, Globe, Send, MessageCircle, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  onNavigate: (view: string, category?: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#191715] text-[#FAF8F5] pt-12 sm:pt-16 pb-8 border-t border-[#332F2B]">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 border-b border-[#2D2825]">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#262220] flex items-center justify-center text-[#E89A97]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">Nationwide Express Delivery</p>
              <p className="text-xs text-[#A89D93] mt-0.5">PostEx COD across all cities of Pakistan</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#262220] flex items-center justify-center text-[#C5A059]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">100% Authentic Fabric</p>
              <p className="text-xs text-[#A89D93] mt-0.5">Premium Lawn, Pure Raw Silk & Velvet</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#262220] flex items-center justify-center text-[#E89A97]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">7-Day Easy Exchange</p>
              <p className="text-xs text-[#A89D93] mt-0.5">Hassle-free size & color swaps</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#262220] flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">Dedicated Helpline</p>
              <p className="text-xs text-[#A89D93] mt-0.5">Direct WhatsApp & Voice Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/assets/aistudio/logo_8d8d5177.jpeg"
                alt="NOOR STUDIO Logo"
                className="h-14 w-auto object-contain rounded-lg border border-[#3E3834] shadow-md bg-black"
              />
              <div>
                <h3 className="font-serif text-2xl tracking-[0.2em] font-bold uppercase text-[#FAF8F5]">
                  NOOR STUDIO
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">
                  Wear Your Elegance Style Of Excellence
                </p>
              </div>
            </div>
            <p className="text-xs text-[#B5ABA1] leading-relaxed max-w-sm">
              NOOR STUDIO celebrates the timeless grace and royal heritage of Pakistani women&apos;s haute couture.
              From handcrafted organza peshwas to ready-to-wear luxury lawn and rich micro-velvet shawls, every stitch
              radiates confidence and sublime craftsmanship.
            </p>
            <div className="pt-2 space-y-2 text-xs text-[#D8CCC4]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E89A97] shrink-0" />
                <span>Helpline: </span>
                <a
                  href={`tel:+92${settings.helpline ? settings.helpline.replace(/^0/, '') : '3284454746'}`}
                  className="text-white hover:text-[#C5A059] font-medium transition"
                >
                  {settings.helpline || '03284454746'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>WhatsApp: </span>
                <a
                  href="https://wa.me/923284454746"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] font-medium hover:underline transition"
                >
                  +923284454746
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E89A97] shrink-0" />
                <span>Email: </span>
                <a
                  href={`mailto:${settings.email || 'support@noorstudio.pk'}`}
                  className="text-white hover:text-[#C5A059] font-medium transition"
                >
                  {settings.email || 'support@noorstudio.pk'}
                </a>
              </div>
            </div>
          </div>

          {/* Shop Categories - Exact Sequence 1 to 10 */}
          <div className="space-y-3">
            <p className="font-serif text-sm tracking-wider uppercase font-semibold text-white">Collections</p>
            <ul className="space-y-2 text-xs text-[#B5ABA1]">
              <li>
                <button onClick={() => onNavigate('shop', 'New Arrivals')} className="hover:text-white transition">
                  1. New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Stitched')} className="hover:text-white transition">
                  2. Stitched
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Unstitched')} className="hover:text-white transition">
                  3. Unstitched
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Summer Wear')} className="hover:text-white transition">
                  4. Summer Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Winter Wear')} className="hover:text-white transition">
                  5. Winter Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Casual Wear')} className="hover:text-white transition">
                  6. Casual Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Formal Wear')} className="hover:text-white transition">
                  7. Formal Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Wedding Wear')} className="hover:text-white transition">
                  8. Wedding Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Bottoms')} className="hover:text-white transition">
                  9. Bottoms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', 'Sale')} className="text-red-400 hover:text-red-300 font-semibold transition">
                  10. Sale (Hot Offers)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <p className="font-serif text-sm tracking-wider uppercase font-semibold text-white">Policies & Care</p>
            <ul className="space-y-2 text-xs text-[#B5ABA1]">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faqs')} className="hover:text-white transition">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping-policy')} className="hover:text-white transition">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('returns-policy')} className="hover:text-white transition">
                  Return and Exchange Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-and-conditions')} className="hover:text-white transition">
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-white transition">
                  Track Your Order
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <p className="font-serif text-sm tracking-wider uppercase font-semibold text-white">Join The VIP List</p>
            <p className="text-xs text-[#B5ABA1] leading-relaxed">
              Subscribe to receive private preview drops, festive discounts, and a flat 10% voucher code.
            </p>
            {newsletterSubscribed ? (
              <div className="p-3 bg-[#262220] rounded border border-[#C5A059] text-xs text-[#EADBCE]">
                <p className="font-semibold text-white">Thank you for subscribing!</p>
                <p className="mt-1">Use coupon code <span className="text-[#C5A059] font-bold">NOOR10</span> at checkout for 10% off.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-3.5 pr-20 py-2.5 rounded bg-[#262220] border border-[#403B37] text-xs text-white placeholder-[#787069] focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#C5A059] text-[#191715] rounded text-xs font-semibold hover:bg-white transition flex items-center gap-1"
                  >
                    <span>Join</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-[#787069]">We respect your privacy. Unsubscribe anytime.</p>
              </form>
            )}

            <div className="pt-2">
              <p className="text-xs font-semibold text-white mb-2">Payment Methods</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-[#262220] border border-[#3E3834] font-medium text-[#FAF8F5]">
                  💵 Cash on Delivery
                </span>
                <span className="px-2.5 py-1 rounded bg-[#262220] border border-[#3E3834] font-medium text-[#FAF8F5]">
                  🏦 Bank Transfer
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#262220] text-center sm:flex sm:justify-between sm:items-center text-xs text-[#787069]">
        <p>© {new Date().getFullYear()} NOOR STUDIO. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-[#E89A97] inline fill-current" /> for Pakistani Women Worldwide.
        </p>
      </div>
    </footer>
  );
};
