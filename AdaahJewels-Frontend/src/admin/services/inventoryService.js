import { executeProcedure } from '../api/dynamicApi';

export const getInventory = async (filters = {}) => {
  return await executeProcedure('SP_InventoryList', filters);
};

export const updateInventory = async (productId, quantity) => {
  return await executeProcedure('SP_InventoryUpdate', {
    p_ProductId: productId,
    p_Quantity: quantity,
  });
};

export const getLowStockProducts = async (threshold = 10) => {
  return await executeProcedure('SP_LowStockProducts', { p_Threshold: threshold });
};

export const getInventoryReport = async (filters = {}) => {
  return await executeProcedure('SP_InventoryReport', filters);
};

export default { getInventory, updateInventory, getLowStockProducts, getInventoryReport };
