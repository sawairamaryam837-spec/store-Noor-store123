import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { Product, Category, StoreSettings, Coupon } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'NOOR STUDIO',
  tagline: 'Elegant Fashion, Timeless Confidence',
  helpline: '03284454746',
  whatsapp: '+923284454746',
  email: 'support@noorstudio.pk',
  websiteUrl: 'https://www.noorstudio.pk',
  shippingFee: 250,
  freeShippingThreshold: 5000,
  announcement: '✨ Free Express Delivery Nationwide on Orders Above Rs. 5,000 | Cash on Delivery Available | Helpline: 03284454746',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Fresh couture drops, contemporary silhouettes, and artisanal Pakistani hand-embroidery.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    order: 1,
    isActive: true,
  },
  {
    id: 'stitched',
    name: 'Stitched',
    slug: 'stitched',
    description: 'Ready-to-wear luxury pret, impeccably tailored kurtis, 2-piece and 3-piece designer sets.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
    order: 2,
    isActive: true,
  },
  {
    id: 'unstitched',
    name: 'Unstitched',
    slug: 'unstitched',
    description: 'Premium unstitched fabrics with intricate embroidered neckline, panels, and digital silk dupattas.',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
    order: 3,
    isActive: true,
  },
  {
    id: 'summer-wear',
    name: 'Summer Wear',
    slug: 'summer-wear',
    description: 'Breathable lawn, schiffli chikankari, and swiss voile crafted for breezy summer elegance.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    subcategories: ['1 Piece', '2 Piece', '3 Piece'],
    order: 4,
    isActive: true,
  },
  {
    id: 'winter-wear',
    name: 'Winter Wear',
    slug: 'winter-wear',
    description: 'Opulent micro-velvet, woven pashmina shawls, and warm karandi stitched to perfection.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
    subcategories: ['1 Piece', '2 Piece', '3 Piece'],
    order: 5,
    isActive: true,
  },
  {
    id: 'formal-wear',
    name: 'Formal Wear',
    slug: 'formal-wear',
    description: 'Regal bridal wear, peshwas, tilla embroidery, sequined organza, and festive wedding luxury.',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
    order: 6,
    isActive: true,
  },
  {
    id: 'sale',
    name: 'Sale',
    slug: 'sale',
    description: 'Exclusive seasonal markdown offers with up to 40% off on signature NOOR STUDIO collections.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    order: 7,
    isActive: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'ns-prod-001',
    name: 'Zunaira Embroidered Luxury Pret 3-Piece',
    slug: 'zunaira-embroidered-luxury-pret-3-piece',
    description: 'An ethereal ensemble inspired by mughal floral motifs. Featuring an intricately embroidered raw silk shirt embellished with zardozi and pearl accents, paired with tailored cigarette pants and a delicate organza dupatta with scalloped borders.',
    category: 'Stitched',
    subcategory: '3 Piece',
    fabric: 'Pure Raw Silk Shirt & Pants with Organza Jacquard Dupatta',
    regularPrice: 12500,
    salePrice: 9950,
    sku: 'NS-ST-001',
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 28,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Midnight Black',
    colors: [
      {
        name: 'Midnight Black',
        hex: '#111111',
        sku: 'NS-ST-001-BLK',
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 4 },
          { size: 'S', stock: 8 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 6 },
          { size: 'XL', stock: 3 },
        ],
      },
      {
        name: 'Golden Ochre',
        hex: '#C59A45',
        sku: 'NS-ST-001-GLD',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 2 },
          { size: 'S', stock: 5 },
          { size: 'M', stock: 7 },
          { size: 'L', stock: 4 },
          { size: 'XL', stock: 0 },
        ],
      },
      {
        name: 'Crimson Red',
        hex: '#8B111A',
        sku: 'NS-ST-001-RED',
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 3 },
          { size: 'S', stock: 6 },
          { size: 'M', stock: 9 },
          { size: 'L', stock: 5 },
          { size: 'XL', stock: 2 },
        ],
      },
      {
        name: 'Blush Pink',
        hex: '#EAA9A2',
        sku: 'NS-ST-001-PNK',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 4 },
          { size: 'S', stock: 7 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 5 },
          { size: 'XL', stock: 2 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-002',
    name: 'Mah-e-Noor Handcrafted Organza Peshwas',
    slug: 'mah-e-noor-handcrafted-organza-peshwas',
    description: 'An iconic festive Pakistani silhouette. 16-kali kalidar peshwas crafted from Korean tissue organza adorned with hand-laid gota patti, dabka, and shimmering sequins. Complemented by a block-printed banarsi lehenga and heavy embroidered dupatta.',
    category: 'Formal Wear',
    subcategory: '3 Piece',
    fabric: 'Korean Tissue Organza & Shimmering Silk with Banarsi Dupatta',
    regularPrice: 28500,
    salePrice: 24900,
    sku: 'NS-FW-002',
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: true,
    isActive: true,
    rating: 5.0,
    reviewCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Rose Gold',
    colors: [
      {
        name: 'Rose Gold',
        hex: '#B76E79',
        sku: 'NS-FW-002-RSG',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 3 },
          { size: 'M', stock: 6 },
          { size: 'L', stock: 4 },
        ],
      },
      {
        name: 'Royal Emerald',
        hex: '#0D3826',
        sku: 'NS-FW-002-EMR',
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 2 },
          { size: 'M', stock: 4 },
          { size: 'L', stock: 2 },
        ],
      },
      {
        name: 'Ivory Pearl',
        hex: '#F7F5F0',
        sku: 'NS-FW-002-IVR',
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 5 },
          { size: 'L', stock: 3 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-003',
    name: 'Zohra Velvet Shawl & Raw Silk Ensemble',
    slug: 'zohra-velvet-shawl-raw-silk-ensemble',
    description: 'Sumptuous winter couture. Heavy embroidered micro-9000 velvet shawl featuring intricate tilla and resham borders, paired with a solid pure raw silk kurta and straight pants. The epitome of winter wedding sophistication.',
    category: 'Winter Wear',
    subcategory: '3 Piece',
    fabric: 'Micro 9000 Velvet Shawl with Pure Raw Silk Suit',
    regularPrice: 21000,
    salePrice: 17500,
    sku: 'NS-WW-003',
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 34,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Deep Maroon',
    colors: [
      {
        name: 'Deep Maroon',
        hex: '#520B13',
        sku: 'NS-WW-003-MRN',
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 6 },
          { size: 'M', stock: 9 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 4 },
        ],
      },
      {
        name: 'Midnight Black',
        hex: '#141414',
        sku: 'NS-WW-003-BLK',
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 11 },
          { size: 'L', stock: 5 },
          { size: 'XL', stock: 3 },
        ],
      },
      {
        name: 'Peacock Teal',
        hex: '#084852',
        sku: 'NS-WW-003-TEA',
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 4 },
          { size: 'XL', stock: 2 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-004',
    name: 'Sitara Printed Chiffon 2-Piece Summer Suit',
    slug: 'sitara-printed-chiffon-2-piece-summer-suit',
    description: 'Effortless daytime luxury. Digital floral printed lawn shirt with delicate embroidered neckline patch, finished with lace inserts and paired with matching printed cambric culottes.',
    category: 'Summer Wear',
    subcategory: '2 Piece',
    fabric: 'Fine Lawn Shirt & Dyed Cambric Trouser',
    regularPrice: 5990,
    salePrice: 4790,
    sku: 'NS-SW-004',
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Powder Blue',
    colors: [
      {
        name: 'Powder Blue',
        hex: '#8DA8BA',
        sku: 'NS-SW-004-BLU',
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 5 },
          { size: 'S', stock: 10 },
          { size: 'M', stock: 14 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 4 },
        ],
      },
      {
        name: 'Coral Peach',
        hex: '#EE8875',
        sku: 'NS-SW-004-PCH',
        images: [
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 3 },
          { size: 'S', stock: 7 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 6 },
          { size: 'XL', stock: 2 },
        ],
      },
      {
        name: 'Mint Sage',
        hex: '#96B99F',
        sku: 'NS-SW-004-SGE',
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 4 },
          { size: 'S', stock: 8 },
          { size: 'M', stock: 12 },
          { size: 'L', stock: 5 },
          { size: 'XL', stock: 3 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-005',
    name: 'Afreen Chikankari Stitched Kurti',
    slug: 'afreen-chikankari-stitched-kurti',
    description: 'Timeless craftsmanship. Hand-embroidered chikankari work across front and sleeves with tonal schiffli borders. Can be paired casually with denims or formally with straight raw silk pants.',
    category: 'Stitched',
    subcategory: '1 Piece',
    fabric: 'Pure Cotton Georgette with Chikankari Threadwork',
    regularPrice: 4800,
    salePrice: 3850,
    sku: 'NS-ST-005',
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: false,
    isActive: true,
    rating: 4.9,
    reviewCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Ivory White',
    colors: [
      {
        name: 'Ivory White',
        hex: '#FFFFFF',
        sku: 'NS-ST-005-WHT',
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 6 },
          { size: 'S', stock: 12 },
          { size: 'M', stock: 18 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 5 },
        ],
      },
      {
        name: 'Dusty Lilac',
        hex: '#C3B1CE',
        sku: 'NS-ST-005-LLC',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 4 },
          { size: 'S', stock: 8 },
          { size: 'M', stock: 11 },
          { size: 'L', stock: 7 },
          { size: 'XL', stock: 3 },
        ],
      },
      {
        name: 'Jet Black',
        hex: '#111111',
        sku: 'NS-ST-005-BLK',
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'XS', stock: 5 },
          { size: 'S', stock: 9 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 8 },
          { size: 'XL', stock: 4 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-006',
    name: 'Parisa Festive Jacquard 3-Piece Unstitched',
    slug: 'parisa-festive-jacquard-3-piece-unstitched',
    description: 'Gold-woven luxury. 3-meter self-jacquard fabric with heavily embroidered organza neck and daman borders, matching cotton trouser and an opulent zari organza dupatta.',
    category: 'Unstitched',
    subcategory: '3 Piece',
    fabric: 'Self Jacquard Lawn with Zari Weave Dupatta',
    regularPrice: 8900,
    salePrice: 6990,
    sku: 'NS-UN-006',
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 22,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Mustard Gold',
    colors: [
      {
        name: 'Mustard Gold',
        hex: '#DCA22E',
        sku: 'NS-UN-006-MST',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'Unstitched', stock: 25 },
        ],
      },
      {
        name: 'Rust Amber',
        hex: '#B8532F',
        sku: 'NS-UN-006-RST',
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'Unstitched', stock: 18 },
        ],
      },
      {
        name: 'Royal Navy',
        hex: '#14223E',
        sku: 'NS-UN-006-NVY',
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'Unstitched', stock: 20 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-007',
    name: 'Dastaan Bridal Formal Lehnga Choli',
    slug: 'dastaan-bridal-formal-lehnga-choli',
    description: 'A masterpiece of royal Pakistani bridal couture. Handcrafted dabka, naqshi, mukesh, and Swarovski crystal embellishments over pure silk lehnga with a floor-length kalidar flair and heavy border dupatta.',
    category: 'Formal Wear',
    subcategory: '3 Piece',
    fabric: 'Pure Silk & French Net with Heavy Mukesh Handwork',
    regularPrice: 58000,
    salePrice: 49500,
    sku: 'NS-FW-007',
    isNewArrival: false,
    isBestSeller: false,
    isFeatured: true,
    isActive: true,
    rating: 5.0,
    reviewCount: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Scarlet Red',
    colors: [
      {
        name: 'Scarlet Red',
        hex: '#960E18',
        sku: 'NS-FW-007-SCL',
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 2 },
          { size: 'M', stock: 3 },
          { size: 'L', stock: 1 },
        ],
      },
      {
        name: 'Antique Gold',
        hex: '#B28E44',
        sku: 'NS-FW-007-GLD',
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 2 },
          { size: 'M', stock: 2 },
          { size: 'L', stock: 1 },
        ],
      },
    ],
  },
  {
    id: 'ns-prod-008',
    name: 'Gul-e-Rana Kashmiri Embroidered Woolen Kurta',
    slug: 'gul-e-rana-kashmiri-embroidered-woolen-kurta',
    description: 'Cozy artisanal warmth. Premium soft cashmere-blend kurta with traditional aari needlework motifs inspired by Kashmiri chinars and autumn leaves.',
    category: 'Winter Wear',
    subcategory: '1 Piece',
    fabric: 'Cashmere Wool Blend with Aari Needlework',
    regularPrice: 7200,
    salePrice: 5600,
    sku: 'NS-WW-008',
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    defaultColor: 'Forest Green',
    colors: [
      {
        name: 'Forest Green',
        hex: '#1D3E2F',
        sku: 'NS-WW-008-GRN',
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 6 },
        ],
      },
      {
        name: 'Burgundy Wine',
        hex: '#4A1224',
        sku: 'NS-WW-008-WIN',
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
        ],
        sizes: [
          { size: 'S', stock: 4 },
          { size: 'M', stock: 7 },
          { size: 'L', stock: 4 },
        ],
      },
    ],
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'NOOR10',
    type: 'percentage',
    value: 10,
    minSpend: 3000,
    isActive: true,
  },
  {
    code: 'WELCOME500',
    type: 'fixed',
    value: 500,
    minSpend: 4000,
    isActive: true,
  },
  {
    code: 'FESTIVE15',
    type: 'percentage',
    value: 15,
    minSpend: 8000,
    isActive: true,
  },
];

export async function seedDatabaseIfEmpty() {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      return; // Already populated
    }

    console.log('Seeding initial NOOR STUDIO database records...');
    const batch = writeBatch(db);

    // Seed Settings
    batch.set(doc(db, 'store_settings', 'general'), INITIAL_SETTINGS);

    // Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), cat);
    }

    // Seed Products
    for (const prod of INITIAL_PRODUCTS) {
      batch.set(doc(db, 'products', prod.id), prod);
    }

    await batch.commit();
    console.log('NOOR STUDIO database successfully seeded.');
  } catch (error) {
    console.warn('Seeding note:', error);
  }
}
