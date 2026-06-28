import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2, Search, Download, Mail, Sparkles, PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOrders, cancelOrder, downloadInvoice, sendInvoiceByEmail } from '../services/orderService';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      await loadOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      await downloadInvoice(orderId);
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const handleEmailInvoice = async (orderId) => {
    try {
      await sendInvoiceByEmail(orderId);
      toast.success('Invoice sent to your email!');
    } catch {
      toast.error('Failed to send invoice email');
    }
  };

  function getSafeAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
  }

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN');
  }

  const filteredOrders = orders.filter((order) => {
    const amountString = getSafeAmount(order.TotalAmount).toFixed(2);
    const matchSearch = order.OrderId?.toString().includes(searchTerm) || amountString.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || order.Status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const statusBadgeColor = {
    pending: 'bg-gold-100 text-gold-800',
    processing: 'bg-maroon-100 text-maroon-700',
    shipped: 'bg-charcoal-100 text-charcoal-700',
    delivered: 'bg-success-100 text-success-700',
    cancelled: 'bg-error-100 text-error-700',
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-12 w-12 rounded-full border-4 border-cream-200 border-t-gold-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-4xl border border-cream-200 bg-white p-6 shadow-xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-gold-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">Your journey</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-charcoal-900">My Orders</h1>
              <p className="mt-1 text-charcoal-600">{orders.length} order(s) found</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-charcoal-400" />
                <input
                  type="text"
                  placeholder="Search by order number or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-premium w-full min-w-[240px] pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-premium min-w-[170px]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-4xl border border-cream-200 bg-white p-10 text-center shadow-xl"
          >
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gold-50 p-4 text-gold-600">
                <PackageSearch className="h-10 w-10" />
              </div>
            </div>
            <p className="mb-4 text-charcoal-600">No orders found</p>
            <Link to="/products" className="btn-primary inline-flex">
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="overflow-hidden rounded-4xl border border-cream-200 bg-white shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-cream-200 bg-cream-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-charcoal-900">Order #</th>
                    <th className="px-6 py-3 text-left font-semibold text-charcoal-900">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-charcoal-900">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-charcoal-900">Status</th>
                    <th className="px-6 py-3 text-center font-semibold text-charcoal-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.OrderId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="transition hover:bg-cream-50"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-charcoal-900">#{order.OrderId}</td>
                      <td className="px-6 py-4 text-charcoal-600">{new Date(order.CreatedAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4 font-semibold text-charcoal-900">₹{getSafeAmount(order.TotalAmount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-charcoal-600">{formatDate(order.CreatedAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeColor[order.Status?.toLowerCase()] || 'bg-cream-100 text-charcoal-700'}`}>
                          {order.Status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewDetails(order)} className="rounded-lg p-2 text-gold-600 transition hover:bg-gold-50" title="View details">
                            <Eye className="h-4 w-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownloadInvoice(order.OrderId)} className="rounded-lg p-2 text-charcoal-700 transition hover:bg-cream-100" title="Download invoice">
                            <Download className="h-4 w-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEmailInvoice(order.OrderId)} className="rounded-lg p-2 text-success-600 transition hover:bg-success-50" title="Email invoice">
                            <Mail className="h-4 w-4" />
                          </motion.button>
                          {order.Status?.toLowerCase() === 'pending' && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteOrder(order.OrderId)} className="rounded-lg p-2 text-error-600 transition hover:bg-error-50" title="Cancel order">
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mx-4 w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-cream-200 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-charcoal-900">Order #{selectedOrder.OrderId}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-charcoal-500 transition hover:text-charcoal-700">✕</button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-charcoal-600">Order Date</p>
                  <p className="font-semibold text-charcoal-900">{new Date(selectedOrder.CreatedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-charcoal-600">Status</p>
                  <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeColor[selectedOrder.Status?.toLowerCase()] || 'bg-cream-100 text-charcoal-700'}`}>
                    {selectedOrder.Status}
                  </span>
                </div>
              </div>

              {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 && (
                <div className="border-t border-cream-200 pt-4">
                  <p className="mb-3 font-semibold text-charcoal-900">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.OrderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-charcoal-700">
                        <span>{item.ProductName} x {item.Quantity}</span>
                        <span className="font-semibold text-charcoal-900">₹{(item.Price * item.Quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-cream-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gold-600">₹{getSafeAmount(selectedOrder.TotalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-cream-200 pt-4">
                <p className="mb-2 font-semibold text-charcoal-900">Shipping Address</p>
                <p className="text-sm text-charcoal-600">
                  {selectedOrder.ShippingAddress}<br />
                  {selectedOrder.ShippingCity}, {selectedOrder.ShippingState} {selectedOrder.ShippingZipCode}
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-cream-200 bg-cream-50 p-6">
              <button onClick={() => setShowDetailModal(false)} className="flex-1 rounded-xl border border-cream-300 px-4 py-2 font-semibold text-charcoal-700 transition hover:bg-white">Close</button>
              <Link to={`/order-confirmation/${selectedOrder.OrderId}`} className="flex-1 rounded-xl bg-charcoal-900 px-4 py-2 text-center font-semibold text-white transition hover:bg-gold-600">View Full Details</Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
