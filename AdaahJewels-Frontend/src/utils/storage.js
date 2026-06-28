/**
 * Safe localStorage wrapper (non-sensitive data only).
 * JWT tokens are NEVER stored here — use in-memory store in authApi.js.
 */

export const storage = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch { return defaultValue; }
  },
  setItem: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  },
  removeItem: (key) => {
    try { localStorage.removeItem(key); } catch (_) {}
  },
  clear: () => {
    try { localStorage.clear(); } catch (_) {}
  },
  hasItem: (key) => localStorage.getItem(key) !== null,
};

export const cartStorage = {
  setCart: (items) => storage.setItem('cart', items),
  getCart: () => storage.getItem('cart', []),
  clearCart: () => storage.removeItem('cart'),
};

export const wishlistStorage = {
  setWishlist: (items) => storage.setItem('wishlist', items),
  getWishlist: () => storage.getItem('wishlist', []),
  clearWishlist: () => storage.removeItem('wishlist'),
};

export default storage;
