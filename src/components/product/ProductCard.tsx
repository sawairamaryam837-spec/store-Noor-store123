import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product, selectedColorName?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Selected color variation on card level
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const activeColor = product.colors[activeColorIndex] || product.colors[0];

  // Primary image for active color
  const primaryImage = activeColor?.images?.[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg';
  const secondaryImage = activeColor?.images?.[1] || primaryImage;
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent =
    product.salePrice && product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : null;

  const currentPrice = product.salePrice || product.regularPrice;

  // Stock calculations
  const totalStock = product.colors.reduce(
    (sum, c) => sum + c.sizes.reduce((sSum, s) => sSum + (s.stock || 0), 0),
    0
  );
  const activeColorStock = activeColor?.sizes.reduce((sSum, s) => sSum + (s.stock || 0), 0) || 0;
  const isSoldOut = totalStock === 0 || activeColorStock === 0;
  const isLowStock = !isSoldOut && (activeColorStock <= 5 || totalStock <= 5);

  // Quick add to cart (adds first in-stock size of active color)
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) {
      onSelect(product, activeColor?.name);
      return;
    }
    const availableSize = activeColor?.sizes.find((s) => s.stock > 0);
    if (!availableSize) {
      onSelect(product, activeColor?.name);
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
      size: availableSize.size,
      sku: activeColor.sku || product.sku,
      image: primaryImage,
      price: currentPrice,
      regularPrice: product.regularPrice,
      quantity: 1,
      maxStock: availableSize.stock,
    });
  };

  return (
    <div
      onClick={() => onSelect(product, activeColor?.name)}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-[#EADBCE]/60 hover:border-[#C5A059]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div
        className="relative w-full aspect-[3/4] bg-[#F7F4EE] overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={`${product.name} - ${activeColor?.name}`}
          className={`w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 ${
            isSoldOut ? 'opacity-85 grayscale-[20%]' : ''
          }`}
          loading="lazy"
        />

        {/* Sold out overlay banner */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-10">
            <span className="px-3.5 py-1.5 rounded-lg bg-[#1F1C1A]/90 border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest shadow-xl">
              Sold Out
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isSoldOut ? (
            <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] uppercase font-bold tracking-wider shadow-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-[#1F1C1A] text-[10px] uppercase font-bold tracking-wider shadow-md animate-pulse">
              Only {activeColorStock} Left!
            </span>
          ) : null}
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold tracking-wider shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-full bg-[#1F1C1A] text-[#FAF8F5] text-[10px] uppercase font-semibold tracking-wider shadow-sm">
              New
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 rounded-full bg-[#B88E3E] text-white text-[10px] uppercase font-semibold tracking-wider shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-[#1F1C1A] hover:text-[#E89A97] shadow-sm flex items-center justify-center transition-transform hover:scale-110 z-10"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 ${
              isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-[#4A423D]'
            }`}
          />
        </button>

        {/* Quick Add Floating Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2 z-10">
          {isSoldOut ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product, activeColor?.name);
              }}
              className="flex-1 py-2.5 px-3 bg-red-700/90 hover:bg-red-800 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm flex items-center justify-center gap-1.5 transition"
            >
              <span>Sold Out</span>
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="flex-1 py-2.5 px-3 bg-[#1F1C1A]/95 hover:bg-[#B88E3E] text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm flex items-center justify-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#EADBCE]" />
              <span>Quick Add</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product, activeColor?.name);
            }}
            className="w-10 h-10 bg-white/95 hover:bg-white text-[#1F1C1A] rounded-lg shadow-lg flex items-center justify-center transition"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-[#4A423D]" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Brand & Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#8A7F76] mb-1 gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.brand && (
                <span className="px-1.5 py-0.5 rounded bg-[#FAF5EE] text-[#B88E3E] font-bold text-[10px] tracking-wider uppercase border border-[#EADBCE]">
                  {product.brand}
                </span>
              )}
              <span className="uppercase tracking-wider text-[11px] font-medium text-[#7A7169]">
                {product.category} {product.type ? `• ${product.type}` : (product.subcategory ? `• ${product.subcategory}` : '')}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-[#1F1C1A]">{product.rating.toFixed(1)}</span>
              <span className="text-[#A89D93]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h4 className="font-serif text-sm font-semibold text-[#1F1C1A] line-clamp-1 group-hover:text-[#B88E3E] transition">
            {product.name}
          </h4>

          {/* Fabric Info */}
          <p className="text-[11px] text-[#7A7169] mt-0.5 line-clamp-1 italic">
            Fabric: {product.fabric}
          </p>
        </div>

        {/* Color Swatches and Pricing */}
        <div className="mt-3 pt-2.5 border-t border-[#F2ECE6]">
          {/* Color Switcher */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {product.colors.map((color, idx) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveColorIndex(idx);
                  }}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    idx === activeColorIndex
                      ? 'ring-2 ring-[#B88E3E] ring-offset-1 scale-110'
                      : 'border-black/20 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`Color ${color.name}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-[#8C827A] font-medium">
              {product.colors.length} {product.colors.length === 1 ? 'Color' : 'Colors'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#1F1C1A]">
              Rs. {currentPrice.toLocaleString()}
            </span>
            {product.salePrice && product.regularPrice > product.salePrice && (
              <span className="text-xs text-[#998F87] line-through font-normal">
                Rs. {product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
