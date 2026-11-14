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
  const { user } = useAuth();
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
      <div className="bg-[#1F1C1A] text-[#FAF8F5] text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-1.5 sm:gap-2 text-center lg:text-left">
          <p className="font-light tracking-wide text-[11px] sm:text-xs flex items-center justify-center gap-2 leading-snug">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E89A97] animate-pulse shrink-0"></span>
            <span>
              {settings.announcement || '✨ Free Nationwide Delivery on Orders Above Rs. 5,000 | Cash on Delivery Available'}
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs font-medium text-[#EADBCE]">
            <a
              href={`tel:+92${(settings.helpline || '0328-0547200').replace(/[^0-9]/g, '').replace(/^0/, '')}`}
              className="hover:text-white transition flex items-center gap-1 whitespace-nowrap"
            >
              <Phone className="w-3 h-3 text-[#E89A97] shrink-0" />
              <span>Helpline: {settings.helpline || '0328-0547200'}</span>
            </a>
            <span className="text-[#555] hidden xs:inline">|</span>
            <a
              href={`https://wa.me/${(settings.whatsapp || '+923280547200').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] transition flex items-center gap-1 font-semibold whitespace-nowrap"
            >
              WhatsApp Support
            </a>
            <span className="text-[#555]">|</span>
            <button
              onClick={() => handleNavClick('tracking')}
              className="hover:text-white transition underline underline-offset-2 whitespace-nowrap"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16 sm:h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button
              onClick={openSearchModal}
              className="p-1.5 sm:p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition"
              aria-label="Search products"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* NOOR STUDIO Brand Logo */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
            onClick={() => handleNavClick('home')}
          >
            <img
              src="/assets/aistudio/logo_8d8d5177.jpeg"
              alt="NOOR STUDIO"
              className="h-8 sm:h-11 lg:h-12 w-auto object-contain rounded-lg shadow-sm border border-[#EADBCE] group-hover:scale-105 transition-transform duration-300 bg-black shrink-0"
            />
            <div className="flex flex-col items-start min-w-0">
              <span className="font-serif text-sm xs:text-base sm:text-2xl lg:text-3xl tracking-[0.1em] sm:tracking-[0.18em] font-bold text-[#1F1C1A] uppercase leading-tight whitespace-nowrap">
                NOOR STUDIO
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C827A] font-medium hidden sm:block truncate">
                Wear Your Elegance Style Of Excellence
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-sm mx-6 xl:mx-10">
            <div
              onClick={openSearchModal}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-full border border-[#E0D5CB] bg-[#F4EFEB]/70 text-[#7A7169] text-sm cursor-pointer hover:border-[#C5A059] hover:bg-white transition"
            >
              <Search className="w-4 h-4 text-[#A89D93] shrink-0" />
              <span className="font-light truncate">Search luxury pret, velvet, chiffon...</span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 shrink-0">
            {/* Account */}
            <button
              onClick={() => {
                if (user) {
                  handleNavClick('account');
                } else {
                  openAuthModal();
                }
              }}
              className="p-1.5 sm:p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition flex items-center gap-1.5"
              aria-label="Customer account"
              title={user ? `Signed in as ${user.displayName || user.email}` : 'Customer Sign In'}
            >
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs font-medium hidden md:inline">
                {user ? (user.displayName ? user.displayName.split(' ')[0] : 'Account') : 'Sign In'}
              </span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavClick('wishlist')}
              className="p-1.5 sm:p-2 text-[#1F1C1A] hover:text-[#B88E3E] transition relative"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 rounded-full bg-[#E89A97] text-[#1F1C1A] font-bold text-[10px] flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="py-1.5 sm:py-2 px-2.5 sm:px-3.5 text-[#FAF8F5] bg-[#1F1C1A] hover:bg-[#B88E3E] rounded-full transition flex items-center gap-1.5 sm:gap-2 shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EADBCE]" />
              <span className="text-xs font-semibold">{totalItems}</span>
            </button>
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex flex-wrap items-center justify-center gap-x-4 xl:gap-x-6 gap-y-1.5 py-2.5 xl:py-3 border-t border-[#EADBCE]/50 text-[11px] xl:text-[13px] font-medium tracking-wider uppercase text-[#332F2B]">
          <button
            onClick={() => handleNavClick('home')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              currentView === 'home' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNavClick('shop', 'New Arrivals')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              selectedCategory === 'New Arrivals' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            New Arrivals
          </button>

          <button
            onClick={() => handleNavClick('shop', 'Stitched')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              selectedCategory === 'Stitched' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Stitched
          </button>

          <button
            onClick={() => handleNavClick('shop', 'Unstitched')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
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
              className={`hover:text-[#B88E3E] transition py-1 flex items-center gap-1 whitespace-nowrap ${
                selectedCategory === 'Summer Wear' ? 'text-[#B88E3E] font-semibold' : ''
              }`}
            >
              Summer Wear
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {summerDropdownOpen && (
              <div className="absolute top-full left-0 w-44 bg-white shadow-xl rounded-md border border-[#EADBCE] py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', null)}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block font-medium"
                >
                  All Summer Wear
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', '1 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  1 Piece
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', '2 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  2 Piece
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Summer Wear', '3 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  3 Piece
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
              className={`hover:text-[#B88E3E] transition py-1 flex items-center gap-1 whitespace-nowrap ${
                selectedCategory === 'Winter Wear' ? 'text-[#B88E3E] font-semibold' : ''
              }`}
            >
              Winter Wear
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {winterDropdownOpen && (
              <div className="absolute top-full left-0 w-44 bg-white shadow-xl rounded-md border border-[#EADBCE] py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', null)}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block font-medium"
                >
                  All Winter Wear
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', '1 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  1 Piece
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', '2 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  2 Piece
                </button>
                <button
                  onClick={() => handleNavClick('shop', 'Winter Wear', '3 Piece')}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF8F5] hover:text-[#B88E3E] transition block"
                >
                  3 Piece
                </button>
              </div>
            )}
          </div>

          {/* 6. Casual Wear */}
          <button
            onClick={() => handleNavClick('shop', 'Casual Wear')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              selectedCategory === 'Casual Wear' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Casual Wear
          </button>

          {/* 7. Formal Wear */}
          <button
            onClick={() => handleNavClick('shop', 'Formal Wear')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              selectedCategory === 'Formal Wear' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Formal Wear
          </button>

          {/* 8. Wedding Wear */}
          <button
            onClick={() => handleNavClick('shop', 'Wedding Wear')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              selectedCategory === 'Wedding Wear' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Wedding Wear
          </button>

          {/* 9. Bottoms */}
          <button
            onClick={() => handleNavClick('shop', 'Bottoms')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              selectedCategory === 'Bottoms'
                ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]'
                : ''
            }`}
          >
            Bottoms
          </button>

          {/* 10. Sale */}
          <button
            onClick={() => handleNavClick('shop', 'Sale')}
            className="hover:text-red-700 transition py-1 text-red-600 font-semibold flex items-center gap-1 whitespace-nowrap"
          >
            <span>Sale</span>
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">HOT</span>
          </button>

          <button
            onClick={() => handleNavClick('contact')}
            className={`hover:text-[#B88E3E] transition py-1 relative whitespace-nowrap ${
              currentView === 'contact' ? 'text-[#B88E3E] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#B88E3E]' : ''
            }`}
          >
            Contact Us
          </button>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EADBCE] bg-[#FAF8F5] px-4 sm:px-6 py-4 sm:py-5 space-y-4 max-h-[82vh] overflow-y-auto animate-fadeIn">

          <div className="space-y-1 text-sm font-medium uppercase tracking-wider text-[#1F1C1A]">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>Home</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'New Arrivals')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>1. New Arrivals</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'Stitched')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>2. Stitched</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
            <button
              onClick={() => handleNavClick('shop', 'Unstitched')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>3. Unstitched</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>

            {/* 4. Summer Wear Accordion */}
            <div className="border-b border-[#EADBCE]/50">
              <button
                type="button"
                className="w-full py-2.5 min-h-[42px] flex justify-between items-center text-left uppercase tracking-wider"
                onClick={() => setSummerDropdownOpen(!summerDropdownOpen)}
              >
                <span>4. Summer Wear</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${summerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {summerDropdownOpen && (
                <div className="pl-4 pb-2.5 space-y-1 text-xs normal-case text-[#5A524C]">
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Summer Wear', null)}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] font-medium block"
                  >
                    All Summer Wear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Summer Wear', '1 Piece')}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] block"
                  >
                    1 Piece
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Summer Wear', '2 Piece')}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] block"
                  >
                    2 Piece
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Summer Wear', '3 Piece')}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] block"
                  >
                    3 Piece
                  </button>
                </div>
              )}
            </div>

            {/* 5. Winter Wear Accordion */}
            <div className="border-b border-[#EADBCE]/50">
              <button
                type="button"
                className="w-full py-2.5 min-h-[42px] flex justify-between items-center text-left uppercase tracking-wider"
                onClick={() => setWinterDropdownOpen(!winterDropdownOpen)}
              >
                <span>5. Winter Wear</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${winterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {winterDropdownOpen && (
                <div className="pl-4 pb-2.5 space-y-1 text-xs normal-case text-[#5A524C]">
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Winter Wear', null)}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] font-medium block"
                  >
                    All Winter Wear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Winter Wear', '1 Piece')}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] block"
                  >
                    1 Piece
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Winter Wear', '2 Piece')}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] block"
                  >
                    2 Piece
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('shop', 'Winter Wear', '3 Piece')}
                    className="w-full text-left py-1.5 hover:text-[#B88E3E] block"
                  >
                    3 Piece
                  </button>
                </div>
              )}
            </div>

            {/* 6. Casual Wear */}
            <button
              onClick={() => handleNavClick('shop', 'Casual Wear')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>6. Casual Wear</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>

            {/* 7. Formal Wear */}
            <button
              onClick={() => handleNavClick('shop', 'Formal Wear')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>7. Formal Wear</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>

            {/* 8. Wedding Wear */}
            <button
              onClick={() => handleNavClick('shop', 'Wedding Wear')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>8. Wedding Wear</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>

            {/* 9. Bottoms */}
            <button
              onClick={() => handleNavClick('shop', 'Bottoms')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>9. Bottoms</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>

            {/* 10. Sale */}
            <button
              onClick={() => handleNavClick('shop', 'Sale')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center text-red-600 font-bold"
            >
              <span>10. Sale (Up to 40% Off)</span>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className="w-full text-left py-2.5 min-h-[42px] border-b border-[#EADBCE]/50 flex justify-between items-center"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-4 h-4 text-[#A89D93]" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#EADBCE] text-xs text-[#6F665F] space-y-2">
            <p className="font-semibold text-[#1F1C1A]">Customer Care</p>
            <p>Helpline: <a href="tel:+923280547200" className="text-[#1F1C1A] underline">0328-0547200</a></p>
            <p>WhatsApp: <a href="https://wa.me/923280547200" target="_blank" rel="noreferrer" className="text-[#25D366] font-semibold underline">0328-0547200</a></p>
            <p>Email: <a href="mailto:noorstudio16mpa@gmail.com" className="text-[#1F1C1A] underline">noorstudio16mpa@gmail.com</a></p>
          </div>
        </div>
      )}
    </header>
  );
};
