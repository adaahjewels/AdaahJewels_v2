import axiosInstance from '../api/axiosInstance';

export const getInventory = async () => {
  const { data } = await axiosInstance.get('/products');
  return Array.isArray(data) ? data : [];
};

export const updateInventory = async (productId, quantity) => {
  const { data } = await axiosInstance.patch(`/products/${productId}/stock`, { stock: quantity });
  return data;
};

export const getLowStockProducts = async (threshold = 10) => {
  const { data } = await axiosInstance.get('/products');
  const products = Array.isArray(data) ? data : [];
  return products.filter(p => (p.stock ?? p.StockQuantity ?? 0) <= threshold);
};

export const getInventoryReport = async () => {
  const { data } = await axiosInstance.get('/products');
  return Array.isArray(data) ? data : [];
};

export default { getInventory, updateInventory, getLowStockProducts, getInventoryReport };
