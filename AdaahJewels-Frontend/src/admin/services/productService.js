import { executeProcedure } from '../api/dynamicApi';

/**
 * Get all products with filters
 */
export const getProducts = async (filters = {}) => {
  try {
    const params = {
      ...(filters.category && { p_Category: filters.category }),
      ...(filters.search && { p_Search: filters.search }),
      ...(filters.page && { p_Page: filters.page }),
      ...(filters.limit && { p_Limit: filters.limit }),
      ...(filters.status && { p_Status: filters.status }),
    };

    const result = await executeProcedure('SP_ProductList', params);
    return Array.isArray(result) ? result : result?.data || [];
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
    const result = await executeProcedure('SP_ProductGetById', {
      p_ProductId: productId,
    });
    return Array.isArray(result) ? result[0] : result;
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
    const params = {
      p_ProductName: productData.name,
      p_SKU: productData.sku,
      p_CategoryId: productData.categoryId,
      p_Description: productData.description,
      p_Price: productData.price,
      p_SalePrice: productData.salePrice,
      p_StockQuantity: productData.stock,
      p_Material: productData.material,
      p_Weight: productData.weight,
      p_Status: productData.status || 'active',
      p_Featured: productData.featured ? 1 : 0,
      p_BestSeller: productData.bestSeller ? 1 : 0,
      p_Images: productData.images?.join(',') || '',
    };

    const result = await executeProcedure('SP_ProductInsert', params);
    return result;
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
    const params = {
      p_ProductId: productId,
      p_ProductName: productData.name,
      p_SKU: productData.sku,
      p_CategoryId: productData.categoryId,
      p_Description: productData.description,
      p_Price: productData.price,
      p_SalePrice: productData.salePrice,
      p_StockQuantity: productData.stock,
      p_Material: productData.material,
      p_Weight: productData.weight,
      p_Status: productData.status || 'active',
      p_Featured: productData.featured ? 1 : 0,
      p_BestSeller: productData.bestSeller ? 1 : 0,
      p_Images: productData.images?.join(',') || '',
    };

    const result = await executeProcedure('SP_ProductUpdate', params);
    return result;
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
    const result = await executeProcedure('SP_ProductDelete', {
      p_ProductId: productId,
    });
    return result;
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
    const result = await executeProcedure('SP_ProductStatusUpdate', {
      p_ProductId: productId,
      p_Status: status,
    });
    return result;
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
