/**
 * categoryService.js — proxies to backendServices.js
 * Normalizes category/subcategory field names for UI compatibility.
 */
import { categoryService as api } from '../api/backendServices';

const normalize = (c) => ({
  ...c,
  CategoryId:   c._id  || c.id  || c.CategoryId,
  id:           c._id  || c.id  || c.CategoryId,
  CategoryName: c.name || c.CategoryName || '',
  name:         c.name || c.CategoryName || '',
  slug:         c.slug || '',
  ImageUrl:     c.image_url || c.imageUrl || c.ImageUrl || '',
  image_url:    c.image_url || c.imageUrl || c.ImageUrl || '',
  Description:  c.description || c.Description || '',
  IsActive:     c.is_active !== 0 && c.isActive !== false,
  ParentId:     c.parent_id ?? c.ParentId ?? null,
  SubcategoryCount: c.subcategory_count ?? 0,
});

export const getCategories = async () => {
  try {
    const data = await api.getAll();
    return data.map(normalize);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const { data } = await (await import('../api/apiClient')).default.get(`/categories/${categoryId}`);
    return normalize(data);
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    return null;
  }
};

export const getSubcategories = async (parentId) => {
  try {
    const data = await api.getSubcategories(parentId);
    return data.map(normalize);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};

export default { getCategories, getCategoryById, getSubcategories };
