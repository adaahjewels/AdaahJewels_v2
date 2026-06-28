import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X, Plus } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const Coupons = () => {
  const [coupons, setCoupons]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]         = useState({
    code: '', discountType: 'percentage', discountValue: '',
    maxUses: '', validFrom: '', validTo: '', isActive: true,
  });
  const [formErrors, setFormErrors]     = useState({});

  useEffect(() => { loadCoupons(); }, []);

  /* ── GET /api/coupons ─── */
  const loadCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/coupons');
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.code.trim())                          errors.code = 'Code is required';
    if (!formData.discountValue || +formData.discountValue <= 0) errors.discountValue = 'Discount must be > 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const openAdd = () => {
    setEditingCoupon(null);
    setFormData({ code: '', discountType: 'percentage', discountValue: '', maxUses: '', validFrom: '', validTo: '', isActive: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = c => {
    setEditingCoupon(c);
    setFormData({
      code:          c.code || '',
      discountType:  c.discount_type || 'percentage',
      discountValue: c.discount_value ?? '',
      maxUses:       c.max_uses ?? '',
      validFrom:     c.valid_from ? c.valid_from.split('T')[0] : '',
      validTo:       c.valid_to   ? c.valid_to.split('T')[0]   : '',
      isActive:      c.is_active !== 0,
    });
    setFormErrors({});
    setShowModal(true);
  };

  /* ── POST or PUT /api/coupons ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      code:          formData.code.toUpperCase(),
      discountType:  formData.discountType,
      discountValue: Number(formData.discountValue),
      maxUses:       formData.maxUses ? Number(formData.maxUses) : null,
      validFrom:     formData.validFrom || null,
      validTo:       formData.validTo   || null,
      isActive:      formData.isActive,
    };
    try {
      if (editingCoupon) {
        await axiosInstance.put(`/coupons/${editingCoupon.id}`, payload);
        toast.success('Coupon updated');
      } else {
        await axiosInstance.post('/coupons', payload);
        toast.success('Coupon created');
      }
      setShowModal(false);
      await loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── DELETE /api/coupons/:id ─── */
  const handleDelete = async id => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      await loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const filtered = coupons.filter(c =>
    (c.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by code…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
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
                    {['Code','Discount','Max Uses','Valid Period','Status','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{c.code}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {c.max_uses || 'Unlimited'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {c.valid_from && c.valid_to
                          ? `${new Date(c.valid_from).toLocaleDateString()} – ${new Date(c.valid_to).toLocaleDateString()}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.is_active !== 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {c.is_active !== 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button onClick={() => openEdit(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
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
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No coupons found</p>
              <button onClick={openAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                Create First Coupon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input name="code" value={formData.code} onChange={handleChange}
                  placeholder="e.g. WELCOME50"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase text-sm focus:outline-none focus:border-blue-500 ${formErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Discount Type</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange}
                  min="0" step="0.01" placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.discountValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {formErrors.discountValue && <p className="text-red-500 text-xs mt-1">{formErrors.discountValue}</p>}
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Max Uses (blank = unlimited)</label>
                <input type="number" name="maxUses" value={formData.maxUses} onChange={handleChange}
                  min="0" placeholder="unlimited"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* Valid From / To */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Valid From</label>
                  <input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Valid To</label>
                  <input type="date" name="validTo" value={formData.validTo} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                  className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Active</span>
              </label>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {isSubmitting ? 'Saving…' : editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Coupons;
