import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X, Plus, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import ImageUploadField from '../components/ui/ImageUploadField';

const emptyForm = {
  name: '', slug: '', description: '', imageUrl: '', isActive: true,
};

const generateSlug = name =>
  name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const Categories = () => {
  const [categories, setCategories]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]         = useState(emptyForm);
  const [formErrors, setFormErrors]     = useState({});

  useEffect(() => { loadCategories(); }, []);

  /* ── GET /api/categories/admin ─── */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/categories/admin');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.slug.trim()) errors.slug = 'Slug is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newVal,
      // auto-generate slug from name when adding
      ...(name === 'name' && !editingCategory ? { slug: generateSlug(value) } : {}),
    }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const openAdd = () => {
    setEditingCategory(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = c => {
    setEditingCategory(c);
    setFormData({
      name:        c.name        || '',
      slug:        c.slug        || '',
      description: c.description || '',
      imageUrl:    c.image_url   || '',
      isActive:    c.is_active !== 0,
    });
    setFormErrors({});
    setShowModal(true);
  };

  /* ── POST or PUT /api/categories ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      name:        formData.name,
      description: formData.description || null,
      imageUrl:    formData.imageUrl    || null,
      isActive:    formData.isActive,
      // slug is derived on the backend from name, but we send it too for transparency
    };
    try {
      if (editingCategory) {
        await axiosInstance.put(`/categories/${editingCategory.id}`, payload);
        toast.success('Category updated');
      } else {
        await axiosInstance.post('/categories', payload);
        toast.success('Category created');
      }
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── DELETE /api/categories/:id ─── */
  const handleDelete = async id => {
    if (!window.confirm('Delete this category? This may fail if products are attached.')) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      toast.success('Category deleted');
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const filtered = categories.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or slug…" value={searchTerm}
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
                    {['Image','Name','Slug','Parent','Status','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">{c.slug}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {c.parent_name || <span className="text-gray-300 dark:text-gray-600">—</span>}
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">No categories found</p>
              <button onClick={openAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                Create First Category
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
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input name="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g. Earrings"
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Slug (read-only preview; backend derives it) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Slug (auto-generated)</label>
                <input name="slug" value={formData.slug} onChange={handleChange}
                  placeholder="earrings"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-mono focus:outline-none" readOnly />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  rows={3} placeholder="Category description…"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              {/* Image */}
              <ImageUploadField
                label="Category Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                previewClass="w-full h-28"
              />

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
                  {isSubmitting ? 'Saving…' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Categories;
