import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Star,
  ChevronRight,
  Percent,
  Mail,
  CheckCircle2,
  Award,
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
    image: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK__3__b0971e8e.jpeg',
    category: 'Formal Wear',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToShop, onSelectProduct }) => {
  const { products, categories } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  // Summer & Winter piece filters
  const [activeSummerPiece, setActiveSummerPiece] = useState<'All' | '1 Piece' | '2 Piece' | '3 Piece'>('All');
  const [activeWinterPiece, setActiveWinterPiece] = useState<'All' | '1 Piece' | '2 Piece' | '3 Piece'>('All');

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Auto-advance hero slides every 5.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const activeProducts = products.filter((p) => p.isActive !== false);

  // Sorted categories strictly by order 1-10
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  // 3. New Arrivals (Latest drops, model-first)
  const newArrivals = activeProducts
    .filter((p) => p.isNewArrival || p.category === 'New Arrivals')
    .slice(0, 8);

  // 5. Featured Collections (Curated signature pieces)
  const featuredCollections = activeProducts
    .filter((p) => p.isFeatured)
    .slice(0, 8);

  // 6. Stitched Collection (Strictly Ready-to-Wear Stitched items only)
  const stitchedCollection = activeProducts
    .filter(
      (p) =>
        p.isStitched === true &&
        (p.category === 'Stitched' || p.additionalCategories?.includes('Stitched'))
    )
    .sort((a, b) => (a.category === 'Stitched' ? -1 : 1) - (b.category === 'Stitched' ? -1 : 1))
    .slice(0, 8);

  // 7. Unstitched Collection (Strictly Unstitched fabric suits only)
  const unstitchedCollection = activeProducts
    .filter(
      (p) =>
        p.isStitched === false &&
        (p.category === 'Unstitched' || p.additionalCategories?.includes('Unstitched'))
    )
    .sort((a, b) => (a.category === 'Unstitched' ? -1 : 1) - (b.category === 'Unstitched' ? -1 : 1))
    .slice(0, 8);

  // 8. Summer Wear (Strictly Summer fabrics, filterable by 1PC / 2PC / 3PC)
  const summerWearFiltered = activeProducts
    .filter((p) => {
      const isSummer =
        p.season === 'Summer' &&
        (p.category === 'Summer Wear' || p.additionalCategories?.includes('Summer Wear'));
      if (!isSummer) return false;
      if (activeSummerPiece === 'All') return true;
      return p.subcategory === activeSummerPiece || p.type?.includes(activeSummerPiece);
    })
    .sort((a, b) => (a.category === 'Summer Wear' ? -1 : 1) - (b.category === 'Summer Wear' ? -1 : 1))
    .slice(0, 8);

  // 9. Winter Wear (Strictly Winter khaddar/karandi/viscose fabrics, filterable by 1PC / 2PC / 3PC)
  const winterWearFiltered = activeProducts
    .filter((p) => {
      const isWinter =
        p.season === 'Winter' &&
        (p.category === 'Winter Wear' || p.additionalCategories?.includes('Winter Wear'));
      if (!isWinter) return false;
      if (activeWinterPiece === 'All') return true;
      return p.subcategory === activeWinterPiece || p.type?.includes(activeWinterPiece);
    })
    .sort((a, b) => (a.category === 'Winter Wear' ? -1 : 1) - (b.category === 'Winter Wear' ? -1 : 1))
    .slice(0, 8);

  // 10. Casual Wear (Everyday suits only, no bridal lehengas)
  const casualWear = activeProducts
    .filter((p) => p.category === 'Casual Wear' || p.additionalCategories?.includes('Casual Wear'))
    .slice(0, 8);

  // 11. Formal Wear (Festive Chiffon & Luxury Formals only)
  const formalWear = activeProducts
    .filter((p) => p.category === 'Formal Wear' || p.additionalCategories?.includes('Formal Wear'))
    .sort((a, b) => (a.category === 'Formal Wear' ? -1 : 1) - (b.category === 'Formal Wear' ? -1 : 1))
    .slice(0, 8);

  // 12. Wedding Wear (Bridal Lehengas & Wedding Editions only)
  const weddingWear = activeProducts
    .filter((p) => p.category === 'Wedding Wear' || p.additionalCategories?.includes('Wedding Wear'))
    .sort((a, b) => (a.category === 'Wedding Wear' ? -1 : 1) - (b.category === 'Wedding Wear' ? -1 : 1))
    .slice(0, 8);

  // 13. Bottoms (Exclusive uploaded products — empty until admin uploads)
  const bottomsCollection = activeProducts
    .filter((p) => p.category === 'Bottoms' || p.additionalCategories?.includes('Bottoms'))
    .slice(0, 8);

  const currentHero = HERO_SLIDES[activeSlide];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-fadeIn pb-16">
      {/* =========================================================================
          SECTION 2: MAIN HERO BANNER & TICKER (WITH DESIGNER HOUSES)
          ========================================================================= */}
      {/* Top Ramadan & Festive Exhibition urgency banner */}
      <div className="bg-gradient-to-r from-[#1F1C1A] via-[#332A26] to-[#1F1C1A] text-[#F3EFEA] py-2 px-3 sm:px-4 text-center text-[11px] sm:text-xs font-medium border-b border-[#C5A059]/40 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
        <span className="leading-snug">
          <strong>RAMADAN &amp; FESTIVE EXHIBITION:</strong> Free PostEx Courier COD nationwide on orders above Rs. 3,500. Use code <span className="bg-[#C5A059] text-black px-1.5 py-0.5 rounded font-bold inline-block">NOOR10</span> for extra 10% off!
        </span>
      </div>

      {/* Main Luxury Hero Banner with model imagery */}
      <section className="relative overflow-hidden bg-[#F3EFEA] border-b border-[#EADBCE]">
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
                Wear Your Elegance <br className="hidden sm:block" />
                <span className="italic font-normal text-[#B88E3E]">Style of Excellence</span>
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

              {/* Slide Selector Pills */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2">
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

            {/* Right Hero Model Image Composition */}
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

              {/* Floating luxury badge */}
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

      {/* Featured Designer Houses ticker bar from reference screenshot */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-white border border-[#EADBCE] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B88E3E]" />
            <span className="font-serif text-xs font-bold text-[#1F1C1A] uppercase tracking-wider">
              Featured Designer Houses:
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-7 text-xs font-medium text-[#7A7169]">
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

      {/* =========================================================================
          SECTION 3: NEW ARRIVALS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Fresh Haute Couture Drop
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CATEGORY IMAGE GRID (EXACT 10 CATEGORIES, MATCHING REFERENCE PICTURE)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Curated Wardrobe • Reference Layout
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

        {/* 2 cols on ultra-small, 3 cols on mobile, 5 cols on desktop/tablet */}
        <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
          {sortedCategories.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToShop(cat.name)}
              className="group cursor-pointer flex flex-col items-center text-center space-y-2.5"
            >
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#F7F4EE] border border-[#EADBCE] group-hover:border-[#B88E3E] group-hover:shadow-lg transition duration-300">
                <img
                  src={cat.image || '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION_e659eca1.jpeg'}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition" />
                <span className="absolute top-2 left-2 text-[9px] font-bold bg-white/90 text-[#1F1C1A] px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition">
                  #{idx + 1}
                </span>
              </div>
              <span className="font-serif text-xs sm:text-sm font-bold text-[#1F1C1A] group-hover:text-[#B88E3E] transition leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FEATURED COLLECTIONS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Bespoke Pakistani Masterpieces
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Featured Collections
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop(null)}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All Featured</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {featuredCollections.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: STITCHED COLLECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Ready-to-Wear Luxury Pret
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Stitched Collection
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop('Stitched')}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore All Stitched</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {stitchedCollection.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: UNSTITCHED COLLECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Handcrafted Fabrics & Embroidered Necklines
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Unstitched Collection
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop('Unstitched')}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore All Unstitched</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {unstitchedCollection.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: SUMMER WEAR (WITH 1PC, 2PC, 3PC INTERACTIVE SWITCH)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-[#EADBCE] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#B88E3E] text-[10px] font-bold text-[#B88E3E] uppercase tracking-wider mb-1">
              <span>☀️ Breathable Luxury Lawn & Schiffli</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Summer Wear
            </h2>
            <p className="text-xs text-[#7A7169] mt-0.5">
              Pure Swiss lawn, schiffli chikankari, and airy organza dupattas for warm weather elegance.
            </p>
          </div>

          {/* Quick piece selector for summer */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 bg-[#FAF8F5] p-1.5 sm:p-1 rounded-2xl sm:rounded-full border border-[#EADBCE] w-full md:w-auto">
            <span className="text-[10px] font-bold text-[#7A7169] uppercase px-2">Piece:</span>
            {(['All', '1 Piece', '2 Piece', '3 Piece'] as const).map((piece) => (
              <button
                key={piece}
                onClick={() => setActiveSummerPiece(piece)}
                className={`py-1 px-2.5 sm:px-3 rounded-full text-xs font-semibold transition ${
                  activeSummerPiece === piece
                    ? 'bg-[#1F1C1A] text-white shadow-xs'
                    : 'text-[#5A524C] hover:text-[#1F1C1A]'
                }`}
              >
                {piece}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {summerWearFiltered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => onNavigateToShop('Summer Wear')}
            className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-xl border border-[#B88E3E] text-[#B88E3E] hover:bg-[#B88E3E] hover:text-white text-xs font-bold uppercase tracking-wider transition"
          >
            <span>Explore All Summer Wear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: WINTER WEAR (WITH 1PC, 2PC, 3PC INTERACTIVE SWITCH)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-[#EADBCE] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#B88E3E] text-[10px] font-bold text-[#B88E3E] uppercase tracking-wider mb-1">
              <span>❄️ Warm Karandi & Morashi Khaddar</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Winter Wear
            </h2>
            <p className="text-xs text-[#7A7169] mt-0.5">
              Heavy rice karandi, printed khaddar, and plush velvet shawls tailored for seasonal warmth.
            </p>
          </div>

          {/* Quick piece selector for winter */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 bg-[#FAF8F5] p-1.5 sm:p-1 rounded-2xl sm:rounded-full border border-[#EADBCE] w-full md:w-auto">
            <span className="text-[10px] font-bold text-[#7A7169] uppercase px-2">Piece:</span>
            {(['All', '1 Piece', '2 Piece', '3 Piece'] as const).map((piece) => (
              <button
                key={piece}
                onClick={() => setActiveWinterPiece(piece)}
                className={`py-1 px-2.5 sm:px-3 rounded-full text-xs font-semibold transition ${
                  activeWinterPiece === piece
                    ? 'bg-[#1F1C1A] text-white shadow-xs'
                    : 'text-[#5A524C] hover:text-[#1F1C1A]'
                }`}
              >
                {piece}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {winterWearFiltered.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => onNavigateToShop('Winter Wear')}
            className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-xl border border-[#B88E3E] text-[#B88E3E] hover:bg-[#B88E3E] hover:text-white text-xs font-bold uppercase tracking-wider transition"
          >
            <span>Explore All Winter Wear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: CASUAL WEAR
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Effortless Everyday Ensembles
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Casual Wear
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop('Casual Wear')}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore Casual Wear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {casualWear.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: FORMAL WEAR
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Regal Peshwas &amp; Festive Chiffon
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Formal Wear
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {formalWear.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: WEDDING WEAR
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-[#EADBCE] pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Bridal Lehengas &amp; Handcrafted Adda Work
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-1">
              Wedding Wear
            </h2>
          </div>
          <button
            onClick={() => onNavigateToShop('Wedding Wear')}
            className="text-xs font-semibold text-[#B88E3E] hover:underline flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>Explore Wedding Wear</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {weddingWear.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 13: BOTTOMS (TROUSERS, PAJAMAS, SHALWAR & SHALWAR KAMEEZ)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-[#EADBCE] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#B88E3E] text-[10px] font-bold text-[#B88E3E] uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#B88E3E]" />
              <span>Wardrobe Essentials</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Bottoms
            </h2>
            <p className="text-xs text-[#7A7169] mt-0.5">
              Tailored raw silk trousers, stretch cotton pajamas, traditional pleated shalwars &amp; matching 2PC suits.
            </p>
          </div>
        </div>

        {bottomsCollection.length === 0 ? (
          <div className="p-6 sm:p-12 text-center rounded-2xl bg-[#FAF8F5] border border-[#EADBCE] space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B88E3E] bg-white px-3 py-1 rounded-full border border-[#EADBCE]">
              Uploading Soon
            </span>
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#1F1C1A]">
              Exclusive Bottoms Collection Pictures Dropping Soon
            </h3>
            <p className="text-xs text-[#7A7169] max-w-md mx-auto">
              Hamari nayi Bottoms collection ki pictures aur tailored silhouettes jald yahan upload ki jaayengi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {bottomsCollection.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => onNavigateToShop('Bottoms')}
            className="inline-flex items-center gap-1.5 py-2.5 px-6 rounded-xl border border-[#B88E3E] text-[#B88E3E] hover:bg-[#B88E3E] hover:text-white text-xs font-bold uppercase tracking-wider transition"
          >
            <span>Explore All Bottoms</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 14: SALE COLLECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1F1C1A] via-[#2F2926] to-[#1F1C1A] text-white p-6 sm:p-10 lg:p-12 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059] text-[#191715] text-[11px] font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" />
              <span>Limited Time Festive Offer</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Up to 40% Off on Signature Embroidered Pret
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CCC4] leading-relaxed">
              Elevate your festive celebrations with royal organza dupattas, banarsi lehngas, and luxury lawn 3-piece suites.
              Use coupon code <strong className="text-white bg-[#C5A059]/30 px-1.5 py-0.5 rounded">NOOR10</strong> for an additional 10% off at checkout.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToShop('Sale')}
                className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#C5A059] hover:bg-white hover:text-[#191715] text-[#191715] text-xs font-bold uppercase tracking-wider transition shadow-lg"
              >
                Shop The Sale
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 15: ABOUT NOOR STUDIO
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-white border border-[#EADBCE] shadow-sm space-y-8 sm:space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EADBCE] text-xs font-bold text-[#B88E3E] uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>About NOOR STUDIO</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#1F1C1A] leading-tight">
                Crafting Timeless Pakistani Couture with Modern Grace
              </h3>
              <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed">
                Founded with a passionate reverence for traditional Pakistani craftsmanship, NOOR STUDIO marries centuries-old zardozi embroidery and delicate adda work with contemporary silhouettes. From breathable Summer Swiss lawns to rich Winter Morashi khaddars, each garment is stitched to perfection with strict attention to fabric grain, color harmony, and comfort.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#7A7169]">
                <span>✓ 100% Genuine Fabrics</span>
                <span>✓ Verified PostEx Courier COD</span>
                <span>✓ Dedicated Helpline: 03284454746</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden border-4 border-[#FAF8F5] shadow-lg">
                <img
                  src="/assets/aistudio/Fabric__Chiffon___Malai__4__577f7568.jpeg"
                  alt="NOOR STUDIO Artisanal Craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 16: CUSTOMER TESTIMONIALS
          ========================================================================= */}
      <section className="bg-[#F7F4EE] py-10 sm:py-14 border-y border-[#EADBCE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-8 sm:mb-10">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
              Loved by Women Nationwide
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
              Real Words from NOOR STUDIO Patrons
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
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

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
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

            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#EADBCE] shadow-sm space-y-3">
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

      {/* =========================================================================
          SECTION 17: NEWSLETTER
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-[#1F1C1A] text-white shadow-xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[11px] font-bold text-[#EADBCE] uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>NOOR STUDIO VIP Club</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-4xl font-bold max-w-xl mx-auto leading-tight">
            Subscribe for First Access to Festive Collections & Private Markdowns
          </h3>
          <p className="text-xs sm:text-sm text-[#D8CCC4] max-w-md mx-auto">
            Join thousands of discerning women. Enjoy 10% off your first luxury order with code <strong>NOOR10</strong>.
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Thank you for subscribing! Your 10% off code <strong>NOOR10</strong> is active.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="py-3 px-6 rounded-xl bg-[#C5A059] hover:bg-white text-[#191715] text-xs font-bold uppercase tracking-wider transition shadow-md shrink-0"
              >
                Join VIP Club
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
