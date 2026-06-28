/**
 * useWishlist.js — Wishlist hook
 * Uses wishlistService (which proxies to backendServices.wishlistService).
 * Falls back to localStorage when unauthenticated.
 */
import { useState, useCallback, useEffect } from 'react';
import { getToken } from '../api/apiClient';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../services/wishlistService';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
    catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const isAuthenticated       = !!getToken();

  useEffect(() => {
    try { localStorage.setItem('wishlist', JSON.stringify(wishlistItems)); }
    catch { /* ignore */ }
  }, [wishlistItems]);

  useEffect(() => {
    if (isAuthenticated) syncWishlist();
  }, [isAuthenticated]); // eslint-disable-line

  const syncWishlist = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true); setError(null);
    try {
      const data = await getWishlist();
      setWishlistItems(data);
    } catch (err) {
      setError(err.message || 'Failed to sync wishlist');
    } finally { setLoading(false); }
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    const productId = product._id || product.ProductId || product.id;
    const exists = wishlistItems.some(i => (i.ProductId || i.id || i._id) === productId);
    if (exists) {
      if (isAuthenticated) {
        try { await removeFromWishlist(productId); } catch (err) { setError(err.message); return; }
      }
      setWishlistItems(prev => prev.filter(i => (i.ProductId || i.id || i._id) !== productId));
    } else {
      if (isAuthenticated) {
        try { await addToWishlist(productId); } catch (err) { setError(err.message); return; }
      }
      setWishlistItems(prev => [...prev, { ...product, ProductId: productId, id: productId }]);
    }
  }, [wishlistItems, isAuthenticated]);

  const addToWishlistItem = useCallback(async (product) => {
    const productId = product._id || product.ProductId || product.id;
    if (wishlistItems.some(i => (i.ProductId || i.id || i._id) === productId)) return;
    if (isAuthenticated) {
      try { await addToWishlist(productId); } catch (err) { setError(err.message); return; }
    }
    setWishlistItems(prev => [...prev, { ...product, ProductId: productId, id: productId }]);
  }, [wishlistItems, isAuthenticated]);

  const removeFromWishlistItem = useCallback(async (productId) => {
    if (isAuthenticated) {
      try { await removeFromWishlist(productId); } catch (err) { setError(err.message); return; }
    }
    setWishlistItems(prev => prev.filter(i => (i.ProductId || i.id || i._id) !== productId));
  }, [isAuthenticated]);

  const isInWishlist = useCallback((productId) =>
    wishlistItems.some(i => (i.ProductId || i.id || i._id) === productId),
  [wishlistItems]);

  const clearWishlist = useCallback(() => setWishlistItems([]), []);

  return { wishlistItems, loading, error, toggleWishlist, addToWishlist: addToWishlistItem, removeFromWishlist: removeFromWishlistItem, isInWishlist, clearWishlist, syncWishlist };
};

export default useWishlist;
