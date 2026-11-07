export interface SizeStock {
  size: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Unstitched'
  stock: number;
}

export interface ColorVariation {
  name: string; // e.g. "Emerald Green", "Midnight Black", "Crimson Red"
  hex: string;  // e.g. "#143C2E"
  sku: string;  // e.g. "NS-ST-001-GRN"
  images: string[]; // High-res photos specifically for this color
  sizes: SizeStock[];
  priceOverride?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  type?: string;
  fabric: string;
  season?: 'Summer' | 'Winter' | 'All Season';
  isStitched?: boolean;
  additionalCategories?: string[];
  regularPrice: number;
  salePrice?: number;
  sku: string;
  colors: ColorVariation[];
  defaultColor: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: string[];
  order: number;
  isActive: boolean;
}

export interface CartItem {
  id: string; // composite key: `${productId}_${colorName}_${size}`
  productId: string;
  productName: string;
  productSlug: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  image: string;
  price: number;
  regularPrice: number;
  quantity: number;
  maxStock: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'COD' | 'Bank Transfer' | 'Card';

export interface OrderItem {
  productId: string;
  productName: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  isGuest: boolean;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Paid';
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  helpline: string;
  whatsapp: string;
  email: string;
  websiteUrl: string;
  shippingFee: number;
  freeShippingThreshold: number;
  announcement: string;
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedBuyer: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (e.g. 10) or amount in PKR (e.g. 500)
  minSpend?: number;
  isActive: boolean;
}
