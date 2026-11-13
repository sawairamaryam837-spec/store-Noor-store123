import React, { useState, useMemo } from 'react';
import {
  Filter,
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { Product } from '../../types';

interface ShopPageProps {
  initialCategory?: string | null;
  initialSubcategory?: string | null;
  searchQuery?: string;
  onSelectProduct: (product: Product, colorName?: string) => void;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Unstitched'];
const COLOR_PALETTE = [
  { name: 'Black', hex: '#1C1919' },
  { name: 'Pink', hex: '#E5A7B5' },
  { name: 'Sage', hex: '#7D9992' },
  { name: 'Mint', hex: '#A9BFB2' },
  { name: 'Mauve', hex: '#B3808B' },
  { name: 'Maroon', hex: '#7C242C' },
  { name: 'Plum', hex: '#582148' },
  { name: 'Gold', hex: '#D49017' },
  { name: 'Beige', hex: '#CBB2A1' },
];

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  initialSubcategory,
  searchQuery = '',
  onSelectProduct,
}) => {
  const { products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategory || 'All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(initialCategory === 'Sale');
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'bestseller' | 'featured'>('newest');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);

  // Update when props change
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setOnSaleOnly(initialCategory === 'Sale');
    }
    if (initialSubcategory) {
      setSelectedSubcategory(initialSubcategory);
    } else {
      setSelectedSubcategory('All');
    }
  }, [initialCategory, initialSubcategory]);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;

      // Category filter (strict separation matching HomePage)
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Sale') {
          if (!p.salePrice || p.salePrice >= p.regularPrice) return false;
        } else if (selectedCategory === 'New Arrivals') {
          if (!p.isNewArrival && p.category !== 'New Arrivals') return false;
        } else if (selectedCategory === 'Summer Wear') {
          const isSummer =
            p.season === 'Summer' &&
            (p.category === 'Summer Wear' || p.additionalCategories?.includes('Summer Wear'));
          if (!isSummer) return false;
        } else if (selectedCategory === 'Winter Wear') {
          const isWinter =
            p.season === 'Winter' &&
            (p.category === 'Winter Wear' || p.additionalCategories?.includes('Winter Wear'));
          if (!isWinter) return false;
        } else if (selectedCategory === 'Wedding Wear') {
          const isWedding =
            p.category === 'Wedding Wear' ||
            p.additionalCategories?.includes('Wedding Wear');
          if (!isWedding) return false;
        } else if (selectedCategory === 'Formal Wear') {
          const isFormal =
            p.category === 'Formal Wear' ||
            p.additionalCategories?.includes('Formal Wear');
          if (!isFormal) return false;
        } else if (selectedCategory === 'Stitched') {
          const isStitched =
            p.isStitched === true &&
            (p.category === 'Stitched' || p.additionalCategories?.includes('Stitched'));
          if (!isStitched) return false;
        } else if (selectedCategory === 'Unstitched') {
          const isUnstitched =
            p.isStitched === false &&
            (p.category === 'Unstitched' || p.additionalCategories?.includes('Unstitched'));
          if (!isUnstitched) return false;
        } else if (selectedCategory === 'Casual Wear') {
          const isCasual =
            p.category === 'Casual Wear' ||
            p.additionalCategories?.includes('Casual Wear');
          if (!isCasual) return false;
        } else if (selectedCategory === 'Bottoms') {
          const isBottoms =
            p.category === 'Bottoms' ||
            p.additionalCategories?.includes('Bottoms');
          if (!isBottoms) return false;
        } else if (p.category !== selectedCategory && !p.additionalCategories?.includes(selectedCategory)) {
          return false;
        }
      }

      // Subcategory filter (flexible matching for piece count or bottom type)
      if (selectedSubcategory !== 'All') {
        const matchesSubcategory =
          p.subcategory === selectedSubcategory ||
          p.type?.toLowerCase().includes(selectedSubcategory.toLowerCase()) ||
          p.name.toLowerCase().includes(selectedSubcategory.toLowerCase());
        if (!matchesSubcategory) {
          return false;
        }
      }

      // Sale filter
      if (onSaleOnly && (!p.salePrice || p.regularPrice <= (p.salePrice || 0))) {
        return false;
      }

      // Price filter
      const price = p.salePrice || p.regularPrice;
      if (price > maxPrice) {
        return false;
      }

      // Color filter
      if (selectedColor !== 'All') {
        const hasColor = p.colors.some((c) =>
          c.name.toLowerCase().includes(selectedColor.toLowerCase())
        );
        if (!hasColor) return false;
      }

      // Size filter
      if (selectedSize !== 'All') {
        const hasSize = p.colors.some((c) =>
          c.sizes.some((s) => s.size === selectedSize && (inStockOnly ? s.stock > 0 : true))
        );
        if (!hasSize) return false;
      }

      // In stock only filter
      if (inStockOnly) {
        const hasStock = p.colors.some((c) => c.sizes.some((s) => s.stock > 0));
        if (!hasStock) return false;
      }

      // Search keyword filter
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesFabric = p.fabric.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
        const matchesType = p.type ? p.type.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDesc && !matchesFabric && !matchesCat && !matchesBrand && !matchesType) {
          return false;
        }
      }

      return true;
    });
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedSize,
    selectedColor,
    inStockOnly,
    onSaleOnly,
    maxPrice,
    localSearch,
  ]);

  // Sort
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.salePrice || a.regularPrice;
      const priceB = b.salePrice || b.regularPrice;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      if (sortBy === 'featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      // default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredProducts, sortBy]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSelectedSize('All');
    setSelectedColor('All');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMaxPrice(60000);
    setLocalSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fadeIn pb-16 sm:pb-20">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-5 mb-6 sm:mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-[#B88E3E]">
            NOOR STUDIO Collection
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] mt-0.5">
            {selectedCategory === 'All' ? 'All Fashion Ensembles' : selectedCategory}
            {selectedSubcategory !== 'All' ? ` — ${selectedSubcategory}` : ''}
          </h1>
          <p className="text-xs text-[#7A7169] mt-1">
            Showing {filteredProducts.length} handcrafted Pakistani designs
          </p>
        </div>

        {/* Search input in shop */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-[#A89D93] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search lawn, pret, velvet..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D9CCC2] bg-white text-xs focus:outline-none focus:border-[#B88E3E] shadow-sm"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters (3 Cols) */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-[#EADBCE] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
            <span className="font-serif font-bold text-sm text-[#1F1C1A] flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#B88E3E]" />
              Filter By
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-[#B88E3E] font-semibold hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <label className="block text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mb-2.5">
              Category
            </label>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedSubcategory('All');
                }}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition ${
                  selectedCategory === 'All'
                    ? 'bg-[#1F1C1A] text-white font-semibold'
                    : 'text-[#5A524C] hover:bg-[#FAF8F5]'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.name);
                    setSelectedSubcategory('All');
                  }}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg transition flex items-center justify-between ${
                    selectedCategory === c.name
                      ? 'bg-[#1F1C1A] text-white font-semibold'
                      : 'text-[#5A524C] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.name === 'Sale' && (
                    <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold">
                      SALE
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory (if applicable) */}
          {(selectedCategory === 'Summer Wear' || selectedCategory === 'Winter Wear' || selectedCategory === 'Stitched') && (
            <div className="pt-4 border-t border-[#F2ECE6]">
              <label className="block text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mb-2.5">
                Piece / Silhouette
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['All', '1 Piece', '2 Piece', '3 Piece'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`py-1 px-3 rounded-lg border text-xs font-medium transition ${
                      selectedSubcategory === sub
                        ? 'border-[#B88E3E] bg-[#F7F4EE] text-[#B88E3E] font-bold'
                        : 'border-[#D9CCC2] text-[#5A524C] hover:border-[#B88E3E]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}



          {/* Size Filter */}
          <div className="pt-4 border-t border-[#F2ECE6]">
            <label className="block text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mb-2.5">
              Available Sizes
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['All', ...AVAILABLE_SIZES].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition ${
                    selectedSize === sz
                      ? 'border-[#1F1C1A] bg-[#1F1C1A] text-white'
                      : 'border-[#D9CCC2] text-[#5A524C] hover:border-[#1F1C1A]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="pt-4 border-t border-[#F2ECE6]">
            <label className="block text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mb-2.5">
              Color Palette
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedColor('All')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  selectedColor === 'All'
                    ? 'border-[#1F1C1A] bg-[#1F1C1A] text-white'
                    : 'border-[#D9CCC2] text-[#5A524C]'
                }`}
              >
                All
              </button>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition ${
                    selectedColor === c.name
                      ? 'border-[#B88E3E] bg-[#F7F4EE] ring-1 ring-[#B88E3E] font-semibold'
                      : 'border-[#D9CCC2] hover:border-[#B88E3E]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-[#F2ECE6]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-[#1F1C1A] uppercase tracking-wider">Max Price</span>
              <span className="font-bold text-[#B88E3E]">Rs. {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={3000}
              max={60000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#B88E3E] cursor-pointer"
            />
          </div>

          {/* In Stock & Sale Toggles */}
          <div className="pt-4 border-t border-[#F2ECE6] space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-[#B88E3E] rounded border-[#D9CCC2]"
              />
              <span className="text-[#4A423D] font-medium">In Stock Items Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
                className="w-4 h-4 text-[#B88E3E] rounded border-[#D9CCC2]"
              />
              <span className="text-red-600 font-semibold">Sale & Clearance Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Sort & Filter Bar for Mobile */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 sm:p-3.5 rounded-2xl border border-[#EADBCE] shadow-sm text-xs">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-[#D9CCC2] font-semibold text-[#1F1C1A]"
            >
              <Filter className="w-3.5 h-3.5 text-[#B88E3E]" />
              <span>Filters</span>
            </button>

            <span className="hidden sm:inline text-[#7A7169]">
              Showing <strong className="text-[#1F1C1A]">{displayedProducts.length}</strong> of{' '}
              <strong className="text-[#1F1C1A]">{filteredProducts.length}</strong> items
            </span>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[#7A7169] hidden md:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#D9CCC2] bg-white font-semibold text-[#1F1C1A] focus:outline-none focus:border-[#B88E3E] text-xs"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="bestseller">Best Selling</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>

          {/* Quick Subcategory Pills for Summer Wear & Winter Wear (1 Piece, 2 Piece, 3 Piece) */}
          {(selectedCategory === 'Summer Wear' || selectedCategory === 'Winter Wear') && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#EADBCE]">
              <span className="text-xs font-bold text-[#1F1C1A] uppercase tracking-wider mr-1">
                {selectedCategory === 'Summer Wear' ? '☀️ Summer Pieces:' : '❄️ Winter Pieces:'}
              </span>
              {[
                { id: 'All', label: 'All' },
                { id: '1 Piece', label: '1 Piece' },
                { id: '2 Piece', label: '2 Piece' },
                { id: '3 Piece', label: '3 Piece' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedSubcategory(pill.id)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                    selectedSubcategory === pill.id
                      ? 'bg-[#1F1C1A] text-white shadow-sm'
                      : 'bg-white border border-[#D9CCC2] text-[#5A524C] hover:border-[#1F1C1A]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}


          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            selectedCategory === 'Bottoms' ? (
              <div className="p-12 sm:p-20 text-center bg-[#FAF8F5] rounded-3xl border border-[#EADBCE] space-y-4 animate-fadeIn max-w-2xl mx-auto my-6">
                <div className="w-16 h-16 rounded-full bg-white border border-[#B88E3E] flex items-center justify-center mx-auto text-[#B88E3E] shadow-sm">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B88E3E] bg-white px-3 py-1 rounded-full border border-[#EADBCE]">
                    NOOR STUDIO • NEW COLLECTION
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A]">
                    Bottoms Collection Uploading Soon
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7A7169] max-w-md mx-auto leading-relaxed">
                    Hamari exclusive Bottoms collection (trousers, pajamas, shalwars) ki pictures aur nayi designs jald yahan upload hongi.
                  </p>
                </div>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory('Stitched');
                      setSelectedSubcategory('All');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] text-white text-xs font-bold hover:bg-[#B88E3E] transition shadow-sm"
                  >
                    Explore Stitched Collection
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedSubcategory('All');
                    }}
                    className="px-6 py-2.5 rounded-xl border border-[#D9CCC2] bg-white text-[#1F1C1A] text-xs font-semibold hover:border-[#1F1C1A] transition"
                  >
                    View All Collections
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-2xl border border-[#EADBCE] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto text-[#B88E3E]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">No Ensembles Found</h3>
                <p className="text-xs text-[#7A7169] max-w-sm mx-auto">
                  We couldn&apos;t find any designs matching your specific filter criteria. Try resetting filters or adjusting search keywords.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-[#1F1C1A] text-white text-xs font-semibold hover:bg-[#B88E3E] transition"
                >
                  Reset All Filters
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {visibleCount < sortedProducts.length && (
            <div className="text-center pt-8">
              <button
                onClick={() => setVisibleCount((c) => c + 6)}
                className="py-3 px-8 rounded-xl bg-white border border-[#D9CCC2] hover:border-[#1F1C1A] text-[#1F1C1A] text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:shadow"
              >
                Load More Ensembles
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn">
          <div className="w-[88vw] max-w-xs bg-white h-full p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3">
                <span className="font-serif font-bold text-base text-[#1F1C1A]">Filters</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-black"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-[#1F1C1A] mb-2 uppercase">Category</label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedSubcategory('All');
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded-lg ${
                      selectedCategory === 'All' ? 'bg-[#1F1C1A] text-white font-bold' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.name);
                        setSelectedSubcategory('All');
                      }}
                      className={`w-full text-left py-2 px-2.5 rounded-lg flex items-center justify-between ${
                        selectedCategory === c.name ? 'bg-[#1F1C1A] text-white font-bold' : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{c.name}</span>
                      {c.name === 'Sale' && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                          SALE
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Piece / Silhouette Subcategory */}
              {(selectedCategory === 'Summer Wear' || selectedCategory === 'Winter Wear' || selectedCategory === 'Stitched') && (
                <div className="pt-4 border-t border-[#F2ECE6]">
                  <label className="block text-xs font-bold text-[#1F1C1A] mb-2 uppercase">
                    Piece / Silhouette
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', '1 Piece', '2 Piece', '3 Piece'].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-medium ${
                          selectedSubcategory === sub
                            ? 'border-[#B88E3E] bg-[#F7F4EE] text-[#B88E3E] font-bold'
                            : 'border-[#D9CCC2] text-[#5A524C]'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              <div className="pt-4 border-t border-[#F2ECE6]">
                <label className="block text-xs font-bold text-[#1F1C1A] mb-2 uppercase">Sizes</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['All', ...AVAILABLE_SIZES].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold ${
                        selectedSize === sz ? 'bg-[#1F1C1A] text-white border-[#1F1C1A]' : 'border-[#D9CCC2] text-[#5A524C]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="pt-4 border-t border-[#F2ECE6]">
                <label className="block text-xs font-bold text-[#1F1C1A] mb-2 uppercase">Color Palette</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setSelectedColor('All')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      selectedColor === 'All'
                        ? 'border-[#1F1C1A] bg-[#1F1C1A] text-white'
                        : 'border-[#D9CCC2] text-[#5A524C]'
                    }`}
                  >
                    All
                  </button>
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition ${
                        selectedColor === c.name
                          ? 'border-[#B88E3E] bg-[#F7F4EE] ring-1 ring-[#B88E3E] font-semibold'
                          : 'border-[#D9CCC2]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-[#F2ECE6]">
                <label className="block text-xs font-bold text-[#1F1C1A] mb-1 uppercase">
                  Max Price: Rs. {maxPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min={3000}
                  max={60000}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#B88E3E]"
                />
              </div>

              {/* Stock & Sale Toggles */}
              <div className="pt-4 border-t border-[#F2ECE6] space-y-2.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-[#B88E3E] rounded border-[#D9CCC2]"
                  />
                  <span className="text-[#4A423D] font-medium">In Stock Items Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="w-4 h-4 text-[#B88E3E] rounded border-[#D9CCC2]"
                  />
                  <span className="text-red-600 font-semibold">Sale &amp; Clearance Only</span>
                </label>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#EADBCE] space-y-2 shrink-0">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-[#1F1C1A] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2 text-xs text-[#7A7169] hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
