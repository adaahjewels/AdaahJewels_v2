/**
 * orderService.js — proxies to backendServices.js
 * Normalizes backend order fields to what OrdersPage/OrderConfirmation expect.
 */
import { orderService as api } from '../api/backendServices';
import { getToken } from '../api/apiClient';

const normalizeOrder = (o) => {
  if (!o) return null;
  const items = (o.items || []).map(item => ({
    ...item,
    ProductName: item.product?.name || item.productName || item.ProductName || '',
    Quantity:    Number(item.quantity  ?? item.Quantity  ?? 1),
    quantity:    Number(item.quantity  ?? item.Quantity  ?? 1),
    Price:       Number(item.price     ?? item.Price     ?? 0),
    price:       Number(item.price     ?? item.Price     ?? 0),
  }));

  return {
    ...o,
    OrderId:        o._id || o.id || o.OrderId,
    id:             o._id || o.id || o.OrderId,
    TotalAmount:    Number(o.totalAmount ?? o.total_amount ?? o.TotalAmount ?? 0),
    Status:         o.status           || o.Status        || 'pending',
    PaymentStatus:  o.paymentId ? 'Paid' : 'Pending',
    PaymentMethod:  o.paymentMethod    || o.payment_method || o.PaymentMethod || '',
    CreatedAt:      o.createdAt        || o.created_at    || o.CreatedAt    || new Date().toISOString(),
    ShippingAddress:o.shippingAddress?.address || o.shipping_address || o.ShippingAddress || '',
    ShippingCity:   o.shippingAddress?.city    || o.shipping_city    || o.ShippingCity    || '',
    ShippingState:  o.shippingAddress?.state   || o.shipping_state   || o.ShippingState   || '',
    ShippingZipCode:o.shippingAddress?.pincode || o.shipping_pincode || o.ShippingZipCode || '',
    OrderItems:     items,
  };
};

export const createOrder = async (orderData) => {
  if (!getToken()) throw new Error('User must be authenticated to create order');
  const order = await api.create(orderData);
  return normalizeOrder(order);
};

export const getOrders = async (filters = {}) => {
  if (!getToken()) throw new Error('User must be authenticated to view orders');
  const orders = await api.getMyOrders();
  return orders.map(normalizeOrder).filter(Boolean);
};

export const getOrderDetails = async (orderId) => {
  if (!getToken()) throw new Error('User must be authenticated to view order details');
  // Use GET /orders/:id directly
  const result = await api.getById(orderId);
  if (!result) return null;
  // api.getById returns { order, items } from backend
  const raw = result.order ? { ...result.order, items: result.items || [] } : result;
  return normalizeOrder(raw);
};

export const cancelOrder = async (orderId) => {
  // Backend doesn't have a cancel endpoint yet — call PATCH status = cancelled
  // For now just throw a meaningful error
  throw new Error('Order cancellation: please contact support');
};

export const downloadInvoice = (orderId) => api.downloadInvoice(orderId);
export const sendInvoiceByEmail = (orderId) => api.sendInvoiceByEmail(orderId);

export default { createOrder, getOrders, getOrderDetails, cancelOrder, downloadInvoice, sendInvoiceByEmail };
