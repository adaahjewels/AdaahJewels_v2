import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import {
  getDashboardSummary,
  getTopProducts,
  getRecentOrders,
} from '../services/dashboardService';

const orderStatusStyles = {
  pending:    'status-badge status-pending',
  processing: 'status-badge status-processing',
  shipped:    'status-badge status-shipped',
  delivered:  'status-badge status-delivered',
  cancelled:  'status-badge status-cancelled',
};

const StatCard = ({ icon: Icon, label, value, iconBg, sub, subAccent }) => (
  <div className="admin-stat-card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-ink-muted)' }}>
          {label}
        </p>
        <p className="text-3xl font-bold font-display" style={{ color: 'var(--color-ink)' }}>{value}</p>
        {sub && (
          <p className="text-xs font-medium mt-2" style={{ color: subAccent || 'var(--color-warning)' }}>
            {sub}
          </p>
        )}
      </div>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg || 'var(--color-brand-50)' }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, productsData, ordersData] = await Promise.all([
        getDashboardSummary(),
        getTopProducts(5),
        getRecentOrders(8),
      ]);
      setSummary(summaryData);
      setTopProducts(productsData);
      setRecentOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><LoadingSpinner fullScreen /></AdminLayout>;

  const s = summary || {};

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>Welcome back — here's what's happening today.</p>
        </div>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`₹${parseFloat(s.TotalRevenue || 0).toLocaleString('en-IN')}`}
            iconBg="linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700))"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={s.TotalOrders || 0}
            iconBg="linear-gradient(135deg, var(--color-gold-500), var(--color-gold-700))"
            sub={s.PendingOrders ? `${s.PendingOrders} pending approval` : null}
            subAccent="var(--color-warning)"
          />
          <StatCard
            icon={Package}
            label="Total Products"
            value={s.TotalProducts || 0}
            iconBg="linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))"
            sub={s.LowStockProducts ? `${s.LowStockProducts} low on stock` : null}
            subAccent="var(--color-error)"
          />
          <StatCard
            icon={Users}
            label="Customers"
            value={s.TotalCustomers || 0}
            iconBg="linear-gradient(135deg, #4A7C94, #2E5E72)"
          />
        </div>

        {/* Alerts */}
        {(s.PendingOrders > 0 || s.LowStockProducts > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {s.PendingOrders > 0 && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: '#FFF8E1', border: '1px solid #F5E199' }}
              >
                <Clock className="w-5 h-5 flex-shrink-0" style={{ color: '#B8860B' }} />
                <p className="text-sm" style={{ color: '#7A5800' }}>
                  <span className="font-bold">{s.PendingOrders}</span> orders are waiting to be processed.
                </p>
              </div>
            )}
            {s.LowStockProducts > 0 && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: '#FBE9E4', border: '1px solid #F5C4B8' }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
                <p className="text-sm" style={{ color: '#7A1A00' }}>
                  <span className="font-bold">{s.LowStockProducts}</span> products are running low on stock.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-brand-500)' }} />
              <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-ink)' }}>Top Products</h2>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>No data available</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div
                    key={product.ProductId}
                    className="flex justify-between items-center py-2.5 px-3 rounded-xl"
                    style={{ background: idx % 2 === 0 ? 'var(--color-brand-50)' : 'transparent' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{product.ProductName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>₹{product.Price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-brand-600)' }}>
                        {product.SalesCount || 0} sales
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                        ₹{parseFloat(product.TotalRevenue || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-5">
              <ShoppingCart className="w-4 h-4" style={{ color: 'var(--color-brand-500)' }} />
              <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-ink)' }}>Recent Orders</h2>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order, idx) => (
                  <div
                    key={order.OrderId}
                    className="flex justify-between items-center py-2.5 px-3 rounded-xl"
                    style={{ background: idx % 2 === 0 ? 'var(--color-brand-50)' : 'transparent' }}
                  >
                    <div>
                      <p className="text-sm font-bold font-mono" style={{ color: 'var(--color-ink)' }}>
                        #{order.OrderNumber}
                      </p>
                      <p className="text-xs mt-0.5 truncate max-w-[160px]" style={{ color: 'var(--color-ink-muted)' }}>
                        {order.CustomerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`${orderStatusStyles[order.OrderStatus] || 'status-badge badge-neutral'} capitalize`}>
                        {order.OrderStatus}
                      </span>
                      <p className="text-xs mt-1.5" style={{ color: 'var(--color-ink-secondary)' }}>
                        ₹{order.TotalAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
