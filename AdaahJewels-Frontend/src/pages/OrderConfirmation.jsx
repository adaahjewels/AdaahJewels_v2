import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, Calendar, MapPin, Download, Mail, ArrowRight } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrderDetails, downloadInvoice, sendInvoiceByEmail } from '../services/orderService';
import { useAuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OrderConfirmationPage = () => {
  const { orderId }  = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuthContext();

  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // user.userId or user.id — both normalised in backendServices
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrder();
  }, [user, orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderDetails(orderId);
      if (!data) {
        toast.error('Order not found');
        navigate('/orders');
        return;
      }
      setOrder(data);
    } catch {
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  /* ── loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-cream-100)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-3"
          style={{ borderColor: 'var(--color-brand-100)', borderTopColor: 'var(--color-brand-500)' }} />
      </div>
    );
  }

  /* ── not found ── */
  if (!order) return null;

  const estimatedDelivery = new Date(order.CreatedAt || new Date());
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const handleDownload = async () => {
    try { await downloadInvoice(order.OrderId); }
    catch { toast.error('Failed to download invoice'); }
  };

  const handleEmailInvoice = async () => {
    try {
      await sendInvoiceByEmail(order.OrderId);
      toast.success('Invoice sent to your email!');
    } catch { toast.error('Failed to send invoice'); }
  };

  return (
    <div className="min-h-screen py-8 md:py-12" style={{ background: 'var(--color-cream-100)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Success Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8 text-center mb-8"
          style={{ border: '1px solid var(--color-brand-100)' }}
        >
          <div className="flex justify-center mb-5">
            <div className="rounded-full p-4" style={{ background: 'var(--color-brand-50)' }}>
              <CheckCircle className="w-14 h-14" style={{ color: 'var(--color-brand-500)' }} />
            </div>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl mb-2"
            style={{ color: 'var(--color-ink)' }}>
            Order Confirmed! 🎉
          </h1>
          <p className="text-base mb-6" style={{ color: 'var(--color-ink-muted)' }}>
            Thank you for your purchase. We'll get it to you soon.
          </p>
          <div className="inline-block px-6 py-3 rounded-2xl"
            style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-200)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'var(--color-brand-400)' }}>Order Number</p>
            <p className="font-display font-black text-2xl font-mono"
              style={{ color: 'var(--color-brand-700)' }}>#{order.OrderId}</p>
          </div>
        </motion.div>

        {/* ── Details + Shipping Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Order Details */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ border: '1px solid var(--color-brand-100)' }}>
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-ink)' }}>
              <Package className="w-5 h-5" style={{ color: 'var(--color-brand-500)' }} />
              Order Details
            </h2>
            <div className="space-y-3 text-sm">
              {[
                ['Order Date',       new Date(order.CreatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
                ['Status',          <StatusBadge key="s" status={order.Status} />],
                ['Payment',         <StatusBadge key="p" status={order.PaymentStatus} variant="payment" />],
                ['Payment Method',  order.PaymentMethod || 'Online'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <span style={{ color: 'var(--color-ink-muted)' }}>{label}</span>
                  <span className="font-medium" style={{ color: 'var(--color-ink)' }}>{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>Total</span>
                <span className="font-display font-black text-xl"
                  style={{ color: 'var(--color-brand-700)' }}>
                  ₹{parseFloat(order.TotalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Details */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
            style={{ border: '1px solid var(--color-brand-100)' }}>
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-ink)' }}>
              <Truck className="w-5 h-5" style={{ color: 'var(--color-brand-500)' }} />
              Shipping Details
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--color-brand-400)' }} />
                <div>
                  <p className="font-medium mb-0.5" style={{ color: 'var(--color-ink)' }}>
                    {order.ShippingAddress || 'N/A'}
                  </p>
                  <p style={{ color: 'var(--color-ink-muted)' }}>
                    {[order.ShippingCity, order.ShippingState, order.ShippingZipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--color-brand-400)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-ink)' }}>
                    Est. {estimatedDelivery.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                  </p>
                  <p style={{ color: 'var(--color-ink-muted)' }}>3–5 business days</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Order Items ── */}
        {order.OrderItems && order.OrderItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm mb-6"
            style={{ border: '1px solid var(--color-brand-100)' }}>
            <h2 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--color-ink)' }}>
              Items Ordered
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-brand-100)' }}>
                    {['Product', 'Qty', 'Price', 'Total'].map(h => (
                      <th key={h} className={`py-2 font-semibold text-xs uppercase tracking-wider ${h === 'Total' ? 'text-right' : 'text-left'}`}
                        style={{ color: 'var(--color-ink-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.OrderItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                      <td className="py-3 font-medium" style={{ color: 'var(--color-ink)' }}>
                        {item.ProductName || item.product_name || 'Product'}
                      </td>
                      <td className="py-3" style={{ color: 'var(--color-ink-secondary)' }}>
                        {item.Quantity || item.quantity}
                      </td>
                      <td className="py-3" style={{ color: 'var(--color-ink-secondary)' }}>
                        ₹{parseFloat(item.Price || item.price || 0).toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-semibold" style={{ color: 'var(--color-ink)' }}>
                        ₹{(parseFloat(item.Price || item.price || 0) * (item.Quantity || item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Invoice Actions ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-3 flex-col sm:flex-row mb-6">
          <button onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-brand-600)', color: 'white' }}>
            <Download className="w-4 h-4" /> Download Invoice
          </button>
          <button onClick={handleEmailInvoice}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{ border: '1.5px solid var(--color-brand-300)', color: 'var(--color-brand-700)' }}>
            <Mail className="w-4 h-4" /> Email Invoice
          </button>
        </motion.div>

        {/* ── Navigation ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 flex-col sm:flex-row mb-8">
          <Link to="/orders"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand-700)', border: '1px solid var(--color-brand-200)' }}>
            View All Orders
          </Link>
          <Link to="/products"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--color-brand-900)', color: 'white' }}>
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* ── Help ── */}
        <div className="rounded-2xl p-5 text-sm"
          style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--color-ink)' }}>Need help?</p>
          <div className="flex flex-col sm:flex-row gap-3" style={{ color: 'var(--color-brand-600)' }}>
            <a href="mailto:support@adaahjewels.com" className="hover:underline">
              📧 support@adaahjewels.com
            </a>
            <a href="tel:+919876543210" className="hover:underline">
              📞 +91 98765 43210
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ── helpers ── */
const StatusBadge = ({ status, variant }) => {
  const s = (status || '').toLowerCase();
  const colors = variant === 'payment'
    ? { paid: '#166534,#dcfce7', pending: '#92400e,#fef9c3', default: '#374151,#f3f4f6' }
    : { pending: '#92400e,#fef9c3', confirmed: '#1d4ed8,#dbeafe', shipped: '#6d28d9,#ede9fe', delivered: '#166534,#dcfce7', cancelled: '#991b1b,#fee2e2', default: '#374151,#f3f4f6' };
  const [fg, bg] = (colors[s] || colors.default).split(',');
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ color: fg, background: bg }}>
      {status || 'N/A'}
    </span>
  );
};

export default OrderConfirmationPage;
