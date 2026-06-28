/**
 * cartService.js — proxies to backendServices.js
 * Normalizes cart item fields so useCart.js works unchanged.
 */
import { cartService as api } from '../api/backendServices';

const normalizeItem = (item) => ({
  ...item,
  CartItemId:  item.CartItemId  || item.id  || item._id,
  ProductId:   item.productId   || item.ProductId || item.product?._id || item.product,
  id:          item.productId   || item.ProductId || item.product?._id || item.product,
  ProductName: item.name        || item.ProductName || item.product?.name || '',
  name:        item.name        || item.ProductName || '',
  Price:       item.price       ?? item.Price  ?? 0,
  price:       item.price       ?? item.Price  ?? 0,
  Quantity:    item.quantity     ?? item.Quantity ?? 1,
  quantity:    item.quantity     ?? item.Quantity ?? 1,
  ImageUrl:    item.image       || item.ImageUrl || '',
});

export const getCart = async () => {
  const items = await api.get();
  return items.map(normalizeItem);
};

export const addToCart = async (productId, quantity = 1) => {
  await api.add(productId, quantity);
};

/**
 * useCart.js passes (cartItemId, quantity) — our backend uses productId.
 * Since our in-memory backend uses productId for update, we pass productId here.
 * CartItemId and ProductId are the same value in our backend.
 */
export const updateCartItem = async (productId, quantity) => {
  await api.update(productId, quantity);
};

export const removeFromCart = async (productId) => {
  await api.remove(productId);
};

export const clearCart = async () => {
  await api.clear();
};

export const isInCart = (cartItems, productId) =>
  cartItems.some(item => (item.ProductId || item.id) === String(productId));

export default { getCart, addToCart, updateCartItem, removeFromCart, clearCart, isInCart };
