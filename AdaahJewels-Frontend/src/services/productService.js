/**
 * productService.js — proxies to backendServices.js
 * Normalizes field names so existing hooks (useProducts, useProduct) work unchanged.
 * Uses the live backend catalogue only; no local product fallback data.
 */
import { productService as api } from '../api/backendServices';

const FALLBACK_IMAGE = '/no-image.svg';

const normalize = (p) => {
  if (!p) return null;

  // Backend returns images as comma-separated string OR array of URLs
  let images = [];
  if (Array.isArray(p.images)) {
    images = p.images.filter(Boolean);
  } else if (typeof p.images === 'string' && p.images) {
    images = p.images.split(',').map(u => u.trim()).filter(Boolean);
  }

  // Fallback to legacy ProductImages array
  if (images.length === 0 && Array.isArray(p.ProductImages)) {
    images = p.ProductImages
      .map(img => (typeof img === 'string' ? img : img?.ImageUrl || img?.url || img?.image_url))
      .filter(Boolean);
  }

  const primaryImage = images[0] || p.ImageUrl || p.image_url || p.image || FALLBACK_IMAGE;

  const resolvedId    = p._id || p.id || p.ProductId || p.productId;
  const price         = Number(p.price ?? p.Price ?? 0);
  const discount      = Number(p.discount ?? p.Discount ?? 0);
  const stock         = Number(p.stock ?? p.Stock ?? 0);
  const rating        = Number(p.averageRating ?? p.AverageRating ?? p.rating ?? p.Rating ?? 0);
  const categoryName  = p.parent_category_name || p.parentCategoryName
                        || p.subcategory_name   || p.CategoryName
                        || p.category           || '';

  return {
    ...p,
    // IDs
    ProductId: resolvedId,
    id:        resolvedId,
    // Names
    ProductName: p.name || p.ProductName || '',
    name:        p.name || p.ProductName || '',
    // Prices
    Price:    price,
    price,
    Discount: discount,
    discount,
    // Stock
    Stock: stock,
    stock,
    // Descriptions
    Description: p.description || p.Description || '',
    description: p.description || p.Description || '',
    // Category
    CategoryName:    categoryName,
    category:        categoryName,
    SubcategoryName: p.subcategory_name || p.subcategoryName || '',
    // Parent category id — used for category-filter matching
    parent_category_id: p.parent_category_id || p.parentCategoryId || null,
    category_id:        p.category_id || p.categoryId || null,
    // Material
    Material:      p.material_type || p.materialType || p.Material || '',
    material_type: p.material_type || p.materialType || '',
    material:      p.material_type || p.materialType || '',
    // Status
    IsActive: p.isActive !== false && p.is_active !== 0,
    // Rating
    AverageRating: rating,
    rating,
    // Images — set BOTH formats so ProductCard works regardless of which it reads
    images,
    ProductImages: images.map(url => ({ ImageUrl: url, url })),
    ImageUrl:  primaryImage,
    image_url: primaryImage,
    image:     primaryImage,
  };
};

const normalizeList = (data) => (Array.isArray(data) ? data.map(normalize).filter(Boolean) : []);

const applyFilters = (list, filters = {}) => {
  const category = String(filters.category || '').toLowerCase();
  const material = String(filters.material || '').toLowerCase();
  const minPrice = Number(filters.minPrice || 0);
  const maxPrice = Number(filters.maxPrice || Number.POSITIVE_INFINITY);

  return list.filter((product) => {
    const productCategory = String(product.CategoryName || product.category || '').toLowerCase();
    const productMaterial = String(product.Material || product.material_type || '').toLowerCase();
    const price = Number(product.Price || product.price || 0);

    if (category && !productCategory.includes(category) && !String(product.name || '').toLowerCase().includes(category)) {
      return false;
    }
    if (material && !productMaterial.includes(material)) {
      return false;
    }
    if (price < minPrice || price > maxPrice) {
      return false;
    }
    return true;
  });
};

export const getProducts = async (filters = {}) => {
  try {
    const payload = {
      categoryId: filters.categoryId || (Number.isFinite(Number(filters.category)) ? Number(filters.category) : null),
      materialType: filters.materialType || filters.material || null,
      minPrice: filters.minPrice || null,
      maxPrice: filters.maxPrice || null,
      search: filters.search || filters.query || null,
    };

    const data = await api.getAll(payload);
    const normalized = normalizeList(Array.isArray(data) ? data : data?.data || []);
    return applyFilters(normalized, filters);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (productId) => {
  try {
    const data = await api.getById(productId);
    return normalize(data);
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

export const getBestSellers = async (limit = 6) => {
  try {
    const data = api.getBestSellers
      ? await api.getBestSellers(limit)
      : await api.get('/products/best-sellers', { params: { limit } });
    const normalized = normalizeList(Array.isArray(data) ? data : data?.data || []);
    return normalized;
  } catch (error) {
    console.error('Error fetching best sellers:', error);
    return [];
  }
};

export const getRecommendations = async (productId, limit = 4) => {
  try {
    const source = await api.getById(productId);
    const normalizedSource = normalize(source);
    if (!normalizedSource) return [];

    const data = await api.getAll({ categoryId: normalizedSource.category_id || null, limit: 20 });
    const normalized = normalizeList(Array.isArray(data) ? data : data?.data || []);

    return normalized
      .filter((product) => String(product.ProductId || product.id) !== String(productId))
      .filter((product) => {
        const sameParentCategory = product.category_id === normalizedSource.category_id;
        const sameCategoryName = (product.CategoryName || product.category || '').toLowerCase() === (normalizedSource.CategoryName || normalizedSource.category || '').toLowerCase();
        return sameParentCategory || sameCategoryName;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export default { getProducts, getProductById, getBestSellers, getRecommendations };
