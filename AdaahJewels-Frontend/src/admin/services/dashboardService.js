/**
 * dashboardService.js
 * Calls real REST endpoints on /api/dashboard — no stored-procedure wrapper.
 */
import axiosInstance from '../api/axiosInstance';

export const getDashboardSummary = async () => {
  const { data } = await axiosInstance.get('/dashboard/summary');
  return data ?? {};
};

export const getRevenueChart = async (timeRange = 'month') => {
  const { data } = await axiosInstance.get('/dashboard/revenue-chart', {
    params: { timeRange },
  });
  return Array.isArray(data) ? data : [];
};

export const getOrdersChart = async (timeRange = 'month') => {
  const { data } = await axiosInstance.get('/dashboard/orders-chart', {
    params: { timeRange },
  });
  return Array.isArray(data) ? data : [];
};

export const getTopProducts = async (limit = 5) => {
  const { data } = await axiosInstance.get('/dashboard/top-products', {
    params: { limit },
  });
  return Array.isArray(data) ? data : [];
};

export const getTopCategories = async (limit = 5) => {
  const { data } = await axiosInstance.get('/dashboard/top-categories', {
    params: { limit },
  });
  return Array.isArray(data) ? data : [];
};

export const getRecentOrders = async (limit = 8) => {
  const { data } = await axiosInstance.get('/dashboard/recent-orders', {
    params: { limit },
  });
  return Array.isArray(data) ? data : [];
};

export default {
  getDashboardSummary,
  getRevenueChart,
  getOrdersChart,
  getTopProducts,
  getTopCategories,
  getRecentOrders,
};
