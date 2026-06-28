import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Search, X } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import { adminOrderApi } from '../../api/dynamicApiService';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const paymentStatusColor = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrderApi.getOrderList(
        statusFilter || null,
        null,
        currentPage,
        itemsPerPage
      );
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    try {
      const details = await adminOrderApi.getOrderDetails(order.OrderId || order.id);
      setOrderDetails(details);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.OrderStatus || order.status || 'pending');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminOrderApi.updateOrderStatus(selectedOrder.OrderId || selectedOrder.id, newStatus);
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      await loadOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await adminOrderApi.deleteOrder(orderId);
      toast.success('Order deleted successfully');
      await loadOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to delete order');
    }
  };

  // Filter and paginate
  const filteredOrders = orders.filter(order =>
    (order.OrderNumber || order.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.CustomerName || order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayOrders = filteredOrders.slice(0, itemsPerPage);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : displayOrders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Order #</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Payment</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Date</th>
                      <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {displayOrders.map((order) => {
                      const orderStatus = order.OrderStatus || order.status || 'pending';
                      const paymentStatus = order.PaymentStatus || order.paymentStatus || 'pending';
                      const date = new Date(order.CreatedAt || order.createdAt || Date.now());
                      return (
                        <tr key={order.OrderId || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {order.OrderNumber || order.id}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {order.CustomerName || order.customerName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            ₹{parseFloat(order.TotalAmount || order.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[orderStatus] || statusColor.pending}`}>
                              {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatusColor[paymentStatus] || paymentStatusColor.pending}`}>
                              {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDetails(order)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(order)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition"
                                title="Update Status"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.OrderId || order.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{selectedOrder?.OrderNumber || selectedOrder?.id}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {orderDetails ? (
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Customer</label>
                    <p className="text-gray-900 dark:text-white">{selectedOrder?.CustomerName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedOrder?.CreatedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
                    <p className="text-gray-900 dark:text-white">
                      {(selectedOrder?.OrderStatus || 'pending').charAt(0).toUpperCase() + (selectedOrder?.OrderStatus || 'pending').slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Payment Status</label>
                    <p className="text-gray-900 dark:text-white">
                      {(selectedOrder?.PaymentStatus || 'pending').charAt(0).toUpperCase() + (selectedOrder?.PaymentStatus || 'pending').slice(1)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
                  <div className="space-y-2 border-t border-b border-gray-200 dark:border-gray-700 py-3">
                    {Array.isArray(orderDetails) ? orderDetails.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <div>
                          <p className="text-gray-900 dark:text-white">{item.ProductName || item.product || 'Product'}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Qty: {item.Quantity || item.qty || 1}</p>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">₹{parseFloat(item.UnitPrice || item.price || 0).toFixed(2)}</p>
                      </div>
                    )) : null}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">₹{parseFloat(selectedOrder?.SubtotalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    <span className="text-gray-900 dark:text-white">₹{parseFloat(selectedOrder?.ShippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <span className="text-gray-900 dark:text-white">₹{parseFloat(selectedOrder?.TaxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">₹{parseFloat(selectedOrder?.TotalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Update Order Status
              </h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowStatusModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Status'}
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
