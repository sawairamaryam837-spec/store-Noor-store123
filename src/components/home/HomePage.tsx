import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  ChevronRight,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { Product } from '../../types';

interface HomePageProps {
  onNavigateToShop: (category?: string | null, subcategory?: string | null) => void;
  onSelectProduct: (product: Product, colorName?: string) => void;
}

const HERO_SLIDES = [
  {
    title: 'Heer Organza Embroidered Lehenga',
    subtitle: 'Signature Wedding Wear • Design #196',
    price: 'Rs. 7,500',
    tag: 'Bridal & Festive',
    image: '/assets/aistudio/weddingseason__3__6ca9845d.jpeg',
    category: 'Wedding Wear',
  },
  {
    title: 'Maria.B Luxury Wedding Edition',
    subtitle: 'Chiffon & Malai Tie-Dye Organza with Adda Work',
    price: 'Rs. 6,000',
    tag: 'Haute Couture',
    image: '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION_e659eca1.jpeg',
    category: 'Formal Wear',
  },
  {
    title: 'Iznik Embroidered Chiffon Suit',
    subtitle: 'Adda Neckline & Heavy Embroidered Dupatta 3PC',
    price: 'Rs. 5,500',
    tag: 'Exclusive Release',
    image: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK_23851c85.jpeg',
    category: 'Formal Wear',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToShop, onSelectProduct }) => {
  const { products, categories } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSeasonTab, setActiveSeasonTab] = useState<'all' | 'summer' | 'winter' | 'formal' | 'sale'>('all');
  const [activeSeasonPiece, setActiveSeasonPiece] = useState<'All' | '1 Piece' | '2 Piece' | '3 Piece'>('All');
  const [activeTrousersTab, setActiveTrousersTab] = useState<'All' | 'Trousers' | 'Pajamas' | 'Shalwar' | 'Shalwar Kameez'>('All');

  // Auto-advance hero slides every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const newArrivals = products.filter((p) => p.isNewArrival || p.category === 'New Arrivals').slice(0, 8);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const formalWear = products.filter((p) => p.category === 'Formal Wear' || p.category === 'Wedding Wear').slice(0, 8);

  // Filtered products for interactive showcase tab
  const tabFilteredProducts = products.filter((p) => {
    let matchSeason = true;
    if (activeSeasonTab === 'summer') matchSeason = p.season === 'Summer' || p.category === 'Summer Wear';
    else if (activeSeasonTab === 'winter') matchSeason = p.season === 'Winter' || p.category === 'Winter Wear';
    else if (activeSeasonTab === 'formal') matchSeason = p.category === 'Formal Wear' || p.category === 'Wedding Wear';
    else if (activeSeasonTab === 'sale') matchSeason = (p.salePrice && p.salePrice < p.regularPrice) || p.category === 'Sale';
    if (!matchSeason) return false;

    if ((activeSeasonTab === 'summer' || activeSeasonTab === 'winter') && activeSeasonPiece !== 'All') {
      if (p.subcategory !== activeSeasonPiece && !p.type?.includes(activeSeasonPiece)) return false;
    }
    return true;
  }).slice(0, 8);

  // Trousers, Pajamas, Shalwar & Shalwar Kameez products
  const trousersShowcaseProducts = products.filter((p) => {
    const isTrousersShalwar =
      p.category === 'Trousers & Shalwar' ||
      p.subcategory === 'Trousers' ||
      p.subcategory === 'Pajamas' ||
      p.subcategory === 'Shalwar' ||
      p.subcategory === 'Shalwar Kameez' ||
      p.name.toLowerCase().includes('trouser') ||
      p.name.toLowerCase().includes('pajama') ||
      p.name.toLowerCase().includes('shalwar');
    if (!isTrousersShalwar) return false;

    if (activeTrousersTab === 'All') return true;
    if (activeTrousersTab === 'Trousers') return p.subcategory === 'Trousers' || p.name.toLowerCase().includes('trouser');
    if (activeTrousersTab === 'Pajamas') return p.subcategory === 'Pajamas' || p.name.toLowerCase().includes('pajama');
    if (activeTrousersTab === 'Shalwar') return (p.subcategory === 'Shalwar' || p.name.toLowerCase().includes('shalwar')) && !p.name.toLowerCase().includes('kameez');
    if (activeTrousersTab === 'Shalwar Kameez') return p.subcategory === 'Shalwar Kameez' || p.name.toLowerCase().includes('kameez');
    return true;
  }).slice(0, 8);

  const currentHero = HERO_SLIDES[activeSlide];

  return (
    <div className="space-y-14 sm:space-y-20 animate-fadeIn pb-16">
      {/* TOP TICKER URGENCY BANNER */}
      <div className="bg-gradient-to-r from-[#1F1C1A] via-[#332A26] to-[#1F1C1A] text-[#F3EFEA] py-2 px-4 text-center text-[11px] sm:text-xs font-medium border-b border-[#C5A059]/40 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>
          <strong>RAMADAN & FESTIVE EXHIBITION:</strong> Free PostEx Courier COD nationwide on orders above Rs. 3,500. Use code <span className="bg-[#C5A059] text-black px-1.5 py-0.2 rounded font-bold">NOOR10</span> for extra 10% off!
        </span>
      </div>

      {/* LUXURY DYNAMIC HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F3EFEA] border-b border-[#EADBCE]">
        {/* Ambient blush glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F5D8D6]/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EAD4BA]/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#EADBCE] text-xs font-semibold text-[#B88E3E] uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#E89A97]" />
                <span>NOOR STUDIO • {currentHero.tag}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1F1C1A] leading-[1.15] tracking-tight">
                Wear Your Elegance, <br className="hidden sm:block" />
                <span className="italic font-normal text-[#B88E3E]">Style of Excellence.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Discover bespoke Pakistani haute couture from Iznik, Maria.B, Heer, and Breeze. Handcrafted zardozi, ethereal organza dupattas, and ready-to-wear luxury lawn stitched to sublime perfection with Cash on Delivery across Pakistan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigateToShop(currentHero.category)}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#EADBCE]" />
                  <span>Shop Featured Couture</span>
                </button>
                <button
                  onClick={() => onNavigateToShop('New Arrivals')}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1F1C1A] border border-[#D9CCC2] text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Explore New Arrivals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Helpline & WhatsApp Info */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#7A7169]">
                <a
                  href="tel:03284454746"
                  className="flex items-center gap-1.5 hover:text-[#B88E3E] font-medium"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#B88E3E]" />
                  <span>Helpline: <strong>03284454746</strong></span>
                </a>
                <span className="hidden sm:inline text-gray-300">•</span>
                <a
                  href="https://wa.me/923284454746"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Instant WhatsApp Order</span>
                </a>
              </div>

              {/* Interactive Slide Pills */}
              <div className="pt-3 flex items-center justify-center lg:justify-start gap-2">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`text-left px-3 py-1.5 rounded-lg border transition-all text-[11px] ${
                      idx === activeSlide
                        ? 'border-[#B88E3E] bg-white shadow-sm font-bold text-[#1F1C1A]'
                        : 'border-[#D9CCC2]/70 bg-white/60 hover:bg-white text-[#7A7169]'
                    }`}
                  >
                    <span>0{idx + 1}. {slide.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Hero Images Composition (5 Cols) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#F7F4EE]">
                <img
                  src={currentHero.image}
                  alt={currentHero.title}
                  className="w-full h-full object-cover object-top transition duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#EADBCE] bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                    {currentHero.subtitle}
                  </span>
                  <p className="font-serif text-lg sm:text-xl font-bold mt-1.5">{currentHero.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-[#EADBCE]">{currentHero.price}</p>
                    <span className="text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                      Ready to Ship
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating secondary badge */}
              <div className="absolute -bottom-5 -left-4 sm:left-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#EADBCE] shadow-xl text-left hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#B88E3E] flex items-center justify-center text-[#B88E3E]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif text-xs font-bold text-[#1F1C1A]">100% Authentic Designer Ensembles</p>
                  <p className="text-[10px] text-[#7A7169]">Lawn • Chiffon • Rice Karandi • Khaddar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESIGNER BRANDS TICKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B88E3E]" />
            <span className="font-serif text-xs font-bold text-[#1F1C1A] uppercase tracking-wider">
              Featured Designer Houses:
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-[#7A7169]">
            <span className="hover:text-[#B88E3E] font-semibold">MARIA.B</span>
            <span className="text-gray-300">•</span>
            <span className="hover:text-[#B88E3E] font-semibold">IZNIK</span>
            <span className="text-gray-300">•</span>
            <span className="hover:text-[#B88E3E] font-semibold">HEER COLLECTION</span>
            <span className="text-gray-300">•</span>
            <span className="hover:text-[#B88E3E] font-semibold">BREEZE KARANDI</span>
            <span className="text-gray-300">•</span>
            <span className="hover:text-[#B88E3E] font-semibold">ETHNIC SILK</span>
            <span className="text-gray-300">•</span>
            <span className="hover:text-[#B88E3E] font-semibold">MORASHI KHADDAR</span>
            <span className="text-gray-300">•</span>
            <span className="hover:text-[#B88E3E] font-semibold">ZESH CO-ORD</span>
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-[#EADBCE]/80 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#B88E3E] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1F1C1A]">Premium Quality</p>
              <p className="text-[11px] text-[#7A7169] mt-0.5">Artisanal stitching & zari hand-embroidery</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EADBCE]/80 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#B88E3E] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1F1C1A]">Fast Nationwide Delivery</p>
              <p className="text-[11px] text-[#7A7169] mt-0.5">PostEx COD across all cities of Pakistan</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EADBCE]/80 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EADBCE] flex items-center justify-center text-[#E89A97] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1F1C1A]">Easy 7-Day Exchange</p>
              <p className="text-[11px] text-[#7A7169] mt-0.5">Hassle-free size and color swap</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EADBCE]/80 shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#1F1C1A]">Cash on Delivery</p>
              <p className="text-[11px] text-[#7A7169] mt-0.5">Inspect & pay right at your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Curated Wardrobe
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Shop By Category
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop(null)}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All Collections</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToShop(cat.name)}
              className="group cursor-pointer flex flex-col items-center text-center space-y-2"
            >
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#F7F4EE] border border-[#EADBCE] group-hover:border-[#B88E3E] group-hover:shadow-md transition duration-300">
                <img
                  src={cat.image || '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION_e659eca1.jpeg'}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition" />
              </div>
              <span className="font-serif text-[11px] sm:text-xs font-bold text-[#1F1C1A] group-hover:text-[#B88E3E] transition leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Fresh Haute Couture
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop('New Arrivals')}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore All New Arrivals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* INTERACTIVE SEASONAL & FESTIVE CURATION (CATCHY SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-[#EADBCE] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#B88E3E] text-[10px] font-bold text-[#B88E3E] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Live Stock Availability</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Seasonal Trends & Ready-to-Ship
            </h2>
            <p className="text-xs text-[#7A7169] mt-1">
              Select your preferred season or occasion to view authentic designer pieces in stock.
            </p>
          </div>

          {/* Interactive Season Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Designs' },
                { id: 'summer', label: '☀️ Summer Lawn' },
                { id: 'winter', label: '❄️ Winter Khaddar' },
                { id: 'formal', label: '👑 Formal & Wedding' },
                { id: 'sale', label: '🔥 Festive Sale' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSeasonTab(tab.id as any);
                    setActiveSeasonPiece('All');
                  }}
                  className={`py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                    activeSeasonTab === tab.id
                      ? 'bg-[#1F1C1A] text-white shadow-md'
                      : 'bg-[#F4EBE1] hover:bg-[#EADBCE] text-[#4A423D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick 1 Piece, 2 Piece, 3 Piece selector for Summer and Winter */}
            {(activeSeasonTab === 'summer' || activeSeasonTab === 'winter') && (
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-full border border-[#EADBCE] sm:ml-2">
                <span className="text-[10px] font-bold text-[#7A7169] uppercase px-2">Piece:</span>
                {(['All', '1 Piece', '2 Piece', '3 Piece'] as const).map((piece) => (
                  <button
                    key={piece}
                    onClick={() => setActiveSeasonPiece(piece)}
                    className={`py-1 px-2.5 rounded-full text-[11px] font-semibold transition ${
                      activeSeasonPiece === piece
                        ? 'bg-[#B88E3E] text-white shadow-xs'
                        : 'text-[#5A524C] hover:text-[#1F1C1A]'
                    }`}
                  >
                    {piece}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tabFilteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* DEDICATED TROUSERS, PAJAMAS & SHALWAR KAMEEZ SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-[#EADBCE] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#B88E3E] text-[10px] font-bold text-[#B88E3E] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#B88E3E]" />
              <span>Wardrobe Essentials</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Trousers, Pajamas & Shalwar Kameez
            </h2>
            <p className="text-xs text-[#7A7169] mt-1">
              Tailored raw silk cigarette trousers, stretch malai pajamas, traditional pleated shalwars & matching 2PC suits.
            </p>
          </div>

          {/* Interactive Bottoms Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'All', label: 'All Essentials' },
              { id: 'Trousers', label: 'Trousers' },
              { id: 'Pajamas', label: 'Pajamas' },
              { id: 'Shalwar', label: 'Shalwars' },
              { id: 'Shalwar Kameez', label: 'Shalwar Kameez (2PC)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTrousersTab(tab.id as any)}
                className={`py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                  activeTrousersTab === tab.id
                    ? 'bg-[#1F1C1A] text-white shadow-md'
                    : 'bg-[#F4EBE1] hover:bg-[#EADBCE] text-[#4A423D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trousers & Shalwar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trousersShowcaseProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        {/* View full section button */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigateToShop('Trousers & Shalwar')}
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl border border-[#B88E3E] text-[#B88E3E] hover:bg-[#B88E3E] hover:text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <span>Explore All Trousers, Pajamas & Shalwar Kameez</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* SEASONAL PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1F1C1A] via-[#2F2926] to-[#1F1C1A] text-white p-8 sm:p-14 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059] text-[#191715] text-[11px] font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" />
              <span>Limited Time Festive Offer</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Up to 40% Off on Signature Embroidered Pret
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CCC4] leading-relaxed">
              Elevate your festive celebrations with royal organza dupattas, banarsi lehngas, and luxury lawn 3-piece suites.
              Use coupon code <strong className="text-white bg-[#C5A059]/30 px-1.5 py-0.5 rounded">NOOR10</strong> for an additional 10% off at checkout.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToShop('Sale')}
                className="py-3 px-8 rounded-xl bg-[#C5A059] hover:bg-white hover:text-[#191715] text-[#191715] text-xs font-bold uppercase tracking-wider transition shadow-lg"
              >
                Shop The Sale
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS & TRENDING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Customer Favorites
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Best Sellers
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop(null)}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* FORMAL & WEDDING LUXURY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Royal Wedding Couture
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Formal Wear & Peshwas
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop('Formal Wear')}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore Formal Wear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {formalWear.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* CUSTOMER TESTIMONIALS */}
      <section className="bg-[#F7F4EE] py-16 border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Loved by Women Nationwide
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Real Words from NOOR STUDIO Patrons
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-[#4A423D] italic leading-relaxed">
                &ldquo;Ordered the Zunaira 3-piece in Black for my sister&apos;s dholak in Lahore. The embroidery and raw silk
                quality were far superior to even high-end mall designers. Delivered via PostEx in 2 days!&rdquo;
              </p>
              <div>
                <p className="font-serif font-bold text-xs text-[#1F1C1A]">Zainab Tariq</p>
                <p className="text-[10px] text-[#8C827A]">Gulberg, Lahore</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-[#4A423D] italic leading-relaxed">
                &ldquo;The dynamic color switcher on the website is brilliant! I was torn between Maroon and Emerald for the velvet shawl,
                and seeing the exact photography helped so much. Flawless fitting.&rdquo;
              </p>
              <div>
                <p className="font-serif font-bold text-xs text-[#1F1C1A]">Areeba Sheikh</p>
                <p className="text-[10px] text-[#8C827A]">DHA, Karachi</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-[#4A423D] italic leading-relaxed">
                &ldquo;Cash on delivery was smooth. The rider called before arriving in Islamabad. The chikankari kurta fabric is so breathable
                and the lace detailing is heavenly. Definitely ordering again!&rdquo;
              </p>
              <div>
                <p className="font-serif font-bold text-xs text-[#1F1C1A]">Maryam Jahangir</p>
                <p className="text-[10px] text-[#8C827A]">F-7, Islamabad</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTAGRAM / LOOKBOOK GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
            @noorstudio.pk on Instagram
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#1F1C1A]">Styled by You</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK__3__b0971e8e.jpeg"
              alt="NOOR STUDIO Iznik Chiffon"
              className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="/assets/aistudio/Zesh_Essential_Co-ord_Printed_Silk_2PC_f1593680.jpeg"
              alt="NOOR STUDIO Silk Co-Ord"
              className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="/assets/aistudio/MARIA_B_COUTURE_COLLECTION_48007866.jpeg"
              alt="NOOR STUDIO Maria.B Couture"
              className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="/assets/aistudio/SILK_COLLECTION_2026_e0cd6ab7.jpeg"
              alt="NOOR STUDIO Silk Pret"
              className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
