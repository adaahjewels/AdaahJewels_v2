import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Layers3,
  AlertTriangle,
} from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import {
  getDashboardSummary,
  getTopProducts,
  getTopCategories,
  getRecentOrders,
} from '../services/dashboardService';

const MetricCard = ({ icon: Icon, title, value, note }) => (
  <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-ink-muted)' }}>{title}</p>
        <p className="text-2xl font-display font-black mt-1" style={{ color: 'var(--color-ink)' }}>{value}</p>
        {note && <p className="text-xs mt-2" style={{ color: 'var(--color-ink-muted)' }}>{note}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-brand-50)' }}>
        <Icon className="w-5 h-5" style={{ color: 'var(--color-brand-600)' }} />
      </div>
    </div>
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [s, p, c, o] = await Promise.all([
          getDashboardSummary(),
          getTopProducts(8),
          getTopCategories(8),
          getRecentOrders(8),
        ]);
        setSummary(s || {});
        setTopProducts(Array.isArray(p) ? p : []);
        setTopCategories(Array.isArray(c) ? c : []);
        setRecentOrders(Array.isArray(o) ? o : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[420px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: 'var(--color-brand-600)' }} />
        </div>
      </AdminLayout>
    );
  }

  const s = summary || {};

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
            Reports & Analytics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
            Snapshot of sales performance, products, categories, and recent orders.
          </p>
        </div>

        {(s.PendingOrders > 0 || s.LowStockProducts > 0) && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#FFF8E1', border: '1px solid #F5E199' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#B8860B' }} />
            <p className="text-sm" style={{ color: '#7A5800' }}>
              {s.PendingOrders > 0 ? `${s.PendingOrders} pending orders` : 'No pending orders'}
              {' · '}
              {s.LowStockProducts > 0 ? `${s.LowStockProducts} low-stock products` : 'Stock levels healthy'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Wallet}
            title="Revenue"
            value={`INR ${parseFloat(s.TotalRevenue || 0).toLocaleString('en-IN')}`}
            note="Total realized revenue"
          />
          <MetricCard
            icon={ShoppingCart}
            title="Orders"
            value={`${s.TotalOrders || 0}`}
            note={`${s.PendingOrders || 0} pending`}
          />
          <MetricCard
            icon={Layers3}
            title="Products"
            value={`${s.TotalProducts || 0}`}
            note={`${s.LowStockProducts || 0} low stock`}
          />
          <MetricCard
            icon={TrendingUp}
            title="Customers"
            value={`${s.TotalCustomers || 0}`}
            note="Unique customers"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <section className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-brand-600)' }} />
              <h2 className="font-display font-bold" style={{ color: 'var(--color-ink)' }}>Top Products</h2>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-2.5">
                {topProducts.map((item, idx) => (
                  <div key={`${item.ProductId || item.id}-${idx}`} className="flex justify-between items-center p-2.5 rounded-xl" style={{ background: idx % 2 === 0 ? 'var(--color-brand-50)' : 'transparent' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{item.ProductName || item.name || 'Untitled Product'}</p>
                      <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Sales: {item.SalesCount || item.salesCount || 0}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-brand-700)' }}>
                      INR {parseFloat(item.TotalRevenue || item.totalRevenue || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>No product analytics available.</p>
            )}
          </section>

          <section className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: 'var(--color-brand-600)' }} />
              <h2 className="font-display font-bold" style={{ color: 'var(--color-ink)' }}>Top Categories</h2>
            </div>
            {topCategories.length > 0 ? (
              <div className="space-y-2.5">
                {topCategories.map((item, idx) => (
                  <div key={`${item.CategoryId || item.id}-${idx}`} className="flex justify-between items-center p-2.5 rounded-xl" style={{ background: idx % 2 === 0 ? 'var(--color-brand-50)' : 'transparent' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{item.CategoryName || item.categoryName || item.name || 'Untitled Category'}</p>
                      <p className="text-xs" style={{ color: 'var(--color-ink-muted)' }}>Orders: {item.OrderCount || item.orderCount || 0}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-brand-700)' }}>
                      INR {parseFloat(item.Revenue || item.revenue || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>No category analytics available.</p>
            )}
          </section>
        </div>

        <section className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-display font-bold mb-4" style={{ color: 'var(--color-ink)' }}>Recent Orders</h2>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ borderBottom: '1px solid var(--color-brand-100)' }}>
                  <tr>
                    {['Order', 'Customer', 'Status', 'Amount'].map((h) => (
                      <th key={h} className="text-left py-2.5 px-2" style={{ color: 'var(--color-ink-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.OrderId || o.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                      <td className="py-2.5 px-2 font-mono" style={{ color: 'var(--color-ink)' }}>
                        #{o.OrderNumber || o.orderNumber || o.OrderId || o.id}
                      </td>
                      <td className="py-2.5 px-2" style={{ color: 'var(--color-ink-secondary)' }}>
                        {o.CustomerEmail || o.customerEmail || 'N/A'}
                      </td>
                      <td className="py-2.5 px-2 capitalize" style={{ color: 'var(--color-ink-secondary)' }}>
                        {o.OrderStatus || o.orderStatus || 'pending'}
                      </td>
                      <td className="py-2.5 px-2 font-semibold" style={{ color: 'var(--color-brand-700)' }}>
                        INR {parseFloat(o.TotalAmount || o.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>No recent orders available.</p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default Reports;
