import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
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
import { CustomerDashboard } from './components/account/CustomerDashboard';
import { AuthModal } from './components/account/AuthModal';
import { SearchModal } from './components/search/SearchModal';
import {
  AboutPage,
  ContactPage,
  ShippingPolicyPage,
  ReturnsPolicyPage,
  FAQsPage,
} from './components/info/InfoPages';
import { Product, Order } from './types';
import { MessageCircle, Phone } from 'lucide-react';

function MainApp() {
  const { settings } = useStore();

  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColorName, setSelectedColorName] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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

  // If in Admin Dashboard full view
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onExit={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1C1A]">
      {/* Global Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubcategory={selectedSubcategory}
        setSelectedSubcategory={setSelectedSubcategory}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openSearchModal={() => setIsSearchModalOpen(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onNavigateToShop={handleNavigateToShop}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'shop' && (
          <ShopPage
            initialCategory={selectedCategory}
            initialSubcategory={selectedSubcategory}
            searchQuery={searchQuery}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product-details' && selectedProduct && (
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

        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToShop={() => {
              setCurrentView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewOrder={(order: Order) => {
              setCurrentView('account');
            }}
          />
        )}

        {currentView === 'account' && (
          <CustomerDashboard
            initialTab="orders"
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'tracking' && (
          <CustomerDashboard
            initialTab="tracking"
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'wishlist' && (
          <CustomerDashboard
            initialTab="wishlist"
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => setCurrentView('shop')}
          />
        )}

        {currentView === 'about' && <AboutPage />}
        {currentView === 'contact' && <ContactPage />}
        {currentView === 'shipping-policy' && <ShippingPolicyPage />}
        {currentView === 'returns-policy' && <ReturnsPolicyPage />}
        {currentView === 'faqs' && <FAQsPage />}
        {currentView === 'privacy-policy' && <ShippingPolicyPage />}
      </main>

      {/* Shopping Bag Slide-Over Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Modals */}
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
      <aside aria-label="Quick contact" className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        <a
          href="https://wa.me/923284454746?text=Assalam-o-Alaikum%20NOOR%20STUDIO%2C%20I%20need%20assistance%20with%20an%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 p-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-108"
          title="Chat with NOOR STUDIO on WhatsApp (03284454746)"
        >
          <MessageCircle className="w-6 h-6" />
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
            setCurrentView(view);
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
