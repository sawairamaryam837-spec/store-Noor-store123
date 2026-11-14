import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginPageProps {
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onBackToStore }) => {
  const {
    signInAdmin,
    signInAdminWithGoogle,
    signInAdminWithGoogleDirect,
    ensureGoogleOAuthReady,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDirectGoogleFallback, setShowDirectGoogleFallback] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    ensureGoogleOAuthReady();
  }, [ensureGoogleOAuthReady]);

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
        `Browser blocked embedded popup storage (${code}). Use Direct Google Sign-In below or open /admin in a new tab.`
      );
    } else if (code === 'auth/network-request-failed') {
      setShowDirectGoogleFallback(true);
      setError(
        'Could not complete the standard Google popup bridge (network or iframe restriction). Click "Try Direct Google Sign-In" below or open /admin in a new tab.'
      );
    } else {
      setShowDirectGoogleFallback(false);
      setError(
        code
          ? `Google sign-in error (${code}): ${err?.message || 'Unable to authenticate.'}`
          : err?.message || 'Unable to authenticate administrator access.'
      );
    }
  };

  const handleGoogleAdminSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setShowDirectGoogleFallback(false);
    setLoading(true);
    try {
      await signInAdminWithGoogle();
    } catch (err: any) {
      formatGoogleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectGoogleAdminSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const signedIn = await signInAdminWithGoogleDirect();
      if (signedIn) {
        setShowDirectGoogleFallback(false);
      }
    } catch (err: any) {
      formatGoogleError(err);
    } finally {
      setLoading(false);
    }
  };

  const isEmbeddedIframe =
    typeof window !== 'undefined' && window.self !== window.top;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }

    if (mode === 'login' && !password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signInAdmin(email, password);
      } else {
        await resetPassword(email);
        setSuccessMessage(
          'If this email is registered with an active account, a password reset link has been dispatched.'
        );
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password sign-in is not yet enabled in Firebase Console. Use "Continue with Google" below for immediate access, or enable Email/Password under Authentication > Sign-in method.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setError('Invalid administrator email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed sign-in attempts. Please wait a few minutes and try again.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message || 'Unable to authenticate administrator access.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0D0B] text-[#FAF8F5] flex flex-col justify-between px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Luxury Gold Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-[#C5A059]/10 blur-3xl"
      />

      {/* Top Back Navigation */}
      <div className="max-w-md w-full mx-auto relative z-10">
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs text-[#A89D93] hover:text-[#C5A059] transition py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full mx-auto my-8 relative z-10">
        <div className="bg-[#181512] border border-[#C5A059]/30 rounded-2xl shadow-2xl p-6 sm:p-9 space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1F1C18] border border-[#C5A059]/40 shadow-inner mx-auto">
              <ShieldCheck className="w-7 h-7 text-[#C5A059]" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#C5A059] font-semibold">
                Private Management Portal
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.14em] text-white uppercase mt-1">
                NOOR STUDIO
              </h1>
              <p className="text-xs text-[#9E9389] mt-1.5">
                {mode === 'login'
                  ? 'Sign in with authorized executive credentials to continue.'
                  : 'Enter your administrator email to receive a password reset link.'}
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 space-y-2.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
              {showDirectGoogleFallback && mode === 'login' && (
                <div className="flex flex-wrap items-center gap-2 pl-6">
                  <button
                    type="button"
                    onClick={handleDirectGoogleAdminSignIn}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-[#C5A059] text-[#12100E] text-[11px] font-bold hover:bg-[#D4B16B] transition disabled:opacity-50"
                  >
                    Try Direct Google Sign-In
                  </button>
                  {isEmbeddedIframe && (
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-400/40 bg-red-950/80 text-red-100 text-[11px] font-semibold hover:bg-red-900/60 transition"
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
              className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {mode === 'login' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAdminSignIn}
                disabled={loading}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-[#3A322B] bg-[#100E0C] hover:border-[#C5A059]/70 hover:bg-[#1E1A16] text-xs font-semibold text-[#FAF8F5] transition flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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

              <div className="flex items-center gap-3 text-[11px] text-[#7D736A]">
                <div className="flex-1 h-px bg-[#2D2824]" />
                <span>or sign in with email</span>
                <div className="flex-1 h-px bg-[#2D2824]" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[11px] uppercase tracking-wider font-semibold text-[#D8CCC4] mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter authorized email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#100E0C] border border-[#332D27] text-white placeholder-[#696058] focus:outline-none focus:border-[#C5A059] transition"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="text-[11px] uppercase tracking-wider font-semibold text-[#D8CCC4]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-[#C5A059] hover:text-[#E5C687] transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-3" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#100E0C] border border-[#332D27] text-white placeholder-[#696058] focus:outline-none focus:border-[#C5A059] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 p-0.5 text-[#8C827A] hover:text-[#C5A059] transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4B16B] text-[#12100E] font-bold uppercase tracking-widest transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Verifying Access...' : 'Sending Link...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In to Admin Portal' : 'Send Password Reset Link'}</span>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="pt-3 border-t border-[#2D2824] text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-semibold text-[#C5A059] hover:underline"
              >
                Back to Administrator Sign In
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-[#2D2824] text-center">
            <p className="text-[11px] text-[#787069]">
              Protected by Firebase Authentication &amp; server-side role verification.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#696058] relative z-10">
        &copy; {new Date().getFullYear()} NOOR STUDIO Executive Portal
      </div>
    </div>
  );
};
