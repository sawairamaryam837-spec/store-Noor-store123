import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Ruler,
  Star,
  Check,
  ChevronRight,
  Share2,
  AlertCircle,
  Clock,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Product, ColorVariation, SizeStock, Review } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface ProductDetailsProps {
  product: Product;
  initialColorName?: string;
  onSelectProduct: (p: Product) => void;
  onBack: () => void;
  onProceedToCheckout?: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  initialColorName,
  onSelectProduct,
  onBack,
  onProceedToCheckout,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { products } = useStore();

  // Find initial color variation
  const initialIndex = initialColorName
    ? product.colors.findIndex((c) => c.name.toLowerCase() === initialColorName.toLowerCase())
    : 0;
  const [selectedColorIndex, setSelectedColorIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  // Active color variation
  const activeColor: ColorVariation = product.colors[selectedColorIndex] || product.colors[0];

  // Active image index within the active color's gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Available sizes for the active color
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Reset active image & size when active color changes
  useEffect(() => {
    setActiveImageIndex(0);
    // Auto-select first in-stock size
    const firstInStock = activeColor?.sizes.find((s) => s.stock > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock.size);
    } else if (activeColor?.sizes?.[0]) {
      setSelectedSize(activeColor.sizes[0].size);
    }
    setQuantity(1);
  }, [selectedColorIndex, activeColor]);

  // Load reviews from Firestore
  useEffect(() => {
    let active = true;
    const q = query(collection(db, 'reviews'), where('productId', '==', product.id));
    getDocs(q)
      .then((snapshot) => {
        if (!active) return;
        const revs: Review[] = [];
        snapshot.forEach((docSnap) => {
          revs.push({ ...docSnap.data(), id: docSnap.id } as Review);
        });
        setReviews(revs);
      })
      .catch((error) => {
        console.warn('Reviews load notice:', error);
      });
    return () => {
      active = false;
    };
  }, [product.id]);

  // Current stock for selected size & active color
  const selectedSizeStock: SizeStock | undefined = activeColor?.sizes.find((s) => s.size === selectedSize);
  const maxStock = selectedSizeStock ? selectedSizeStock.stock : 0;
  const isOutOfStock = maxStock === 0;

  // Pricing
  const effectivePrice = activeColor.priceOverride || product.salePrice || product.regularPrice;
  const discountPercent =
    product.regularPrice > effectivePrice
      ? Math.round(((product.regularPrice - effectivePrice) / product.regularPrice) * 100)
      : null;

  const currentGallery = activeColor?.images && activeColor.images.length > 0
    ? activeColor.images
    : ['/assets/aistudio/weddingseason__3__6ca9845d.jpeg'];

  const mainImage = currentGallery[activeImageIndex] || currentGallery[0];

  const handleAddToCart = () => {
    if (!selectedSize || isOutOfStock) return;
    const added = addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
      size: selectedSize,
      sku: activeColor.sku || product.sku,
      image: mainImage,
      price: effectivePrice,
      regularPrice: product.regularPrice,
      quantity,
      maxStock,
    });
    if (added) {
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize || isOutOfStock) return;
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      colorName: activeColor.name,
      colorHex: activeColor.hex,
      size: selectedSize,
      sku: activeColor.sku || product.sku,
      image: mainImage,
      price: effectivePrice,
      regularPrice: product.regularPrice,
      quantity,
      maxStock,
    });
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.name} - NOOR STUDIO`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const reviewPayload = {
        productId: product.id,
        ...(user?.uid ? { userId: user.uid } : {}),
        authorName: reviewName.trim() || user?.displayName || 'Verified Shopper',
        rating: reviewRating,
        comment: reviewComment.trim(),
        verifiedBuyer: true,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'reviews'), reviewPayload);
      setReviews((prev) => [{ ...reviewPayload, id: docRef.id } as Review, ...prev]);
      setShowReviewModal(false);
      setReviewComment('');
      setReviewName('');
    } catch (err) {
      console.warn('Review submit note:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-fadeIn">
      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[#7A7169] mb-5 sm:mb-6 font-medium">
        <button onClick={onBack} className="hover:text-[#B88E3E] transition">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-[#A89D93] shrink-0" />
        <span className="text-[#8C827A]">{product.category}</span>
        {product.subcategory && (
          <>
            <ChevronRight className="w-3 h-3 text-[#A89D93] shrink-0" />
            <span className="text-[#8C827A]">{product.subcategory}</span>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-[#A89D93] shrink-0" />
        <span className="text-[#1F1C1A] font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Purchase Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Dynamic Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 min-w-0">
          {/* Thumbnails strip */}
          <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] pb-2 sm:pb-0 shrink-0">
            {currentGallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-16 sm:w-20 lg:w-22 shrink-0 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeImageIndex
                    ? 'border-[#B88E3E] shadow-md'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} ${activeColor.name} view ${idx + 1}`}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>

          {/* Large Main Image */}
          <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-[#F7F4EE] border border-[#EADBCE]/60 shadow-sm group">
            <img
              src={mainImage}
              alt={`${product.name} in ${activeColor.name}`}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {discountPercent && (
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                  -{discountPercent}% OFF
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-3 py-1 rounded-full bg-[#1F1C1A] text-white text-[11px] font-semibold tracking-wider uppercase shadow-md">
                  New Arrival
                </span>
              )}
            </div>

            {/* Current Color Indicator on Image */}
            <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] px-3 py-1.5 rounded-lg bg-black/65 backdrop-blur-md text-white text-xs flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-white shrink-0" style={{ backgroundColor: activeColor.hex }} />
              <span className="truncate">Viewing: <strong className="font-semibold">{activeColor.name}</strong></span>
            </div>

            {/* Wishlist and Share */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm text-[#1F1C1A] hover:text-[#E89A97] shadow-md flex items-center justify-center transition"
                title="Save to Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-[#4A423D]'
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm text-[#1F1C1A] hover:text-[#B88E3E] shadow-md flex items-center justify-center transition"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {copiedNotification && (
              <div className="absolute top-16 right-4 px-3 py-1.5 rounded bg-black/80 text-white text-xs backdrop-blur-sm">
                Link copied!
              </div>
            )}
          </div>
        </div>

        {/* Product Info & Variations (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            {/* Category & Brand & SKU */}
            <div className="flex items-center justify-between text-xs text-[#8C827A] mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand && (
                  <span className="px-2 py-0.5 rounded bg-[#1F1C1A] text-[#FAF8F5] font-bold text-xs tracking-wider uppercase shadow-sm">
                    {product.brand}
                  </span>
                )}
                {product.type && (
                  <span className="px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#8B6B23] font-bold text-xs uppercase border border-[#C5A059]/40">
                    {product.type}
                  </span>
                )}
                <span className="uppercase tracking-widest font-semibold text-[#B88E3E]">
                  {product.category} {product.subcategory ? `| ${product.subcategory}` : ''}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#A89D93]">
                SKU: {activeColor.sku || product.sku}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#1F1C1A]">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-[#8C827A]">({product.reviewCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-4 pb-4 border-b border-[#EADBCE] flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1C1A]">
                Rs. {effectivePrice.toLocaleString()}
              </span>
              {product.regularPrice > effectivePrice && (
                <>
                  <span className="text-base text-[#998F87] line-through font-normal">
                    Rs. {product.regularPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Save Rs. {(product.regularPrice - effectivePrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Fabric Specification */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#F7F4EE] border border-[#EADBCE]/80 text-xs text-[#4A423D]">
              <span className="font-semibold text-[#1F1C1A] block mb-1">Fabric & Material:</span>
              <p>{product.fabric}</p>
            </div>

            {/* CRITICAL: DYNAMIC COLOR VARIATIONS SELECTOR */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase tracking-wider font-bold text-[#1F1C1A]">
                  Color: <span className="font-normal text-[#B88E3E] font-serif capitalize text-sm">{activeColor.name}</span>
                </span>
                <span className="text-[11px] text-[#8C827A]">
                  {product.colors.length} {product.colors.length === 1 ? 'Color available' : 'Colors available'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {product.colors.map((color, idx) => {
                  const isSelected = idx === selectedColorIndex;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColorIndex(idx)}
                      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                        isSelected
                          ? 'border-[#B88E3E] bg-[#F7F4EE] shadow-sm ring-1 ring-[#B88E3E]'
                          : 'border-[#D9CCC2] hover:border-[#B88E3E] bg-white'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/20 shadow-inner shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-medium text-[#1F1C1A]">{color.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#B88E3E]" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#A89D93] mt-1.5">
                * Gallery instantly updates with photos of your chosen shade.
              </p>
            </div>

            {/* SIZES SELECTOR */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase tracking-wider font-bold text-[#1F1C1A]">
                  Select Size:
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-[#B88E3E] hover:underline flex items-center gap-1 font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  Pakistani Size Guide
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {activeColor.sizes.map((s) => {
                  const isSelected = selectedSize === s.size;
                  const isSoldOut = s.stock <= 0;
                  return (
                    <button
                      key={s.size}
                      disabled={isSoldOut}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setQuantity(1);
                      }}
                      className={`py-2.5 px-2 rounded-lg border text-xs font-semibold tracking-wider transition-all relative ${
                        isSoldOut
                          ? 'border-[#EADBCE]/50 bg-[#F4EFEB] text-[#A89D93] cursor-not-allowed line-through'
                          : isSelected
                          ? 'border-[#1F1C1A] bg-[#1F1C1A] text-white shadow-md'
                          : 'border-[#D9CCC2] bg-white text-[#1F1C1A] hover:border-[#1F1C1A]'
                      }`}
                    >
                      {s.size}
                      {s.stock > 0 && s.stock <= 3 && (
                        <span className="absolute -top-1.5 -right-1 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold">
                          {s.stock} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Size & Stock Availability Notice */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                {selectedSize ? (
                  isOutOfStock ? (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Currently Out of Stock in size {selectedSize}. Please choose another size or color.
                    </span>
                  ) : maxStock <= 3 ? (
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Hurry! Only {maxStock} left in {activeColor.name} / {selectedSize}.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      In Stock ({maxStock} pieces ready for immediate dispatch).
                    </span>
                  )
                ) : (
                  <span className="text-[#8C827A]">Please select an available size.</span>
                )}
              </div>
            </div>

            {/* QUANTITY & ACTION BUTTONS */}
            <div className="mt-6 pt-5 border-t border-[#EADBCE] space-y-4">
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between xs:justify-start border border-[#D9CCC2] rounded-lg bg-white overflow-hidden shrink-0">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-sm font-semibold hover:bg-[#F7F4EE] transition disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-[#1F1C1A]">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= maxStock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    className="w-10 h-11 flex items-center justify-center text-sm font-semibold hover:bg-[#F7F4EE] transition disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  disabled={isOutOfStock || !selectedSize}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-4 sm:px-6 rounded-lg bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4 text-[#EADBCE]" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add To Cart'}</span>
                </button>
              </div>

              {/* Buy Now (Direct COD Checkout) */}
              <button
                disabled={isOutOfStock || !selectedSize}
                onClick={handleBuyNow}
                className="w-full py-3 px-6 rounded-lg bg-[#B88E3E] hover:bg-[#9E7730] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>⚡ Buy Now with Cash on Delivery</span>
              </button>

              {/* Direct WhatsApp Order / Restock Inquiry Button */}
              <a
                href={`https://wa.me/923284454746?text=${encodeURIComponent(
                  `Assalam-o-Alaikum NOOR STUDIO, I am interested in: ${product.name} (Color: ${activeColor.name}, Size: ${selectedSize || 'Not selected'}, Price: Rs. ${effectivePrice.toLocaleString()}). ${
                    isOutOfStock ? 'Since this is currently Sold Out, please let me know if a restock or pre-order is available.' : 'Please confirm order availability.'
                  }`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isOutOfStock ? 'Request Restock / Pre-Order on WhatsApp' : 'Direct Order via WhatsApp (03284454746)'}</span>
              </a>
            </div>

            {/* Trust & Delivery Info */}
            <div className="mt-6 pt-5 border-t border-[#EADBCE] grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-[#5A524C]">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#B88E3E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1F1C1A]">Cash on Delivery (COD)</p>
                  <p className="text-[11px] text-[#7A7169]">2–4 working days nationwide via PostEx</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#E89A97] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1F1C1A]">7-Day Easy Exchange</p>
                  <p className="text-[11px] text-[#7A7169]">Simple size and color exchange policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Detailed Specs */}
      <div className="mt-16 pt-10 border-t border-[#EADBCE]">
        <div className="max-w-4xl mx-auto">
          <div className="border-b border-[#EADBCE] pb-3 mb-6">
            <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">
              Product Overview & Artisanal Details
            </h3>
          </div>
          <div className="prose text-xs sm:text-sm text-[#4A423D] leading-relaxed space-y-4">
            <p>{product.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 rounded-xl bg-[#F7F4EE] border border-[#EADBCE]">
              <div>
                <p className="font-semibold text-[#1F1C1A] mb-1">Care Instructions:</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#6F665F]">
                  <li>Dry clean recommended for heavy embroidered pieces</li>
                  <li>Do not bleach or use stain-removing chemicals</li>
                  <li>Iron inside out on medium heat</li>
                  <li>Store in breathable garment bags</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[#1F1C1A] mb-1">Package Includes:</p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#6F665F]">
                  <li>Embroidered Shirt / Kurti</li>
                  <li>Coordinated Pants / Trouser (if 2 or 3 piece)</li>
                  <li>Designer Dupatta / Shawl (if 3 piece)</li>
                  <li>Official NOOR STUDIO authenticity tag</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-16 pt-10 border-t border-[#EADBCE]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EADBCE] pb-4 mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1F1C1A]">Customer Reviews</h3>
              <p className="text-xs text-[#7A7169] mt-0.5">
                Authentic feedback from verified NOOR STUDIO customers
              </p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 rounded-lg bg-[#1F1C1A] hover:bg-[#B88E3E] text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              Write a Review
            </button>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10 bg-[#F7F4EE] rounded-xl border border-[#EADBCE]">
              <p className="text-sm font-serif font-semibold text-[#1F1C1A]">Be the first to review this ensemble!</p>
              <p className="text-xs text-[#7A7169] mt-1">Share your experience with fabric, stitching, and fit.</p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="mt-3 px-4 py-2 rounded-md bg-[#B88E3E] text-white text-xs font-semibold transition"
              >
                Leave Feedback
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-white border border-[#EADBCE] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1F1C1A]">{rev.authorName}</span>
                      {rev.verifiedBuyer && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#A89D93]">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#4A423D]">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[#EADBCE]">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[#B88E3E] font-semibold">Recommended for you</p>
            <h3 className="font-serif text-2xl font-bold text-[#1F1C1A] mt-1">Complete Your Look</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-[#EADBCE] hover:border-[#B88E3E] transition shadow-sm"
              >
                <div className="aspect-[3/4] bg-[#F7F4EE] overflow-hidden">
                  <img
                    src={p.colors[0]?.images[0] || '/assets/aistudio/weddingseason__3__6ca9845d.jpeg'}
                    alt={p.name}
                    className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="font-serif text-xs font-semibold text-[#1F1C1A] line-clamp-1">{p.name}</p>
                  <p className="text-xs font-bold text-[#B88E3E] mt-1">
                    Rs. {(p.salePrice || p.regularPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pakistani Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 mb-4">
              <div>
                <h4 className="font-serif text-xl font-bold text-[#1F1C1A]">NOOR STUDIO Size Guide</h4>
                <p className="text-xs text-[#7A7169]">Standard Pakistani pret sizing (measurements in inches)</p>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#4A423D]">
                <thead className="bg-[#F7F4EE] text-[#1F1C1A] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hip</th>
                    <th className="py-2.5 px-3">Kameez Length</th>
                    <th className="py-2.5 px-3">Trouser Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCE]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#1F1C1A]">XS</td>
                    <td className="py-2.5 px-3">36&quot;</td>
                    <td className="py-2.5 px-3">32&quot;</td>
                    <td className="py-2.5 px-3">38&quot;</td>
                    <td className="py-2.5 px-3">38&quot; - 40&quot;</td>
                    <td className="py-2.5 px-3">37&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#1F1C1A]">S</td>
                    <td className="py-2.5 px-3">38&quot;</td>
                    <td className="py-2.5 px-3">34&quot;</td>
                    <td className="py-2.5 px-3">40&quot;</td>
                    <td className="py-2.5 px-3">40&quot; - 42&quot;</td>
                    <td className="py-2.5 px-3">38&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#1F1C1A]">M</td>
                    <td className="py-2.5 px-3">41&quot;</td>
                    <td className="py-2.5 px-3">37&quot;</td>
                    <td className="py-2.5 px-3">44&quot;</td>
                    <td className="py-2.5 px-3">42&quot;</td>
                    <td className="py-2.5 px-3">39&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#1F1C1A]">L</td>
                    <td className="py-2.5 px-3">44&quot;</td>
                    <td className="py-2.5 px-3">40&quot;</td>
                    <td className="py-2.5 px-3">47&quot;</td>
                    <td className="py-2.5 px-3">43&quot;</td>
                    <td className="py-2.5 px-3">40&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-[#1F1C1A]">XL</td>
                    <td className="py-2.5 px-3">47&quot;</td>
                    <td className="py-2.5 px-3">43&quot;</td>
                    <td className="py-2.5 px-3">50&quot;</td>
                    <td className="py-2.5 px-3">44&quot;</td>
                    <td className="py-2.5 px-3">40&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-[#FAF8F5] rounded-lg text-[11px] text-[#6F665F]">
              <p className="font-semibold text-[#1F1C1A] mb-1">Unstitched Suits:</p>
              <p>
                Unstitched fabrics include generous cut: 3.0 meters shirt fabric, 2.5 meters trouser fabric, and 2.5 meters dupatta,
                allowing custom tailoring to any customized size.
              </p>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 rounded-lg bg-[#1F1C1A] text-white text-xs font-semibold"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#EADBCE] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 mb-4">
              <h4 className="font-serif text-lg font-bold text-[#1F1C1A]">Write a Review</h4>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Ali"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Your Review</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the fabric quality, stitching, and color accuracy..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-lg bg-[#B88E3E] text-white font-semibold hover:bg-[#9E7730] transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
