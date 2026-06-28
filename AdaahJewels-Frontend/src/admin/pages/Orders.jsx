import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Search, X } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor = {
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-blue-100   text-blue-800   dark:bg-blue-900   dark:text-blue-200',
  shipped:   'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered: 'bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-200',
  cancelled: 'bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-200',
};

const Orders = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('');

  // detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [orderItems, setOrderItems]           = useState([]);
  const [detailLoading, setDetailLoading]     = useState(false);

  // status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus]             = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);

  useEffect(() => { loadOrders(); }, [statusFilter]);

  /* ── fetch all orders from /api/orders (admin route) ─── */
  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/orders');
      // backend returns flat array of DBOrder rows with joined user fields
      const rows = Array.isArray(data) ? data : [];
      setOrders(rows);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  /* ── open detail modal ─── */
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setOrderItems([]);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const { data } = await axiosInstance.get(`/orders/${order.id}`);
      setOrderItems(Array.isArray(data?.items) ? data.items : []);
    } catch {
      toast.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── open status modal ─── */
  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setShowStatusModal(true);
  };

  /* ── PATCH /api/orders/:id/status ─── */
  const handleUpdateStatus = async () => {
    if (!newStatus) { toast.error('Please select a status'); return; }
    setIsSubmitting(true);
    try {
      await axiosInstance.patch(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      toast.success('Order status updated');
      setShowStatusModal(false);
      await loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── client-side filter ─── */
  const filtered = orders.filter(o => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      String(o.id).includes(term) ||
      (o.shipping_name || o.user_name || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer name…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {['Order #','Customer','Amount','Status','Payment','Date','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {order.shipping_name || order.user_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[order.status] || statusColor.pending}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize text-xs">
                        {order.payment_method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button onClick={() => handleViewDetails(order)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenStatusModal(order)}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg" title="Update Status">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 text-gray-500 dark:text-gray-400">No orders found</p>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order #{selectedOrder.id}</h2>
              <button onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* summary grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Customer',   selectedOrder.shipping_name || selectedOrder.user_name || 'N/A'],
                  ['Email',      selectedOrder.user_email || 'N/A'],
                  ['Status',     selectedOrder.status],
                  ['Payment',    selectedOrder.payment_method],
                  ['Date',       new Date(selectedOrder.created_at).toLocaleString()],
                  ['Total',      `₹${parseFloat(selectedOrder.total_amount).toFixed(2)}`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
                    <p className="text-gray-900 dark:text-white capitalize">{val}</p>
                  </div>
                ))}
              </div>

              {/* shipping */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Shipping Address</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state} – {selectedOrder.shipping_pincode}
                </p>
              </div>

              {/* items */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Items</p>
                {detailLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : orderItems.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orderItems.map((item, i) => (
                      <div key={i} className="flex justify-between py-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.product_name || `Product #${item.product_id}`}
                          </p>
                          <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No items found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Modal ── */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Update Status</h2>
              <button onClick={() => setShowStatusModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Order #{selectedOrder.id}</p>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowStatusModal(false)} disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleUpdateStatus} disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {isSubmitting ? 'Saving…' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;
