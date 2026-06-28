import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const BrandSpinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream-100)' }}>
    <div
      className="w-12 h-12 rounded-full animate-spin"
      style={{ border: '3px solid var(--color-brand-100)', borderTopColor: 'var(--color-brand-500)' }}
    />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  if (isLoading) return <BrandSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
