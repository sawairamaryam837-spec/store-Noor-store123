import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './components/home/HomePage';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetails } from './components/product/ProductDetails';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { CustomerDashboard } from './components/account/CustomerDashboard';
import { AuthModal } from './components/account/AuthModal';
import { SearchModal } from './components/search/SearchModal';
import {
  AboutPage,
  ContactPage,
  ShippingPolicyPage,
  ReturnsPolicyPage,
  FAQsPage,
  PrivacyPolicyPage,
  TermsAndConditionsPage,
} from './components/info/InfoPages';
import { Product, Order } from './types';
import { MessageCircle, Loader2 } from 'lucide-react';

function isPrivateAdminPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === '/admin' || normalized === '/admin/login';
}

function MainApp() {
  const { user, loading: authLoading, isAdmin, adminVerified } = useAuth();

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    isPrivateAdminPath(window.location.pathname)
  );
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Sync URL navigation (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      const adminPath = isPrivateAdminPath(window.location.pathname);
      setIsAdminRoute(adminPath);
      if (!adminPath && currentView === 'admin') {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  // Strict route guard: if a non-admin logged-in customer manually navigates to /admin, immediately deny and redirect to storefront
  useEffect(() => {
    if (!authLoading && isAdminRoute && user && !(isAdmin && adminVerified)) {
      window.history.replaceState({}, '', '/');
      setIsAdminRoute(false);
      setCurrentView('home');
    }
  }, [authLoading, isAdminRoute, user, isAdmin, adminVerified]);

  // Sync verified admin route URL
  useEffect(() => {
    if (!authLoading && isAdminRoute && user && isAdmin && adminVerified) {
      if (window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [authLoading, isAdminRoute, user, isAdmin, adminVerified]);

  const navigateToStoreHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setIsAdminRoute(false);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Private Admin Route Rendering (NEVER accessible from customer UI; strictly auth-guarded)
  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#0F0D0B] text-[#FAF8F5] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
          <p className="text-xs uppercase tracking-[0.25em] text-[#A89D93]">
            Verifying Executive Session...
          </p>
        </div>
      );
    }

    if (!user) {
      return <AdminLoginPage onBackToStore={navigateToStoreHome} />;
    }

    if (isAdmin && adminVerified) {
      return <AdminDashboard onExit={navigateToStoreHome} />;
    }

    // Fallback redirect state while useEffect replaces URL to '/'
    return null;
  }

  // Never allow customer view state to jump to 'admin' directly
  const safeView = currentView === 'admin' ? 'home' : currentView;

  // Navigation handlers
  const handleSelectProduct = (product: Product, colorName?: string) => {
    setSelectedProduct(product);
    setSelectedColorName(colorName);
    setCurrentView('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToShop = (category: string | null = null, subcategory: string | null = null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSearchQuery('');
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-[#FAF8F5] text-[#1F1C1A]">
      {/* Global Header */}
      <Header
        currentView={safeView}
        setCurrentView={(v) => setCurrentView(v === 'admin' ? 'home' : v)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {safeView === 'home' && (
          <HomePage
            onNavigateToShop={handleNavigateToShop}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {safeView === 'shop' && (
          <ShopPage
            initialCategory={selectedCategory}
            initialSubcategory={selectedSubcategory}
            searchQuery={searchQuery}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {safeView === 'product-details' && selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            initialColorName={selectedColorName}
            onSelectProduct={handleSelectProduct}
            onBack={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProceedToCheckout={() => {
              setCurrentView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {safeView === 'checkout' && (
          <CheckoutPage
            onBackToShop={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewOrder={(_order: Order) => {
              setCurrentView('account');
            }}
          />
        )}

        {safeView === 'account' && (
          <CustomerDashboard
            initialTab="orders"
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => setCurrentView('shop')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {safeView === 'tracking' && (
          <CustomerDashboard
            initialTab="tracking"
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => setCurrentView('shop')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {safeView === 'wishlist' && (
          <CustomerDashboard
            initialTab="wishlist"
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => setCurrentView('shop')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {safeView === 'about' && <AboutPage />}
        {safeView === 'contact' && <ContactPage />}
        {safeView === 'shipping-policy' && <ShippingPolicyPage />}
        {safeView === 'returns-policy' && <ReturnsPolicyPage />}
        {safeView === 'faqs' && <FAQsPage />}
        {safeView === 'privacy-policy' && <PrivacyPolicyPage />}
        {safeView === 'terms-and-conditions' && <TermsAndConditionsPage />}
      </main>

      {/* Shopping Bag Slide-Over Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Global Floating WhatsApp Button */}
      <aside aria-label="Quick contact" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2.5">
        <a
          href="https://wa.me/923284454746?text=Assalam-o-Alaikum%20NOOR%20STUDIO%2C%20I%20need%20assistance%20with%20an%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 p-3 sm:p-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          title="Chat with NOOR STUDIO on WhatsApp (03284454746)"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 text-xs font-semibold pr-1">
            WhatsApp Support
          </span>
        </a>
      </aside>

      {/* Global Footer */}
      <Footer
        onNavigate={(view, category) => {
          if (view === 'shop') {
            handleNavigateToShop(category);
          } else {
            setCurrentView(view === 'admin' ? 'home' : view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <WishlistProvider>
            <MainApp />
          </WishlistProvider>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
