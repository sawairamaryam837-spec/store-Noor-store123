import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { CartItem, Coupon } from '../types';
import { useAuth } from './AuthContext';
import { INITIAL_COUPONS } from '../firebase/seed';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => boolean;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'noor_studio_cart_guest';
const FREE_SHIPPING_LIMIT = 5000;
const STANDARD_SHIPPING_FEE = 250;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load cart on init or user change
  useEffect(() => {
    async function loadCart() {
      const isFirebaseUser = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid);
      if (isFirebaseUser && user) {
        try {
          const cartDoc = await getDoc(doc(db, 'carts', user.uid));
          if (cartDoc.exists() && cartDoc.data()?.items) {
            setItems(cartDoc.data().items as CartItem[]);
          } else {
            // Check if there was a guest cart and merge
            const local = localStorage.getItem(GUEST_CART_KEY);
            if (local) {
              const parsed = JSON.parse(local);
              setItems(parsed);
              await setDoc(doc(db, 'carts', user.uid), {
                userId: user.uid,
                items: parsed,
                updatedAt: new Date().toISOString(),
              });
            } else {
              setItems([]);
            }
          }
        } catch (err) {
          console.warn('Failed to load user cart from firestore', err);
        }
      } else {
        // Guest cart
        try {
          const local = localStorage.getItem(GUEST_CART_KEY);
          if (local) {
            setItems(JSON.parse(local));
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        }
      }
      setHasLoaded(true);
    }
    loadCart();
  }, [user]);

  // Persist cart
  useEffect(() => {
    if (!hasLoaded) return;

    const isFirebaseUser = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid);
    if (isFirebaseUser && user) {
      setDoc(doc(db, 'carts', user.uid), {
        userId: user.uid,
        items,
        updatedAt: new Date().toISOString(),
      }).catch((e) => {
        console.warn('Firestore cart sync warn:', e);
      });
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  }, [items, user, hasLoaded]);

  const addToCart = (newItem: Omit<CartItem, 'id'>): boolean => {
    const id = `${newItem.productId}_${newItem.colorName}_${newItem.size}`;
    const existing = items.find((i) => i.id === id);

    if (existing) {
      if (existing.quantity + newItem.quantity > newItem.maxStock) {
        return false; // exceeds max stock
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + newItem.quantity } : i))
      );
    } else {
      if (newItem.quantity > newItem.maxStock) {
        return false;
      }
      setItems((prev) => [...prev, { ...newItem, id }]);
    }
    setIsCartOpen(true);
    return true;
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) return item; // Cannot exceed max stock
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === clean && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (found.minSpend && subtotal < found.minSpend) {
      return {
        success: false,
        message: `Coupon requires a minimum order of Rs. ${found.minSpend.toLocaleString()}.`,
      };
    }
    setCoupon(found);
    return {
      success: true,
      message: `Coupon ${found.code} applied successfully!`,
    };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery: Free if subtotal >= 5000, else 250
  const shippingCost = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : STANDARD_SHIPPING_FEE;

  // Coupon discount
  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discount = Math.min(coupon.value, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discount + shippingCost);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        shippingCost,
        discount,
        total,
        coupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
