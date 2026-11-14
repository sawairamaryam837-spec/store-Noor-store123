import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase/config';
import { CustomerInfo, UserProfile } from '../types';

const AUTHORIZED_ADMIN_EMAIL = 'noorstudio16mpa@gmail.com';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  adminVerified: boolean;
  savedAddress: Partial<CustomerInfo> | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  saveAddress: (addr: Partial<CustomerInfo>) => Promise<void>;
  updateUserProfile: (updates: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, phone: string, email: string, password: string) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signInAdminWithGoogle: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function verifyAdminWithBackend(firebaseUser: User): Promise<boolean> {
  if (!firebaseUser || firebaseUser.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
    return false;
  }
  try {
    const token = await firebaseUser.getIdToken();
    const response = await fetch('/api/auth/verify-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data?.success && data?.authorized === true);
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Partial<CustomerInfo> | null>(null);

  const loadOrCreateUserProfile = useCallback(async (firebaseUser: User, verifiedAdmin: boolean) => {
    const uid = firebaseUser.uid;
    const email = (firebaseUser.email || '').trim().toLowerCase();
    const nowIso = new Date().toISOString();
    let localStored: Partial<CustomerInfo> | null = null;

    try {
      const raw = localStorage.getItem(`noor_profile_${uid}`);
      if (raw) {
        localStored = JSON.parse(raw);
      }
    } catch {
      localStored = null;
    }

    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
        setSavedAddress({
          fullName: data.name || firebaseUser.displayName || localStored?.fullName || '',
          email: data.email || email,
          phone: data.phone || localStored?.phone || '',
          address: data.address || localStored?.address || '',
          city: data.city || localStored?.city || 'Lahore',
          postalCode: data.postalCode || localStored?.postalCode || '',
        });
      } else {
        const newProfile: UserProfile = {
          uid,
          name: (firebaseUser.displayName || localStored?.fullName || email.split('@')[0] || 'NOOR STUDIO Client').slice(0, 120),
          email,
          phone: (localStored?.phone || firebaseUser.phoneNumber || '').slice(0, 30),
          role: verifiedAdmin ? 'admin' : 'customer',
          createdAt: nowIso,
        };

        try {
          // Non-admin users strictly create with role: 'customer' in Firestore
          await setDoc(userRef, {
            ...newProfile,
            role: verifiedAdmin ? 'admin' : 'customer',
          });
        } catch (writeErr) {
          // If rules deny (e.g., offline or race), handle gracefully without crashing auth boot
          console.warn('User profile sync note:', writeErr);
        }

        setUserProfile(newProfile);
        setSavedAddress({
          fullName: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone,
          address: localStored?.address || '',
          city: localStored?.city || 'Lahore',
          postalCode: localStored?.postalCode || '',
        });

        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/auth/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newProfile),
          });
        } catch {
          // Backend sync best-effort
        }
      }
    } catch (err) {
      console.warn('Firestore profile load note:', err);
      if (localStored) {
        setSavedAddress(localStored);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        const backendAdminOk = await verifyAdminWithBackend(currentUser);
        setIsAdmin(backendAdminOk);
        setAdminVerified(backendAdminOk);
        await loadOrCreateUserProfile(currentUser, backendAdminOk);
      } else {
        setIsAdmin(false);
        setAdminVerified(false);
        setUserProfile(null);
        setSavedAddress(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadOrCreateUserProfile]);

  const getIdToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(forceRefresh);
    } catch {
      return null;
    }
  }, []);

  const saveAddress = async (addr: Partial<CustomerInfo>) => {
    setSavedAddress(addr);
    if (!user) return;

    try {
      localStorage.setItem(`noor_profile_${user.uid}`, JSON.stringify(addr));
    } catch (err) {
      console.warn('Local address cache note:', err);
    }

    const nowIso = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: (addr.fullName || userProfile?.name || user.displayName || 'Customer').slice(0, 120),
        phone: (addr.phone ?? userProfile?.phone ?? '').slice(0, 30),
        address: (addr.address || '').slice(0, 500),
        city: (addr.city || '').slice(0, 80),
        postalCode: (addr.postalCode || '').slice(0, 20),
        updatedAt: nowIso,
      });
    } catch (err) {
      console.warn('Firestore address update note:', err);
    }

    try {
      const token = await user.getIdToken();
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: addr.fullName,
          phone: addr.phone,
          address: addr.address,
          city: addr.city,
          postalCode: addr.postalCode,
        }),
      });
    } catch {
      // Backend sync best-effort
    }
  };

  const updateUserProfile = async (updates: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) => {
    if (!auth.currentUser) {
      throw new Error('Please sign in to update your profile.');
    }

    const cleanName = updates.name.trim().slice(0, 120);
    const cleanPhone = updates.phone.trim().slice(0, 30);
    const cleanAddress = (updates.address || '').trim().slice(0, 500);
    const cleanCity = (updates.city || 'Lahore').trim().slice(0, 80);
    const cleanPostal = (updates.postalCode || '').trim().slice(0, 20);
    const nowIso = new Date().toISOString();

    if (cleanName && auth.currentUser.displayName !== cleanName) {
      await updateProfile(auth.currentUser, { displayName: cleanName });
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, {
          name: cleanName,
          phone: cleanPhone,
          address: cleanAddress,
          city: cleanCity,
          postalCode: cleanPostal,
          updatedAt: nowIso,
        });
      } else {
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          name: cleanName,
          email: (auth.currentUser.email || '').toLowerCase(),
          phone: cleanPhone,
          role: 'customer',
          address: cleanAddress,
          city: cleanCity,
          postalCode: cleanPostal,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            name: cleanName,
            phone: cleanPhone,
            address: cleanAddress,
            city: cleanCity,
            postalCode: cleanPostal,
            updatedAt: nowIso,
          }
        : null
    );

    const nextAddress: Partial<CustomerInfo> = {
      fullName: cleanName,
      email: auth.currentUser.email || '',
      phone: cleanPhone,
      address: cleanAddress,
      city: cleanCity,
      postalCode: cleanPostal,
    };
    setSavedAddress(nextAddress);
    try {
      localStorage.setItem(`noor_profile_${auth.currentUser.uid}`, JSON.stringify(nextAddress));
    } catch {}

    try {
      const token = await auth.currentUser.getIdToken();
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          address: cleanAddress,
          city: cleanCity,
          postalCode: cleanPostal,
        }),
      });
    } catch {}
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const isBackendAdmin = await verifyAdminWithBackend(result.user);
        setIsAdmin(isBackendAdmin);
        setAdminVerified(isBackendAdmin);
        await loadOrCreateUserProfile(result.user, isBackendAdmin);
        return true;
      }
      return false;
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return false;
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      const isBackendAdmin = await verifyAdminWithBackend(cred.user);
      setIsAdmin(isBackendAdmin);
      setAdminVerified(isBackendAdmin);
      await loadOrCreateUserProfile(cred.user, isBackendAdmin);
    }
  };

  const signUpWithEmail = async (name: string, phone: string, email: string, pass: string) => {
    const cleanName = name.trim().slice(0, 120);
    const cleanPhone = phone.trim().slice(0, 30);
    const cleanEmail = email.trim().toLowerCase().slice(0, 160);

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (!cred.user) {
      throw new Error('Failed to create user account.');
    }

    await updateProfile(cred.user, { displayName: cleanName });

    const nowIso = new Date().toISOString();
    const customerProfile: UserProfile = {
      uid: cred.user.uid,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'customer',
      createdAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'users', cred.user.uid), customerProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
    }

    try {
      const token = await cred.user.getIdToken();
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerProfile),
      });
    } catch {}

    setUserProfile(customerProfile);
    setSavedAddress({
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    });
    setIsAdmin(false);
    setAdminVerified(false);
  };

  const signInAdmin = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);

    if (!cred.user) {
      throw new Error('Authentication failed.');
    }

    const signedInEmail = (cred.user.email || '').trim().toLowerCase();

    // Immediately reject and sign out any non-authorized email without exposing the admin address
    if (signedInEmail !== AUTHORIZED_ADMIN_EMAIL) {
      await fbSignOut(auth);
      setIsAdmin(false);
      setAdminVerified(false);
      throw new Error('Access denied. Invalid administrator credentials or unauthorized account.');
    }

    if (!cred.user.emailVerified) {
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // Ignore rate limits
      }
      await fbSignOut(auth);
      setIsAdmin(false);
      setAdminVerified(false);
      throw new Error(
        'Administrator email verification is required. A verification link has been sent to your email address. Please verify it and sign in again.'
      );
    }

    // Cryptographically verify admin authorization with Express backend
    const backendAuthorized = await verifyAdminWithBackend(cred.user);
    if (!backendAuthorized) {
      await fbSignOut(auth);
      setIsAdmin(false);
      setAdminVerified(false);
      throw new Error('Backend authorization check failed. Access denied.');
    }

    // Refresh token once to pick up synced custom claims if Firebase Admin SDK updated them
    await cred.user.getIdToken(true);
    setIsAdmin(true);
    setAdminVerified(true);
  };

  const signInAdminWithGoogle = async (): Promise<boolean> => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user) {
        return false;
      }

      const signedInEmail = (result.user.email || '').trim().toLowerCase();
      if (signedInEmail !== AUTHORIZED_ADMIN_EMAIL || !result.user.emailVerified) {
        await fbSignOut(auth);
        setIsAdmin(false);
        setAdminVerified(false);
        throw new Error('Access denied. Invalid administrator credentials or unauthorized account.');
      }

      const backendAuthorized = await verifyAdminWithBackend(result.user);
      if (!backendAuthorized) {
        await fbSignOut(auth);
        setIsAdmin(false);
        setAdminVerified(false);
        throw new Error('Backend authorization check failed. Access denied.');
      }

      await result.user.getIdToken(true);
      setIsAdmin(true);
      setAdminVerified(true);
      return true;
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return false;
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } finally {
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setAdminVerified(false);
      setSavedAddress(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        adminVerified,
        savedAddress,
        getIdToken,
        saveAddress,
        updateUserProfile,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAdmin,
        signInAdminWithGoogle,
        resetPassword,
        signOut,
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
