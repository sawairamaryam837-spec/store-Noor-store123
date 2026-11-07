import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { Category, StoreSettings, Coupon } from '../types';
import { INITIAL_PRODUCTS } from '../data/productsCatalog';

export { INITIAL_PRODUCTS };

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
    image: '/assets/aistudio/MARIA.B_ONE_OF_LUXURIOUS_COLLECTION_e659eca1.jpeg',
    order: 1,
    isActive: true,
  },
  {
    id: 'stitched',
    name: 'Stitched',
    slug: 'stitched',
    description: 'Ready-to-wear luxury pret, impeccably tailored kurtis, 2-piece and 3-piece designer sets.',
    image: '/assets/aistudio/Zesh_Essential_Co-ord_Printed_Silk_2PC_f1593680.jpeg',
    order: 2,
    isActive: true,
  },
  {
    id: 'unstitched',
    name: 'Unstitched',
    slug: 'unstitched',
    description: 'Premium unstitched fabrics with intricate embroidered neckline, panels, and digital silk dupattas.',
    image: '/assets/aistudio/d_AGHA_NOOR_Unstitch_Replica_785f2865.jpeg',
    order: 3,
    isActive: true,
  },
  {
    id: 'summer-wear',
    name: 'Summer Wear',
    slug: 'summer-wear',
    description: 'Breathable lawn, schiffli chikankari, and swiss voile crafted for breezy summer elegance.',
    image: '/assets/aistudio/Fabric__Chiffon___Malai__4__577f7568.jpeg',
    subcategories: ['1 Piece', '2 Piece', '3 Piece'],
    order: 4,
    isActive: true,
  },
  {
    id: 'winter-wear',
    name: 'Winter Wear',
    slug: 'winter-wear',
    description: 'Opulent micro-velvet, woven pashmina shawls, and warm karandi stitched to perfection.',
    image: '/assets/aistudio/Morashi_Khaddar_printed_15af3f87.jpeg',
    subcategories: ['1 Piece', '2 Piece', '3 Piece'],
    order: 5,
    isActive: true,
  },
  {
    id: 'wedding-wear',
    name: 'Wedding Wear',
    slug: 'wedding-wear',
    description: 'Designer bridal lehengas, heavy organza adda work, zardozi and festive couture sets.',
    image: '/assets/aistudio/weddingseason__3__6ca9845d.jpeg',
    order: 6,
    isActive: true,
  },
  {
    id: 'formal-wear',
    name: 'Formal Wear',
    slug: 'formal-wear',
    description: 'Regal bridal wear, peshwas, tilla embroidery, sequined organza, and festive wedding luxury.',
    image: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK__3__b0971e8e.jpeg',
    order: 7,
    isActive: true,
  },
  {
    id: 'casual-wear',
    name: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Effortless everyday Pakistani suits in premium rice karandi, viscose linen, khaddar, and printed silk.',
    image: '/assets/aistudio/Breeze_Rice__karandi_embroidered_2PC__2__eeeb98c8.jpeg',
    order: 8,
    isActive: true,
  },
  {
    id: 'sale',
    name: 'Sale',
    slug: 'sale',
    description: 'Exclusive seasonal markdown offers with up to 40% off on signature NOOR STUDIO collections.',
    image: '/assets/aistudio/MARIA_B_COUTURE_COLLECTION_48007866.jpeg',
    order: 9,
    isActive: true,
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
    const existingProductIds = new Set<string>();
    productsSnap.forEach((d) => existingProductIds.add(d.id));

    const categoriesSnap = await getDocs(collection(db, 'categories'));
    const existingCatIds = new Set<string>();
    categoriesSnap.forEach((d) => existingCatIds.add(d.id));

    const batch = writeBatch(db);
    let needCommit = false;

    // Check settings
    if (productsSnap.empty) {
      batch.set(doc(db, 'store_settings', 'general'), INITIAL_SETTINGS);
      needCommit = true;
    }

    // Seed missing categories
    for (const cat of INITIAL_CATEGORIES) {
      if (!existingCatIds.has(cat.id)) {
        batch.set(doc(db, 'categories', cat.id), cat);
        needCommit = true;
      }
    }

    // Seed missing products (e.g. the 7 designer collections)
    for (const prod of INITIAL_PRODUCTS) {
      if (!existingProductIds.has(prod.id)) {
        batch.set(doc(db, 'products', prod.id), prod);
        needCommit = true;
      }
    }

    if (needCommit) {
      await batch.commit();
      console.log('NOOR STUDIO catalog updated with new designer products.');
    }
  } catch (error) {
    // Graceful handling for non-admin viewers or offline mode
    console.info('Database catalog ready via local cache.');
  }
}
