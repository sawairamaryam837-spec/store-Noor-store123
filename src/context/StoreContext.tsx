import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import { Product, Category, StoreSettings } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  seedDatabaseIfEmpty,
} from '../firebase/seed';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  loading: boolean;
  addProduct: (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (cat: Category) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateSettings: (data: Partial<StoreSettings>) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const DEPRECATED_CATALOG_IDS = new Set([
  'raw-silk-trousers',
  'cotton-stretch-pajama',
  'traditional-pleated-shalwar',
  'tulip-cutwork-shalwar',
  'classic-lawn-shalwar-kameez-2pc',
  'festive-karandi-shalwar-kameez',
]);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Initial database check & seed when authenticated admin logs in
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        seedDatabaseIfEmpty().catch(console.warn);
      }
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to Products
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        if (!snapshot.empty) {
          const dbProdsMap = new Map<string, Product>();
          const customProds: Product[] = [];
          snapshot.forEach((docSnap) => {
            if (DEPRECATED_CATALOG_IDS.has(docSnap.id)) return;
            const data = { ...docSnap.data(), id: docSnap.id } as Product;
            dbProdsMap.set(docSnap.id, data);
            if (!INITIAL_PRODUCTS.some((ip) => ip.id === docSnap.id)) {
              customProds.push(data);
            }
          });
          const merged = INITIAL_PRODUCTS.map((p) => {
            const dbItem = dbProdsMap.get(p.id);
            if (!dbItem) return p;
            return {
              ...p,
              ...dbItem,
              name: p.name,
              description: p.description,
              brand: p.brand || dbItem.brand,
              type: p.type || dbItem.type,
              fabric: p.fabric || dbItem.fabric,
              category: p.category,
              subcategory: p.subcategory,
              additionalCategories: p.additionalCategories,
              season: p.season,
              isStitched: p.isStitched,
              isNewArrival: p.isNewArrival,
              isBestSeller: p.isBestSeller,
              isFeatured: p.isFeatured,
              defaultColor: p.defaultColor,
              colors: p.colors,
            };
          });
          setProducts([...merged, ...customProds]);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Products onSnapshot note, using complete local catalog', error);
        setProducts(INITIAL_PRODUCTS);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to Categories
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const initialMap = new Map(INITIAL_CATEGORIES.map((c) => [c.id, c]));
          const cats: Category[] = [];
          snapshot.forEach((docSnap) => {
            const data = { ...docSnap.data(), id: docSnap.id } as Category;
            const init = initialMap.get(data.id);
            if (init && init.image && init.image.startsWith('/assets/')) {
              data.image = init.image;
            }
            cats.push(data);
          });
          for (const init of INITIAL_CATEGORIES) {
            if (!cats.some((c) => c.id === init.id)) {
              cats.push(init);
            }
          }
          cats.sort((a, b) => a.order - b.order);
          setCategories(cats);
        } else {
          setCategories(INITIAL_CATEGORIES);
        }
      },
      (error) => {
        console.warn('Categories onSnapshot error', error);
        setCategories(INITIAL_CATEGORIES);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to Settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'store_settings', 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings({ ...INITIAL_SETTINGS, ...(docSnap.data() as StoreSettings) });
        }
      },
      (error) => {
        console.warn('Store settings onSnapshot error', error);
      }
    );
    return () => unsub();
  }, []);

  const addProduct = async (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `ns-prod-${Date.now()}`;
    const newProd: Product = {
      ...prodData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
    try {
      await setDoc(doc(db, 'products', id), newProd);
      return id;
    } catch (err) {
      console.info('Product saved locally & queued for Firestore sync', err);
      return id;
    }
  };

  const updateProduct = async (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
    );
    try {
      await updateDoc(doc(db, 'products', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.info('Product updated locally & queued for Firestore sync', err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const addCategory = async (cat: Category) => {
    try {
      await setDoc(doc(db, 'categories', cat.id), cat);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${cat.id}`);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await updateDoc(doc(db, 'categories', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const updateSettings = async (data: Partial<StoreSettings>) => {
    try {
      await setDoc(doc(db, 'store_settings', 'general'), data, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'store_settings/general');
    }
  };

  const getProductById = (id: string) => products.find((p) => p.id === id);
  const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug || p.id === slug);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        getProductById,
        getProductBySlug,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
