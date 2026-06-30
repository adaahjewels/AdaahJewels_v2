import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../layouts/AdminLayout';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../services/testimonialService';

const emptyForm = {
  customerName: '',
  reviewText: '',
  rating: 5,
  status: 'active',
};

const normalizeTestimonial = (t) => ({
  id: t.TestimonialId || t.testimonialId || t.id,
  customerName: t.CustomerName || t.customer_name || t.name || '',
  reviewText: t.ReviewText || t.review_text || t.quote || '',
  rating: Number(t.Rating || t.rating || 5),
  status: (t.Status || t.status || 'active').toLowerCase(),
  createdAt: t.CreatedAt || t.created_at || null,
});

const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

const RatingStars = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className="w-3.5 h-3.5"
        style={{
          color: 'var(--color-gold-500)',
          fill: n <= value ? 'var(--color-gold-500)' : 'transparent',
        }}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await getTestimonials();
      const normalized = Array.isArray(data) ? data.map(normalizeTestimonial) : [];
      setItems(normalized);
    } catch (err) {
      toast.error(err.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = 'Customer name is required';
    if (!formData.reviewText.trim()) errors.reviewText = 'Review text is required';
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'rating' ? Number(value) : value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      customerName: item.customerName,
      reviewText: item.reviewText,
      rating: item.rating,
      status: item.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateTestimonial(editingItem.id, formData);
        toast.success('Testimonial updated');
      } else {
        await createTestimonial(formData);
        toast.success('Testimonial created');
      }
      setShowModal(false);
      await loadTestimonials();
    } catch (err) {
      toast.error(err.message || 'Failed to save testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      toast.success('Testimonial deleted');
      await loadTestimonials();
    } catch (err) {
      toast.error(err.message || 'Failed to delete testimonial');
    }
  };

  const filtered = items.filter((item) => {
    const s = searchTerm.toLowerCase();
    return (
      !s ||
      item.customerName.toLowerCase().includes(s) ||
      item.reviewText.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--color-ink)' }}>
            Testimonials
          </h1>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-brand-600)', color: 'white' }}
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-ink-muted)' }} />
          <input
            type="text"
            placeholder="Search by customer or review text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm"
            style={{ borderColor: 'var(--color-brand-100)', color: 'var(--color-ink)' }}
          />
        </div>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-brand-100)', boxShadow: 'var(--shadow-sm)' }}>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderBottomColor: 'var(--color-brand-500)' }} />
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--color-brand-50)' }}>
                  <tr>
                    {['Customer', 'Review', 'Rating', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} style={{ borderTop: '1px solid var(--color-neutral-100)' }}>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--color-ink)' }}>{item.customerName}</td>
                      <td className="px-6 py-4 max-w-[360px]">
                        <p className="line-clamp-2" style={{ color: 'var(--color-ink-secondary)' }}>
                          {item.reviewText}
                        </p>
                      </td>
                      <td className="px-6 py-4"><RatingStars value={item.rating} /></td>
                      <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--color-ink-muted)' }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 rounded-lg"
                            style={{ color: 'var(--color-brand-600)' }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 rounded-lg"
                          >
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
            <div className="text-center py-12" style={{ color: 'var(--color-ink-muted)' }}>
              No testimonials found
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
            <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid var(--color-brand-100)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" style={{ color: 'var(--color-ink-muted)' }} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: formErrors.customerName ? '#ef4444' : 'var(--color-brand-100)' }}
                />
                {formErrors.customerName && <p className="text-red-500 text-xs mt-1">{formErrors.customerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                  Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reviewText"
                  value={formData.reviewText}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                  style={{ borderColor: formErrors.reviewText ? '#ef4444' : 'var(--color-brand-100)' }}
                />
                {formErrors.reviewText && <p className="text-red-500 text-xs mt-1">{formErrors.reviewText}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: formErrors.rating ? '#ef4444' : 'var(--color-brand-100)' }}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  {formErrors.rating && <p className="text-red-500 text-xs mt-1">{formErrors.rating}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--color-brand-100)' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--color-brand-100)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid var(--color-brand-100)', color: 'var(--color-ink-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'var(--color-brand-600)' }}
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Testimonials;
