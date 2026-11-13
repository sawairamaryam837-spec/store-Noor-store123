import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = 'noor_studio_wishlist_guest';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function loadWishlist() {
      const isFirebaseUser = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid);
      if (isFirebaseUser && user) {
        try {
          const docSnap = await getDoc(doc(db, 'wishlists', user.uid));
          if (docSnap.exists() && docSnap.data()?.productIds) {
            setWishlistIds(docSnap.data().productIds as string[]);
          } else {
            const local = localStorage.getItem(GUEST_WISHLIST_KEY);
            const initial = local ? JSON.parse(local) : [];
            setWishlistIds(initial);
          }
        } catch (e) {
          console.warn('Wishlist load error:', e);
        }
      } else {
        const local = localStorage.getItem(GUEST_WISHLIST_KEY);
        setWishlistIds(local ? JSON.parse(local) : []);
      }
      setHasLoaded(true);
    }
    loadWishlist();
  }, [user]);

  useEffect(() => {
    if (!hasLoaded) return;
    const isFirebaseUser = Boolean(user && auth.currentUser && auth.currentUser.uid === user.uid);
    if (isFirebaseUser && user) {
      setDoc(doc(db, 'wishlists', user.uid), {
        userId: user.uid,
        productIds: wishlistIds,
        updatedAt: new Date().toISOString(),
      }).catch((e) => console.warn('Wishlist sync warning:', e));
    } else {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, user, hasLoaded]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
