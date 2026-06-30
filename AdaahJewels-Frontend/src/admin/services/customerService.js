import axiosInstance from '../api/axiosInstance';

export const getCustomers = async (filters = {}) => {
  const params = {};
  if (filters.limit)  params.limit  = filters.limit;
  if (filters.offset) params.offset = filters.offset;
  const { data } = await axiosInstance.get('/users', { params });
  return Array.isArray(data) ? data : [];
};

export const getCustomerDetails = async (userId) => {
  const [userRes, ordersRes] = await Promise.allSettled([
    axiosInstance.get(`/users/${userId}`),
    axiosInstance.get(`/users/${userId}/orders`),
  ]);
  return {
    info:      userRes.status    === 'fulfilled' ? userRes.value.data    : null,
    orders:    ordersRes.status  === 'fulfilled' ? (Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []) : [],
    addresses: [],
  };
};

export default { getCustomers, getCustomerDetails };
