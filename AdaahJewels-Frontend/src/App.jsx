import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import AnnouncementBar from './components/layouts/AnnouncementBar';
import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';
import MobileBottomNav from './components/layouts/MobileBottomNav';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AdminRouter } from './admin/AdminRouter';
import { AdminThemeProvider } from './admin/context/ThemeContext';
import { AdminAuthProvider } from './admin/context/AdminAuthContext';

// Lazy load pages
const Home             = lazy(() => import('./pages/Home'));
const ProductList      = lazy(() => import('./pages/ProductList'));
const ProductDetail    = lazy(() => import('./pages/ProductDetail'));
const Wishlist         = lazy(() => import('./pages/Wishlist'));
const CartPage         = lazy(() => import('./pages/CartPage'));
const CheckoutPage     = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage       = lazy(() => import('./pages/OrdersPage'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ForgotPassword   = lazy(() => import('./pages/ForgotPassword'));
const ChangePassword   = lazy(() => import('./pages/ChangePassword'));
const VerifyOTP        = lazy(() => import('./pages/VerifyOTP'));
const Profile          = lazy(() => import('./pages/Profile'));
const PrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

const AUTH_PATHS = ['/login', '/register', '/email-verification', '/forgot-password', '/verify-otp', '/admin'];
const isAuthPath = (path) => AUTH_PATHS.some(p => path.startsWith(p));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream-100)' }}>
    <div className="text-center">
      <div
        className="w-14 h-14 rounded-full animate-spin mx-auto mb-4"
        style={{ border: '3px solid var(--color-brand-100)', borderTopColor: 'var(--color-brand-500)' }}
      />
      <p className="text-sm font-medium" style={{ color: 'var(--color-ink-muted)' }}>Loading…</p>
    </div>
  </div>
);

// Inner app — uses useLocation (must be inside <Router>)
function AppInner() {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hideChrome = isAuthPath(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    document.addEventListener('openCart', handleOpenCart);
    return () => document.removeEventListener('openCart', handleOpenCart);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideChrome && (
        <>
          <AnnouncementBar />
          <Header />
        </>
      )}

      <main className="flex-1 md:pb-0 pb-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>            {/* Public Auth Routes */}
            <Route path="/login"              element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"           element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/email-verification" element={<PublicRoute><EmailVerification /></PublicRoute>} />
            <Route path="/forgot-password"    element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/verify-otp"         element={<PublicRoute><VerifyOTP /></PublicRoute>} />

            {/* Public Pages */}
            <Route path="/"             element={<Home />} />
            <Route path="/products"     element={<ProductList />} />
            <Route path="/shop"         element={<ProductList />} />
            <Route path="/product/:id"  element={<ProductDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsAndConditions />} />

            {/* Protected Routes */}
            <Route path="/wishlist"   element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/cart"       element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout"   element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="/orders"     element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminThemeProvider>
                <AdminAuthProvider>
                  <AdminRouter />
                </AdminAuthProvider>
              </AdminThemeProvider>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!hideChrome && (
        <>
          <Footer />
          <MobileBottomNav onCartOpen={() => document.dispatchEvent(new CustomEvent('openCart'))} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppInner />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
