import React from 'react';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Star,
  Heart,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { Product } from '../../types';

interface HomePageProps {
  onNavigateToShop: (category?: string | null, subcategory?: string | null) => void;
  onSelectProduct: (product: Product, colorName?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToShop, onSelectProduct }) => {
  const { products, categories, settings } = useStore();

  const newArrivals = products.filter((p) => p.isNewArrival || p.category === 'New Arrivals').slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const formalWear = products.filter((p) => p.category === 'Formal Wear').slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24 animate-fadeIn pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F3EFEA] border-b border-[#EADBCE]">
        {/* Background ambient blush circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#F5D8D6]/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#EAD4BA]/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#EADBCE] text-xs font-semibold text-[#B88E3E] uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#E89A97]" />
                <span>NOOR STUDIO Couture Edition</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1F1C1A] leading-[1.15] tracking-tight">
                Discover Your <br className="hidden sm:block" />
                <span className="italic font-normal text-[#B88E3E]">Signature Style.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#5A524C] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Immerse yourself in authentic Pakistani women&apos;s haute couture. Hand-embossed velvet shawls,
                ethereal organza peshwas, and ready-to-wear luxury lawn stitched to sublime perfection with Cash on Delivery nationwide.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigateToShop(null)}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#EADBCE]" />
                  <span>Shop Collections</span>
                </button>
                <button
                  onClick={() => onNavigateToShop('New Arrivals')}
                  className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#1F1C1A] border border-[#D9CCC2] text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Explore New Arrivals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick helpline info */}
              <p className="text-[11px] text-[#8C827A] pt-2">
                Need phone assistance? Call customer helpline{' '}
                <a href="tel:03284454746" className="font-bold text-[#1F1C1A] underline">
                  03284454746
                </a>
              </p>
            </div>

            {/* Right Hero Images Composition (5 Cols) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-[#F7F4EE]">
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop"
                  alt="NOOR STUDIO Pakistani Fashion Model"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#EADBCE]">
                    Signature Bridal & Pret
                  </span>
                  <p className="font-serif text-lg font-bold">Zunaira Raw Silk 3-Piece</p>
                  <p className="text-xs text-[#EADBCE] font-semibold mt-0.5">Rs. 9,950 (Special Drop)</p>
                </div>
              </div>

              {/* Floating secondary badge */}
              <div className="absolute -bottom-5 -left-4 sm:left-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#EADBCE] shadow-xl text-left hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#B88E3E] flex items-center justify-center text-[#B88E3E]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif text-xs font-bold text-[#1F1C1A]">100% Original Pakistani Fabric</p>
                  <p className="text-[10px] text-[#7A7169]">Fine Lawn • Pure Chiffon • Velvet</p>
                </div>
              </div>
            </div>
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToShop(cat.name)}
              className="group cursor-pointer flex flex-col items-center text-center space-y-2.5"
            >
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#F7F4EE] border border-[#EADBCE] group-hover:border-[#B88E3E] group-hover:shadow-md transition duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400'}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
              </div>
              <span className="font-serif text-xs sm:text-sm font-bold text-[#1F1C1A] group-hover:text-[#B88E3E] transition">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600"
              alt="NOOR STUDIO Lookbook"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600"
              alt="NOOR STUDIO Lookbook"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600"
              alt="NOOR STUDIO Lookbook"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600"
              alt="NOOR STUDIO Lookbook"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
