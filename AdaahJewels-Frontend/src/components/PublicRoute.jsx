import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { LoadingSpinner } from './states/LoadingState';

/**
 * PublicRoute — only accessible when NOT logged in.
 * If already authenticated, redirect:
 *   admin  → /admin/dashboard
 *   user   → /
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream-100)' }}>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full animate-spin mx-auto mb-3"
            style={{ border: '3px solid var(--color-brand-100)', borderTopColor: 'var(--color-brand-500)' }}
          />
          <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = user?.role === 'admin' ? '/admin/dashboard' : '/';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default PublicRoute;
