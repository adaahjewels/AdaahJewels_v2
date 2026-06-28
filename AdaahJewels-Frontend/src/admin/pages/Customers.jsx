import { useState, useEffect } from 'react';
import { Eye, Trash2, Search, X } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const Customers = () => {
  const [customers, setCustomers]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [searchTerm, setSearchTerm]         = useState('');

  // detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders]   = useState([]);
  const [detailLoading, setDetailLoading]     = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  /* ── GET /api/users ─── */
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/users');
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  /* ── open detail → GET /api/users/:id/orders ─── */
  const handleViewDetails = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const { data } = await axiosInstance.get(`/users/${customer.id}/orders`);
      setCustomerOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load customer orders');
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── DELETE /api/users/:id ─── */
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer? Their orders will remain.')) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      toast.success('Customer deleted');
      await loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const filtered = customers.filter(c => {
    const t = searchTerm.toLowerCase();
    return (
      !t ||
      (c.name  || '').toLowerCase().includes(t) ||
      (c.email || '').toLowerCase().includes(t) ||
      (c.phone || '').toLowerCase().includes(t)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
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
                    {['Name','Email','Phone','Orders','Spent','Joined','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.email}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.phone || '—'}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{c.total_orders || 0}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        ₹{parseFloat(c.total_spent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button onClick={() => handleViewDetails(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCustomer(c.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 text-gray-500 dark:text-gray-400">No customers found</p>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h2>
              <button onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Email',   selectedCustomer.email],
                  ['Phone',   selectedCustomer.phone || '—'],
                  ['Orders',  selectedCustomer.total_orders || 0],
                  ['Spent',   `₹${parseFloat(selectedCustomer.total_spent || 0).toFixed(2)}`],
                  ['Joined',  new Date(selectedCustomer.created_at).toLocaleDateString()],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-gray-400 uppercase">{label}</p>
                    <p className="text-gray-900 dark:text-white">{val}</p>
                  </div>
                ))}
              </div>

              {/* order history */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Order History</p>
                {detailLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {customerOrders.map(o => (
                      <div key={o.id} className="flex justify-between items-center py-2 text-sm">
                        <div>
                          <p className="font-mono font-medium text-gray-900 dark:text-white">#{o.id}</p>
                          <p className="text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-white">₹{parseFloat(o.total_amount).toFixed(2)}</p>
                          <span className="text-xs text-gray-400 capitalize">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Customers;
