import axiosInstance from '../api/axiosInstance';

export const getCategories = async () => {
  const { data } = await axiosInstance.get('/categories/admin');
  return Array.isArray(data) ? data : data?.data || [];
};

export const getCategoryById = async (categoryId) => {
  const { data } = await axiosInstance.get(`/categories/${categoryId}`);
  return data;
};

export const createCategory = async (data) => {
  const { data: result } = await axiosInstance.post('/categories', {
    name:        data.name,
    description: data.description || null,
    imageUrl:    data.image || data.imageUrl || null,
    isActive:    data.status !== 0 && data.status !== false,
  });
  return result;
};

export const updateCategory = async (categoryId, data) => {
  const { data: result } = await axiosInstance.put(`/categories/${categoryId}`, {
    name:        data.name,
    description: data.description || null,
    imageUrl:    data.image || data.imageUrl || null,
    isActive:    data.status !== 0 && data.status !== false,
  });
  return result;
};

export const deleteCategory = async (categoryId) => {
  const { data } = await axiosInstance.delete(`/categories/${categoryId}`);
  return data;
};

export default { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
