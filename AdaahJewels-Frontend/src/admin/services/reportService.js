import { executeProcedure } from '../api/dynamicApi';

export const getSalesReport = async (filters = {}) => {
  return await executeProcedure('SP_SalesReport', filters);
};

export const getRevenueReport = async (filters = {}) => {
  return await executeProcedure('SP_RevenueReport', filters);
};

export const getProductReport = async (filters = {}) => {
  return await executeProcedure('SP_ProductReport', filters);
};

export const getCustomerReport = async (filters = {}) => {
  return await executeProcedure('SP_CustomerReport', filters);
};

export const getInventoryReport = async (filters = {}) => {
  return await executeProcedure('SP_InventoryReport', filters);
};

export default {
  getSalesReport,
  getRevenueReport,
  getProductReport,
  getCustomerReport,
  getInventoryReport,
};
