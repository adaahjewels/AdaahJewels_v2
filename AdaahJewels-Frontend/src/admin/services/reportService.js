import axiosInstance from '../api/axiosInstance';

export const getSalesReport = async (filters = {}) => {
  const { data } = await axiosInstance.get('/dashboard/summary');
  return data ?? {};
};

export const getRevenueReport = async (filters = {}) => {
  const { data } = await axiosInstance.get('/dashboard/revenue-chart', {
    params: { timeRange: filters.timeRange || 'month' },
  });
  return Array.isArray(data) ? data : [];
};

export const getProductReport = async () => {
  const { data } = await axiosInstance.get('/dashboard/top-products');
  return Array.isArray(data) ? data : [];
};

export const getCustomerReport = async () => {
  const { data } = await axiosInstance.get('/users');
  return Array.isArray(data) ? data : [];
};

export const getInventoryReport = async () => {
  const { data } = await axiosInstance.get('/products');
  return Array.isArray(data) ? data : [];
};

export default {
  getSalesReport,
  getRevenueReport,
  getProductReport,
  getCustomerReport,
  getInventoryReport,
};
