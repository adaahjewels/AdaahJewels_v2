import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X, Plus, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const POSITIONS = ['hero', 'sidebar', 'footer', 'category'];

const Banners = () => {
  const [banners, setBanners]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]         = useState({
    title: '', imageUrl: '', link: '',
    position: 'hero', displayOrder: 0, isActive: true,
  });
  const [formErrors, setFormErrors]     = useState({});

  useEffect(() => { loadBanners(); }, []);

  /* ── GET /api/banners/admin ─── */
  const loadBanners = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/banners/admin');
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim())    errors.title    = 'Title is required';
    if (!formData.imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const openAdd = () => {
    setEditingBanner(null);
    setFormData({ title: '', imageUrl: '', link: '', position: 'hero', displayOrder: 0, isActive: true });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = b => {
    setEditingBanner(b);
    setFormData({
      title:        b.title        || '',
      imageUrl:     b.image_url    || '',
      link:         b.link         || '',
      position:     b.position     || 'hero',
      displayOrder: b.display_order ?? 0,
      isActive:     b.is_active !== 0,
    });
    setFormErrors({});
    setShowModal(true);
  };

  /* ── POST or PUT /api/banners ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      title:        formData.title,
      imageUrl:     formData.imageUrl,
      link:         formData.link || null,
      position:     formData.position,
      displayOrder: Number(formData.displayOrder),
      isActive:     formData.isActive,
    };
    try {
      if (editingBanner) {
        await axiosInstance.put(`/banners/${editingBanner.id}`, payload);
        toast.success('Banner updated');
      } else {
        await axiosInstance.post('/banners', payload);
        toast.success('Banner created');
      }
      setShowModal(false);
      await loadBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── DELETE /api/banners/:id ─── */
  const handleDelete = async id => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await axiosInstance.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      await loadBanners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete banner');
    }
  };

  const filtered = banners.filter(b =>
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banners</h1>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by title…" value={searchTerm}
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
                    {['Image','Title','Position','Order','Status','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.title} className="w-16 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">{b.position}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{b.display_order ?? 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          b.is_active !== 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {b.is_active !== 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button onClick={() => openEdit(b)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(b.id)}
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">No banners found</p>
              <button onClick={openAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                Create First Banner
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingBanner ? 'Edit Banner' : 'Add Banner'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Summer Sale"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange}
                  placeholder="https://…"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.imageUrl ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {formErrors.imageUrl && <p className="text-red-500 text-xs mt-1">{formErrors.imageUrl}</p>}
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="preview"
                    className="mt-2 w-full h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Link (optional)</label>
                <input name="link" value={formData.link} onChange={handleChange}
                  placeholder="/shop?category=…"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
              </div>

              {/* Position + Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Position</label>
                  <select name="position" value={formData.position} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500">
                    {POSITIONS.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Display Order</label>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange}
                    min="0"
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
                  {isSubmitting ? 'Saving…' : editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Banners;
