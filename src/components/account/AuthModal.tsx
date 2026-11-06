import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signInAsAdminDemo,
    signInAsCustomerDemo,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(name, email, password);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Incorrect email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        // User closed the popup window; clean exit
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setError('Browser blocked Google sign-in popup. You can also sign in with Email or Demo below.');
      } else {
        setError('Google sign in was not completed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EADBCE] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <span className="font-serif text-2xl tracking-[0.2em] font-bold text-[#1F1C1A] uppercase">
            NOOR STUDIO
          </span>
          <p className="text-xs text-[#8C827A] mt-1">
            {mode === 'signin' && 'Sign in to access your orders and saved wishlist'}
            {mode === 'signup' && 'Create your NOOR STUDIO customer account'}
            {mode === 'forgot' && 'Reset your account password'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google One-Click Auth */}
        {mode !== 'forgot' && (
          <div className="space-y-4 mb-4">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-[#D9CCC2] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1F1C1A] transition flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#A89D93]">
              <div className="flex-1 h-px bg-[#EADBCE]" />
              <span>or with email</span>
              <div className="flex-1 h-px bg-[#EADBCE]" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block font-semibold text-[#1F1C1A] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Zahra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-[#1F1C1A] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#1F1C1A]">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-[#B88E3E] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50 mt-2"
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Create Account'
              : 'Send Reset Link'}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-5 text-center text-xs text-[#7A7169] pt-4 border-t border-[#F2ECE6]">
          {mode === 'signin' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold text-[#B88E3E] hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold text-[#B88E3E] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold text-[#B88E3E] hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>

        {/* 1-Click Preview Test Access */}
        <div className="mt-4 pt-3 border-t border-[#F2ECE6] text-center">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#A89D93] mb-2">
            Instant Preview Access
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                signInAsCustomerDemo();
                onClose();
              }}
              className="py-1 px-3 rounded-lg border border-[#D9CCC2] hover:bg-[#FAF8F5] text-[11px] font-semibold text-[#5A524C] transition"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => {
                signInAsAdminDemo();
                onClose();
              }}
              className="py-1 px-3 rounded-lg bg-[#1F1C1A] hover:bg-[#B88E3E] text-[11px] font-semibold text-white transition"
            >
              Store Admin (sawaira)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
