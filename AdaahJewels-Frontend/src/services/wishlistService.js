/**
 * wishlistService.js — proxies to backendServices.js
 */
import { wishlistService as api } from '../api/backendServices';

const normalizeItem = (item) => ({
  ...item,
  ProductId:   item._id   || item.id  || item.ProductId,
  id:          item._id   || item.id  || item.ProductId,
  ProductName: item.name  || item.ProductName || '',
  Price:       item.price ?? item.Price ?? 0,
  ImageUrl:    (item.images || [])[0] || item.ImageUrl || '',
});

export const getWishlist = async () => {
  const items = await api.get();
  return items.map(normalizeItem);
};

export const addToWishlist = async (productId) => {
  await api.add(productId);
};

export const removeFromWishlist = async (productId) => {
  await api.remove(productId);
};

export const isInWishlist = (wishlistItems, productId) =>
  wishlistItems.some(item => (item.ProductId || item.id) === String(productId));

export default { getWishlist, addToWishlist, removeFromWishlist, isInWishlist };
