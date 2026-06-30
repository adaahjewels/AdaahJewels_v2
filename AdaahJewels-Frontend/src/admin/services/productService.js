import axiosInstance from '../api/axiosInstance';

/**
 * Get all products with filters
 */
export const getProducts = async (filters = {}) => {
  try {
    const params = {};
    if (filters.category) params.categoryId = filters.category;
    if (filters.search)   params.search     = filters.search;
    if (filters.limit)    params.limit      = filters.limit;
    if (filters.page)     params.offset     = ((filters.page - 1) * (filters.limit || 50));

    const { data } = await axiosInstance.get('/products', { params });
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (productId) => {
  try {
    const { data } = await axiosInstance.get(`/products/${productId}`);
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  try {
    const { data } = await axiosInstance.post('/products', {
      name:             productData.name,
      categoryId:       productData.categoryId,
      materialType:     productData.material || productData.materialType,
      price:            productData.price,
      discount:         productData.discount ?? 0,
      deliveryDays:     productData.deliveryDays || 5,
      description:      productData.description,
      careInstructions: productData.careInstructions || null,
      stock:            productData.stock ?? 0,
      images:           productData.images || [],
    });
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update product
 */
export const updateProduct = async (productId, productData) => {
  try {
    const { data } = await axiosInstance.put(`/products/${productId}`, {
      name:             productData.name,
      categoryId:       productData.categoryId,
      materialType:     productData.material || productData.materialType,
      price:            productData.price,
      discount:         productData.discount ?? 0,
      deliveryDays:     productData.deliveryDays || 5,
      description:      productData.description,
      careInstructions: productData.careInstructions || null,
      stock:            productData.stock ?? 0,
      isActive:         productData.status !== 'inactive',
      images:           productData.images || [],
    });
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (productId) => {
  try {
    const { data } = await axiosInstance.delete(`/products/${productId}`);
    return data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = async (productIds) => {
  try {
    const promises = productIds.map(id => deleteProduct(id));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    throw error;
  }
};

/**
 * Update product status
 */
export const updateProductStatus = async (productId, status) => {
  try {
    const { data } = await axiosInstance.put(`/products/${productId}`, {
      isActive: status === 'active',
    });
    return data;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
};
