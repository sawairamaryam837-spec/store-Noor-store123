import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Phone,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (sub: string | null) => void;
  openAuthModal: () => void;
  openSearchModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  openAuthModal,
  openSearchModal,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, isAdmin } = useAuth();
  const { settings } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [summerDropdownOpen, setSummerDropdownOpen] = useState(false);
  const [winterDropdownOpen, setWinterDropdownOpen] = useState(false);

  const handleNavClick = (view: string, category: string | null = null, subcategory: string | null = null) => {
    setCurrentView(view);
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EADBCE]/80 transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#1F1C1A] text-[#FAF8F5] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <p className="font-light tracking-wide text-xs flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E89A97] animate-pulse"></span>
            {settings.announcement || '✨ Free Nationwide Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available'}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-[#EADBCE]">
            <a
              href={`tel:+92${settings.helpline ? settings.helpline.replace(/^0/, '') : '3284454746'}`}
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <Phone className="w-3 h-3 text-[#E89A97]" />
              Helpline: {settings.helpline || '03284454746'}
            </a>
            <span className="text-[#555]">|</span>
            <a
              href="https://wa.me/923284454746"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] transition flex items-center gap-1 font-semibold"
            >
              WhatsApp Support
            </a>
            <span className="text-[#555]">|</span>
            <button
              onClick={() => handleNavClick('tracking')}
              className="hover:text-white transition underline underline-offset-2"
            >
              Track Order
            </button>
            <span className="text-[#555]">|</span>
            <button
              onClick={() => handleNavClick('admin')}
              className="px-2.5 py-0.5 rounded-full bg-[#C5A059] text-[#191715] hover:bg-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
              title="Open Admin Dashboard"
            >
              <ShieldCheck className="w-3 h-3 text-[#191715]" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={openSearchModal}
              className="p-2 ml-1 text-[#1F1C1A] hover:text-[#B88E3E] transition"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* NOOR STUDIO Brand Logo */}
          <div className="flex flex-col items-center sm:items-start cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.2em] font-semibold text-[#1F1C1A] uppercase">
              NOOR STUDIO
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C827A] -mt-1 font-medium hidden sm:block">
              {settings.tagline || 'Elegant Fashion, Timeless Confidence'}
            </span>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-10">
            <div
              onClick={openSearchModal}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-full border border-[#E0D5CB] bg-[#F4EFEB]/70 text-[#7A7169] text-sm cursor-pointer hover:border-[#C5A059] hover:bg-white transition"
            >
              <Search className="w-4 h-4 text-[#A89D93]" />
              <span className="font-light">Search luxury pret, velvet, chiffon...</span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Prominent Admin Panel Button */}
            <button
              onClick={() => handleNavClick('admin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1C1A] text-[#FAF8F5] hover:bg-[#B88E3E] text-xs font-semibold shadow-sm border border-[#C5A059]/40 transition group"
              title="Open NOOR STUDIO Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E89A97] group-hover:scale-110 transition-transform" />
              <span>Admin Panel</span>
            </button>

            {/* Account */}
            <button
              onClick={() => {
                if (user) {
                  handleNavClick('account');
                } else {
                  openAuthModal();
                }
              }}
              className="p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition flex items-center gap-1.5"
              aria-label="Customer account"
              title={user ? `Signed in as ${user.displayName || user.email}` : 'Customer Sign In'}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-xs font-medium hidden md:inline">
                {user ? (user.displayName ? user.displayName.split(' ')[0] : 'Account') : 'Sign In'}
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('wishlist')}
              className="p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition relative"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E89A97] text-[#1F1C1A] font-bold text-[10px] flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#FAF8F5] bg-[#1F1C1A] hover:bg-[#B88E3E] rounded-full transition flex items-center gap-2 px-3.5 shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#EADBCE]" />
              <span className="text-xs font-semibold">{totalItems}</span>
            </button>
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-center space-x-7 py-3 border-t border-[#EADBCE]/50 text-[13px] font-medium tracking-wider uppercase text-[#332F2B]">
          <button
            onClick={() => handleNavClick('home')}
            className={`hover:text-[#B88E3E] transition py-1 relative ${
              currentView === 'home' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('shop', 'New Arrivals')}
            className={`hover:text-[#B88E3E] transition py-1 relative ${
              selectedCategory === 'New Arrivals' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            New Arrivals
          </button>

          <button
            onClick={() => handleNavClick('shop', 'Stitched')}
            className={`hover:text-[#B88E3E] transition py-1 relative ${
              selectedCategory === 'Stitched' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Stitched
          </button>

          <button
            onClick={() => handleNavClick('shop', 'Unstitched')}
            className={`hover:text-[#B88E3E] transition py-1 relative ${
              selectedCategory === 'Unstitched' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Unstitched
          </button>

          {/* Summer Wear Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setSummerDropdownOpen(true)}
            onMouseLeave={() => setSummerDropdownOpen(false)}
          >
            <button
              onClick={() => handleNavClick('shop', 'Summer Wear')}
              className={`hover:text-[#B88E3E] transition py-1 flex items-center gap-1 ${
                selectedCategory === 'Summer Wear' ? 'text-[#B88E3E] font-semibold' : ''
              }`}
            >
              Summer Wear
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {summerDropdownOpen && (
              <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-md border border-[#EADBCE] py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', null)}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  All Summer Wear
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', '1 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  1 Piece (Kurti)
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', '2 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  2 Piece (Shirt + Trouser)
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', '3 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  3 Piece (Complete Suit)
                </button>
              </div>
            )}
          </div>

          {/* Winter Wear Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setWinterDropdownOpen(true)}
            onMouseLeave={() => setWinterDropdownOpen(false)}
          >
            <button
              onClick={() => handleNavClick('shop', 'Winter Wear')}
              className={`hover:text-[#B88E3E] transition py-1 flex items-center gap-1 ${
                selectedCategory === 'Winter Wear' ? 'text-[#B88E3E] font-semibold' : ''
              }`}
            >
              Winter Wear
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {winterDropdownOpen && (
              <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-md border border-[#EADBCE] py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', null)}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  All Winter Wear
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', '1 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  1 Piece (Woolen/Velvet Kurta)
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', '2 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  2 Piece (Warm Karandi Set)
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', '3 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  3 Piece (Shawl + Suit)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('shop', 'Formal Wear')}
            className={`hover:text-[#B88E3E] transition py-1 relative ${
              selectedCategory === 'Formal Wear' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Formal Wear
          </button>

          <button
            onClick={() => handleNavClick('shop', 'Sale')}
            className="hover:text-red-700 transition py-1 text-red-600 font-semibold flex items-center gap-1"
          >
            <span>Sale</span>
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">HOT</span>
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className={`hover:text-[#B88E3E] transition py-1 relative ${
              currentView === 'contact' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Contact Us
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`hover:text-[#B88E3E] transition py-1 relative flex items-center gap-1 font-bold text-[#B88E3E] ${
              currentView === 'admin' ? 'after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EADBCE] bg-[#FAF8F5] px-6 py-6 space-y-4 max-h-[80vh] overflow-y-auto animate-fadeIn">
          {/* Prominent Mobile Admin Portal Banner */}
          <div className="pb-3 border-b border-[#EADBCE]">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#1F1C1A] text-white hover:bg-[#B88E3E] text-xs font-bold flex items-center justify-between shadow-sm transition"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E89A97]" />
                <span>Admin Panel & Orders</span>
              </div>
              <span className="text-[10px] bg-[#C5A059] text-[#191715] px-2 py-0.5 rounded font-bold uppercase">
                Manage
              </span>
            </button>
          </div>

          <div className="space-y-2 text-sm font-medium uppercase tracking-wider text-[#1F1C1A]">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between"
            >
              <span>Home</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'New Arrivals')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between"
            >
              <span>New Arrivals</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'Stitched')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between"
            >
              <span>Stitched</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'Unstitched')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between"
            >
              <span>Unstitched</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>

            {/* Summer Wear Accordion */}
            <div className="py-2 border-b border-[#EADBCE]/50">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setSummerDropdownOpen(!summerDropdownOpen)}
              >
                <span>Summer Wear</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${summerDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {summerDropdownOpen && (
                <div className="pl-4 pt-2 space-y-2 text-xs normal-case text-[#5A524C]">
                  <p onClick={() => handleNavClick('shop', 'Summer Wear', null)} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    All Summer Wear
                  </p>
                  <p onClick={() => handleNavClick('shop', 'Summer Wear', '1 Piece')} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    1 Piece (Kurti)
                  </p>
                  <p onClick={() => handleNavClick('shop', 'Summer Wear', '2 Piece')} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    2 Piece (Shirt & Trouser)
                  </p>
                  <p onClick={() => handleNavClick('shop', 'Summer Wear', '3 Piece')} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    3 Piece (Suit with Dupatta)
                  </p>
                </div>
              )}
            </div>

            {/* Winter Wear Accordion */}
            <div className="py-2 border-b border-[#EADBCE]/50">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setWinterDropdownOpen(!winterDropdownOpen)}
              >
                <span>Winter Wear</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${winterDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {winterDropdownOpen && (
                <div className="pl-4 pt-2 space-y-2 text-xs normal-case text-[#5A524C]">
                  <p onClick={() => handleNavClick('shop', 'Winter Wear', null)} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    All Winter Wear
                  </p>
                  <p onClick={() => handleNavClick('shop', 'Winter Wear', '1 Piece')} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    1 Piece
                  </p>
                  <p onClick={() => handleNavClick('shop', 'Winter Wear', '2 Piece')} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    2 Piece
                  </p>
                  <p onClick={() => handleNavClick('shop', 'Winter Wear', '3 Piece')} className="py-1 cursor-pointer hover:text-[#B88E3E]">
                    3 Piece (Velvet & Shawls)
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('shop', 'Formal Wear')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between"
            >
              <span>Formal Wear</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'Sale')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between text-red-600 font-bold"
            >
              <span>Sale (Up to 40% Off)</span>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left py-2 border-b border-[#EADBCE]/50 flex justify-between text-[#B88E3E] font-bold"
            >
              <span>Admin Dashboard</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#EADBCE] text-xs text-[#6F665F] space-y-2">
            <p className="font-semibold text-[#1F1C1A]">Customer Care</p>
            <p>Helpline: <a href="tel:03284454746" className="text-[#1F1C1A] underline">03284454746</a></p>
            <p>WhatsApp: <a href="https://wa.me/923284454746" target="_blank" rel="noreferrer" className="text-[#25D366] font-semibold underline">+923284454746</a></p>
            <p>Email: <a href="mailto:support@noorstudio.pk" className="text-[#1F1C1A] underline">support@noorstudio.pk</a></p>
          </div>
        </div>
      )}
    </header>
  );
};
