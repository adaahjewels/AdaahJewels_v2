import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Menu } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminHeader = ({ onMenuToggle }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <header
      className="flex items-center justify-between px-5 py-3 sticky top-0 z-10"
      style={{
        background: 'white',
        borderBottom: '1px solid var(--color-brand-100)',
        minHeight: '64px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => onMenuToggle?.()}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-brand-50"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" style={{ color: 'var(--color-ink-secondary)' }} />
      </button>

      {/* Page title placeholder */}
      <div className="flex-1 md:flex-none">
        <h2 className="text-base font-semibold hidden md:block" style={{ color: 'var(--color-ink)' }}>
          Admin Panel
        </h2>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-brand-50"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" style={{ color: 'var(--color-ink-secondary)' }} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-error)' }}
          />
        </button>

        {/* Separator */}
        <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'var(--color-brand-100)' }} />

        {/* User info */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))' }}
          >
            {initials}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold truncate max-w-[150px]" style={{ color: 'var(--color-ink)' }}>
              {user?.email}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-brand-400)' }}>
              Administrator
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-red-50 text-red-500 hover:text-red-600"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
