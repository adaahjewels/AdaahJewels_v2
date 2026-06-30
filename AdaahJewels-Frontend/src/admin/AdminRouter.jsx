import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useAdminAuth } from './context/AdminAuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Orders = lazy(() => import('./pages/Orders'));
const Customers = lazy(() => import('./pages/Customers'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Banners = lazy(() => import('./pages/Banners'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const Reports = lazy(() => import('./pages/Reports'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

const Fallback = <LoadingSpinner fullScreen />;

// Admin Protected Route — redirects to /admin/login if not authenticated
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  
  if (isLoading) return <Fallback />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  
  return children;
};

const guard = (Component) => (
  <AdminProtectedRoute>
    <Suspense fallback={Fallback}>
      <Component />
    </Suspense>
  </AdminProtectedRoute>
);

// Placeholder for pages coming in future phases
const Soon = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-gray-500 mt-2">Coming soon...</p>
  </div>
);

export const AdminRouter = () => (
  <Routes>
    {/* Admin Auth Routes (public within admin panel) */}
    <Route path="/login" element={<Suspense fallback={Fallback}><AdminLogin /></Suspense>} />

    {/* Protected Admin Routes */}
    <Route path="/dashboard"   element={guard(Dashboard)} />
    <Route path="/products"    element={guard(Products)} />
    <Route path="/categories"  element={guard(Categories)} />
    <Route path="/orders"      element={guard(Orders)} />
    <Route path="/customers"   element={guard(Customers)} />
    <Route path="/coupons"     element={guard(Coupons)} />
    <Route path="/banners"     element={guard(Banners)} />
    <Route path="/testimonials" element={guard(Testimonials)} />
    <Route path="/reports"      element={guard(Reports)} />

    {/* Future phases */}
    <Route path="/inventory"    element={guard(() => <Soon title="Inventory" />)} />
    <Route path="/settings"     element={guard(() => <Soon title="Settings" />)} />

    <Route path="/" element={<Navigate to="/admin/login" replace />} />
    <Route path="*" element={<Navigate to="/admin/login" replace />} />
  </Routes>
);

export default AdminRouter;
