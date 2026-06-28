import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  List,
  ShoppingCart,
  Users,
  Ticket,
  Image,
  MessageSquare,
  Boxes,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const menuItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Products',     icon: Package,         path: '/admin/products' },
  { label: 'Categories',   icon: List,            path: '/admin/categories' },
  { label: 'Orders',       icon: ShoppingCart,    path: '/admin/orders' },
  { label: 'Customers',    icon: Users,           path: '/admin/customers' },
  { label: 'Coupons',      icon: Ticket,          path: '/admin/coupons' },
  { label: 'Banners',      icon: Image,           path: '/admin/banners' },
  { label: 'Testimonials', icon: MessageSquare,   path: '/admin/testimonials' },
  { label: 'Inventory',    icon: Boxes,           path: '/admin/inventory' },
  { label: 'Reports',      icon: BarChart3,       path: '/admin/reports' },
  { label: 'Settings',     icon: Settings,        path: '/admin/settings' },
];

export const AdminSidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useTheme();
  const location = useLocation();

  return (
    <aside
      className={`${sidebarCollapsed ? 'w-[68px]' : 'w-60'} flex flex-col flex-shrink-0 transition-all duration-300`}
      style={{ background: 'var(--color-brand-900)', height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: '64px' }}
      >
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-brand-500), var(--color-brand-400))' }}
            >
              <span className="text-white font-display font-bold text-sm">✦</span>
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-none" style={{ color: 'var(--color-cream-100)' }}>
                Adaah Jewels
              </p>
              <p className="text-[10px] tracking-wider uppercase mt-0.5" style={{ color: 'var(--color-brand-400)' }}>
                Admin
              </p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          style={{ color: 'var(--color-brand-300)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon     = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              style={
                isActive
                  ? {
                      background: 'var(--color-brand-500)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(88,99,72,0.35)',
                    }
                  : {
                      color: 'var(--color-neutral-400)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.color = 'var(--color-cream-100)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-neutral-400)';
                }
              }}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom brand accent */}
      <div
        className="px-4 py-4 text-center"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {!sidebarCollapsed && (
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-brand-600)' }}>
            © 2026 Adaah Jewels
          </p>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
