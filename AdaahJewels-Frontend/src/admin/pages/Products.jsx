import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

const MATERIALS = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Kundan', 'Oxidised', 'Artificial'];

const emptyForm = {
  name: '', categoryId: '', materialType: '',
  price: '', discount: '0', deliveryDays: '5',
  description: '', careInstructions: '', stock: '0',
  images: [],          // array of URLs
  imageInput: '',      // temporary text field for adding a URL
  isActive: true,
};

const Products = () => {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [formData, setFormData]       = useState(emptyForm);
  const [formErrors, setFormErrors]   = useState({});

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  /* ── GET /api/products ─── */
  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  /* ── GET /api/categories/admin ─── */
  const loadCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/categories/admin');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      console.warn('Could not load categories');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim())     errors.name     = 'Product name is required';
    if (!formData.categoryId)      errors.categoryId = 'Category is required';
    if (!formData.price)           errors.price    = 'Price is required';
    if (!formData.materialType)    errors.materialType = 'Material is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* add image URL to list */
  const addImageUrl = () => {
    const url = formData.imageInput.trim();
    if (!url) return;
    setFormData(prev => ({ ...prev, images: [...prev.images, url], imageInput: '' }));
  };

  const removeImage = idx =>
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  const openAdd = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = p => {
    setEditingProduct(p);
    setFormData({
      name:             p.name             || '',
      categoryId:       p.category_id      || '',
      materialType:     p.material_type    || '',
      price:            p.price            ?? '',
      discount:         p.discount         ?? '0',
      deliveryDays:     p.delivery_days    ?? '5',
      description:      p.description      || '',
      careInstructions: p.care_instructions || '',
      stock:            p.stock            ?? '0',
      images:           Array.isArray(p.images) ? p.images : [],
      imageInput:       '',
      isActive:         p.is_active !== 0,
    });
    setFormErrors({});
    setShowModal(true);
  };

  /* ── POST or PUT /api/products ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const payload = {
      name:             formData.name,
      categoryId:       Number(formData.categoryId),
      materialType:     formData.materialType,
      price:            Number(formData.price),
      discount:         Number(formData.discount || 0),
      deliveryDays:     Number(formData.deliveryDays || 5),
      description:      formData.description,
      careInstructions: formData.careInstructions || null,
      stock:            Number(formData.stock || 0),
      images:           formData.images,
      isActive:         formData.isActive,
    };
    try {
      if (editingProduct) {
        await axiosInstance.put(`/products/${editingProduct.id}`, payload);
        toast.success('Product updated');
      } else {
        await axiosInstance.post('/products', payload);
        toast.success('Product created');
      }
      setShowModal(false);
      await loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── DELETE /api/products/:id ─── */
  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      toast.success('Product deleted');
      await loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || cat?.parent_name || '—';
  };

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name…" value={searchTerm}
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
                    {['Image','Name','Category','Price','Stock','Status','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map(p => {
                    const img = Array.isArray(p.images) ? p.images[0] : null;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          {img ? (
                            <img src={img} alt={p.name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{p.name}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {p.subcategory_name || getCategoryName(p.category_id)}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          ₹{parseFloat(p.price || 0).toFixed(2)}
                          {p.discount > 0 && (
                            <span className="ml-1 text-xs text-green-600">({p.discount}% off)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.stock > 5
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : p.stock > 0
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            p.is_active !== 0
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {p.is_active !== 0 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-center">
                            <button onClick={() => openEdit(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg">
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No products found</p>
              <button onClick={openAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold">
                Add First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. Gold Choker Necklace"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.parent_name ? `${c.parent_name} › ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.categoryId && <p className="text-red-500 text-xs mt-1">{formErrors.categoryId}</p>}
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <select name="materialType" value={formData.materialType} onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.materialType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                    <option value="">Select material</option>
                    {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {formErrors.materialType && <p className="text-red-500 text-xs mt-1">{formErrors.materialType}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange}
                    min="0" step="0.01" placeholder="0"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 ${formErrors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Discount (%)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleChange}
                    min="0" max="100" placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange}
                    min="0" placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Delivery Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Delivery Days</label>
                  <input type="number" name="deliveryDays" value={formData.deliveryDays} onChange={handleChange}
                    min="1" placeholder="5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange}
                    rows={3} placeholder="Product description…"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
                </div>

                {/* Care Instructions */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Care Instructions</label>
                  <input name="careInstructions" value={formData.careInstructions} onChange={handleChange}
                    placeholder="e.g. Avoid water contact"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>

                {/* Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Product Images (URLs)</label>
                  <div className="flex gap-2">
                    <input name="imageInput" value={formData.imageInput} onChange={handleChange}
                      placeholder="Paste image URL and click Add"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500" />
                    <button type="button" onClick={addImageUrl}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500">
                      Add
                    </button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative group w-20 h-20">
                          <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange}
                      className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Active (visible on storefront)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {isSubmitting ? 'Saving…' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Products;
