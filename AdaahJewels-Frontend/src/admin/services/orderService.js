import axiosInstance from '../api/axiosInstance';

export const getOrders = async (filters = {}) => {
  const { data } = await axiosInstance.get('/orders');
  let orders = Array.isArray(data) ? data : [];
  if (filters.status) {
    orders = orders.filter(o => o.status === filters.status);
  }
  return orders;
};

export const getOrderDetails = async (orderId) => {
  const { data } = await axiosInstance.get(`/orders/${orderId}`);
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await axiosInstance.patch(`/orders/${orderId}/status`, { status });
  return data;
};

export const getOrderItems = async (orderId) => {
  const { data } = await axiosInstance.get(`/orders/${orderId}`);
  return Array.isArray(data?.items) ? data.items : [];
};

export default { getOrders, getOrderDetails, updateOrderStatus, getOrderItems };
