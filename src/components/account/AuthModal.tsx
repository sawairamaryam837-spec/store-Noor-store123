import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithGoogle,
    signInWithGoogleDirect,
    signInWithEmail,
    signUpWithEmail,
    ensureGoogleOAuthReady,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDirectGoogleFallback, setShowDirectGoogleFallback] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      ensureGoogleOAuthReady();
    } else {
      setShowDirectGoogleFallback(false);
    }
  }, [isOpen, ensureGoogleOAuthReady]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      const phoneDigits = phone.replace(/[^0-9]/g, '');
      if (phoneDigits.length < 10) {
        setError('Please enter a valid contact phone number (e.g. 03001234567).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithEmail(name, phone, email, password);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in is not yet enabled in Firebase Console. Please click "Continue with Google" above to sign in immediately.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError('Incorrect email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(err?.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatGoogleError = (err: any) => {
    const code = err?.code || '';
    if (code === 'auth/popup-blocked') {
      setShowDirectGoogleFallback(true);
      setError('Browser blocked the sign-in popup. Please allow popups or try Direct Google Sign-In below.');
    } else if (code === 'auth/unauthorized-domain') {
      setShowDirectGoogleFallback(true);
      setError(
        `This domain (${window.location.hostname}) is not authorized in Firebase Console > Authentication > Settings > Authorized domains.`
      );
    } else if (code === 'auth/operation-not-allowed') {
      setShowDirectGoogleFallback(false);
      setError('Google sign-in is disabled in Firebase Console. Please enable it under Authentication > Sign-in method.');
    } else if (code === 'auth/internal-error' || code === 'auth/web-storage-unsupported') {
      setShowDirectGoogleFallback(true);
      setError(
        `Browser blocked embedded popup storage (${code}). Use Direct Google Sign-In below or open the app in a new tab.`
      );
    } else if (code === 'auth/network-request-failed') {
      setShowDirectGoogleFallback(true);
      setError(
        'Could not complete the standard Google popup bridge (network or iframe restriction). Click "Try Direct Google Sign-In" below or open in a new tab.'
      );
    } else {
      setShowDirectGoogleFallback(false);
      setError(
        code
          ? `Google sign-in error (${code}): ${err?.message || 'Please try again.'}`
          : err?.message || 'Google sign in was not completed. Please try again.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setShowDirectGoogleFallback(false);
    try {
      setLoading(true);
      const signedIn = await signInWithGoogle();
      if (signedIn) {
        onClose();
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      formatGoogleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGoogleSignIn = async () => {
    setError(null);
    try {
      setLoading(true);
      const signedIn = await signInWithGoogleDirect();
      if (signedIn) {
        setShowDirectGoogleFallback(false);
        onClose();
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      formatGoogleError(err);
    } finally {
      setLoading(false);
    }
  };

  const isEmbeddedIframe =
    typeof window !== 'undefined' && window.self !== window.top;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-8 shadow-2xl border border-[#EADBCE] relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img
            src="/assets/aistudio/logo_8d8d5177.jpeg"
            alt="NOOR STUDIO"
            className="h-16 w-auto object-contain rounded-lg shadow-md mb-2 border border-[#EADBCE] bg-black"
          />
          <span className="font-serif text-2xl tracking-[0.2em] font-bold text-[#1F1C1A] uppercase">
            NOOR STUDIO
          </span>
          <p className="text-[10px] uppercase tracking-widest text-[#B88E3E] font-medium mt-0.5">
            Wear Your Elegance Style Of Excellence
          </p>
          <p className="text-xs text-[#8C827A] mt-1">
            {mode === 'signin' && 'Sign in to access your profile, orders, and saved wishlist'}
            {mode === 'signup' && 'Create your NOOR STUDIO customer account'}
            {mode === 'forgot' && 'Reset your account password'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 space-y-2"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {showDirectGoogleFallback && mode !== 'forgot' && (
              <div className="flex flex-wrap items-center gap-2 pl-6">
                <button
                  type="button"
                  onClick={handleDirectGoogleSignIn}
                  disabled={loading}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1F1C1A] text-white text-[11px] font-semibold hover:bg-[#B88E3E] transition disabled:opacity-50"
                >
                  Try Direct Google Sign-In
                </button>
                {isEmbeddedIframe && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-300 bg-white text-red-800 text-[11px] font-semibold hover:bg-red-100 transition"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2"
          >
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
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#D9CCC2] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1F1C1A] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
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
            <>
              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Malik"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1F1C1A] mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-[#1F1C1A] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A89D93] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                autoComplete="email"
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
                      setSuccessMessage(null);
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
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-[#D9CCC2] focus:outline-none focus:border-[#B88E3E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-2 p-0.5 text-[#8C827A] hover:text-[#1F1C1A] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1F1C1A] hover:bg-[#B88E3E] text-white font-semibold uppercase tracking-wider transition shadow-md disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : mode === 'signin' ? (
              'Sign In'
            ) : mode === 'signup' ? (
              'Create Account'
            ) : (
              'Send Reset Link'
            )}
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
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#B88E3E] hover:underline"
              >
                Create Account
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
                  setSuccessMessage(null);
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
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#B88E3E] hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
