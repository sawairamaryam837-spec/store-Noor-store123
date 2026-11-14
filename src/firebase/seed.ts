import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import { db, auth } from './config';
import { Category, StoreSettings, Coupon } from '../types';
import { INITIAL_PRODUCTS } from '../data/productsCatalog';

export { INITIAL_PRODUCTS };

export const INITIAL_SETTINGS: StoreSettings = {
  brandName: 'NOOR STUDIO',
  tagline: 'Wear Your Elegance Style Of Excellence',
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
    description: 'Ready-to-wear luxury pret, impeccably tailored silk co-ords, kurtis, and designer suits.',
    image: '/assets/aistudio/SILK_COLLECTION_2026__2__316e6055.jpeg',
    order: 2,
    isActive: true,
  },
  {
    id: 'unstitched',
    name: 'Unstitched',
    slug: 'unstitched',
    description: 'Premium unstitched fabrics with embroidered necklines, panels, and organza or khaddar shawls.',
    image: '/assets/aistudio/d_AGHA_NOOR_Unstitch_Replica_785f2865.jpeg',
    order: 3,
    isActive: true,
  },
  {
    id: 'summer-wear',
    name: 'Summer Wear',
    slug: 'summer-wear',
    description: 'Breathable summer chiffon, silk pret, and swiss voile in 1PC, 2PC, and 3PC ensembles.',
    image: '/assets/aistudio/Fabric__Chiffon___Malai__2__7cdb36cf.jpeg',
    subcategories: ['1 Piece', '2 Piece', '3 Piece'],
    order: 4,
    isActive: true,
  },
  {
    id: 'winter-wear',
    name: 'Winter Wear',
    slug: 'winter-wear',
    description: 'Warm rice karandi, morashi khaddar, and viscose linen in 1PC, 2PC, and 3PC seasonal styles.',
    image: '/assets/aistudio/Morashi_Khaddar_printed_15af3f87.jpeg',
    subcategories: ['1 Piece', '2 Piece', '3 Piece'],
    order: 5,
    isActive: true,
  },
  {
    id: 'casual-wear',
    name: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Effortless everyday Pakistani suits in printed silk co-ords, rice karandi, and viscose linen.',
    image: '/assets/aistudio/Zesh_Essential_Co-ord_Printed_Silk_2PC__2__3a02ef29.jpeg',
    order: 6,
    isActive: true,
  },
  {
    id: 'formal-wear',
    name: 'Formal Wear',
    slug: 'formal-wear',
    description: 'Regal peshwas, embroidered chiffon, tilla accents, and festive formal luxury.',
    image: '/assets/aistudio/MOST_ELEGANT_OUTFITT_BY_IZNIK__3__b0971e8e.jpeg',
    order: 7,
    isActive: true,
  },
  {
    id: 'wedding-wear',
    name: 'Wedding Wear',
    slug: 'wedding-wear',
    description: 'Designer bridal lehengas, heavy organza adda work, zardozi, and festive couture sets.',
    image: '/assets/aistudio/weddingseason__3__6ca9845d.jpeg',
    order: 8,
    isActive: true,
  },
  {
    id: 'bottoms',
    name: 'Bottoms',
    slug: 'bottoms',
    description: 'Tailored trousers, cigarette pants, and shalwars uploading soon.',
    image: '/assets/aistudio/SILK_COLLECTION_2026_e0cd6ab7.jpeg',
    order: 9,
    isActive: true,
  },
  {
    id: 'sale',
    name: 'Sale',
    slug: 'sale',
    description: 'Exclusive seasonal markdown offers with up to 40% off on signature NOOR STUDIO collections.',
    image: '/assets/aistudio/MARIA_B_COUTURE_COLLECTION__4__fb96f40f.jpeg',
    order: 10,
    isActive: true,
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'NOOR STUDIO',
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
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.emailVerified || currentUser.email?.toLowerCase() !== 'noorstudio16mpa@gmail.com') {
      return;
    }
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
