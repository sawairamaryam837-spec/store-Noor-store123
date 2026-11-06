import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { CustomerInfo } from '../types';

interface AuthContextType {
  user: User | any | null;
  loading: boolean;
  isAdmin: boolean;
  savedAddress: Partial<CustomerInfo> | null;
  saveAddress: (addr: Partial<CustomerInfo>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (name: string, e: string, p: string) => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsAdminDemo: () => void;
  signInAsCustomerDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'sawairamaryam837@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Partial<CustomerInfo> | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Admin check: either bootstrap email or admin document
        const isBootstrapAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        let hasAdminDoc = false;
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          hasAdminDoc = adminDoc.exists();
        } catch {
          // Rule may deny if not admin yet
        }
        setIsAdmin(isBootstrapAdmin || hasAdminDoc);

        // Fetch customer profile & saved address from localStorage or firestore
        try {
          const stored = localStorage.getItem(`noor_profile_${currentUser.uid}`);
          if (stored) {
            setSavedAddress(JSON.parse(stored));
          }
        } catch (e) {
          console.warn('Address load warning', e);
        }
      } else {
        setIsAdmin(false);
        setSavedAddress(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveAddress = async (addr: Partial<CustomerInfo>) => {
    setSavedAddress(addr);
    if (user) {
      try {
        localStorage.setItem(`noor_profile_${user.uid}`, JSON.stringify(addr));
      } catch (err) {
        console.error('Failed to save address', err);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        // User voluntarily closed or restarted the popup; do not throw unhandled error
        return;
      }
      console.warn('Google sign in note:', err?.code || err?.message || err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signInAsAdminDemo = () => {
    const demoAdmin: any = {
      uid: 'admin_sawaira_master',
      email: ADMIN_EMAIL,
      displayName: 'Sawaira Maryam (Admin)',
      emailVerified: true,
    };
    setUser(demoAdmin);
    setIsAdmin(true);
  };

  const signInAsCustomerDemo = () => {
    const demoCustomer: any = {
      uid: 'customer_demo_fatima',
      email: 'fatima.malik@example.com',
      displayName: 'Fatima Malik',
      emailVerified: true,
    };
    setUser(demoCustomer);
    setIsAdmin(false);
  };

  const signOut = async () => {
    setUser(null);
    setIsAdmin(false);
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore if signed in via demo
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        savedAddress,
        saveAddress,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        signInAsAdminDemo,
        signInAsCustomerDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
