import { executeProcedure } from '../api/dynamicApi';

export const getCategories = async (filters = {}) => {
  const result = await executeProcedure('SP_CategoryList', filters);
  return Array.isArray(result) ? result : result?.data || [];
};

export const getCategoryById = async (categoryId) => {
  const result = await executeProcedure('SP_CategoryGetById', { p_CategoryId: categoryId });
  return Array.isArray(result) ? result[0] : result;
};

export const createCategory = async (data) => {
  return await executeProcedure('SP_CategoryInsert', {
    p_CategoryName: data.name,
    p_Slug: data.slug,
    p_Description: data.description,
    p_Image: data.image,
    p_Status: data.status,
    p_ParentId: data.parentId,
  });
};

export const updateCategory = async (categoryId, data) => {
  return await executeProcedure('SP_CategoryUpdate', {
    p_CategoryId: categoryId,
    p_CategoryName: data.name,
    p_Slug: data.slug,
    p_Description: data.description,
    p_Image: data.image,
    p_Status: data.status,
    p_ParentId: data.parentId,
  });
};

export const deleteCategory = async (categoryId) => {
  return await executeProcedure('SP_CategoryDelete', { p_CategoryId: categoryId });
};

export default { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
