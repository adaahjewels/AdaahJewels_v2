import { executeProcedure } from '../api/dynamicApi';

// SP_CustomerList(p_Search, p_Page, p_Limit)
export const getCustomers = async (filters = {}) => {
  const result = await executeProcedure('SP_CustomerList', {
    p_Search: filters.search || null,
    p_Page: filters.page || 1,
    p_Limit: filters.limit || 20,
  });
  return Array.isArray(result) ? result : [];
};

// SP_CustomerDetails(p_UserId) - returns 3 result sets: user info, orders, addresses
export const getCustomerDetails = async (userId) => {
  const result = await executeProcedure('SP_CustomerDetails', { p_UserId: userId });
  if (Array.isArray(result)) {
    return {
      info: Array.isArray(result[0]) ? result[0][0] : result[0],
      orders: Array.isArray(result[1]) ? result[1] : [],
      addresses: Array.isArray(result[2]) ? result[2] : [],
    };
  }
  return { info: result, orders: [], addresses: [] };
};

export default { getCustomers, getCustomerDetails };
