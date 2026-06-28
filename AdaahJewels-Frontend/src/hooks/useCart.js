/**
 * useCart.js — Cart hook
 * Uses cartService (which proxies to backendServices.cartService).
 * Falls back to localStorage when unauthenticated.
 */
import { useState, useCallback, useEffect } from 'react';
import { getToken } from '../api/apiClient';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart as clearCartAPI,
} from '../services/cartService';

export const useCart = () => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch { return []; }
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const isAuthenticated         = !!getToken();

  // Persist to localStorage as a cache
  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(cartItems)); }
    catch { /* ignore */ }
  }, [cartItems]);

  // Sync with server on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) syncCart();
  }, [isAuthenticated]); // eslint-disable-line

  const syncCart = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true); setError(null);
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (err) {
      setError(err.message || 'Failed to sync cart');
    } finally { setLoading(false); }
  }, []);

  const addItem = useCallback(async (product, quantity = 1) => {
    const productId = product._id || product.ProductId || product.id;
    if (isAuthenticated) {
      setLoading(true); setError(null);
      try { await addToCart(productId, quantity); }
      catch (err) { setError(err.message || 'Failed to add to cart'); setLoading(false); return; }
      finally { setLoading(false); }
    }
    setCartItems(prev => {
      const existing = prev.find(i => (i.ProductId || i.id || i._id) === productId);
      if (existing) {
        return prev.map(i =>
          (i.ProductId || i.id || i._id) === productId
            ? { ...i, quantity: (i.quantity || i.Quantity || 1) + quantity, Quantity: (i.Quantity || i.quantity || 1) + quantity }
            : i
        );
      }
      return [...prev, {
        ...product,
        ProductId: productId,
        id:        productId,
        quantity:  quantity,
        Quantity:  quantity,
      }];
    });
  }, [isAuthenticated]);

  const updateItem = useCallback(async (productId, quantity) => {
    if (quantity <= 0) { removeItem(productId); return; }
    if (isAuthenticated) {
      setLoading(true); setError(null);
      try { await updateCartItem(productId, quantity); }
      catch (err) { setError(err.message || 'Failed to update cart'); setLoading(false); return; }
      finally { setLoading(false); }
    }
    setCartItems(prev =>
      prev.map(i =>
        (i.ProductId || i.id || i._id) === productId
          ? { ...i, quantity, Quantity: quantity }
          : i
      )
    );
  }, [isAuthenticated]); // eslint-disable-line

  const removeItem = useCallback(async (productId) => {
    if (isAuthenticated) {
      setLoading(true); setError(null);
      try { await removeFromCart(productId); }
      catch (err) { setError(err.message || 'Failed to remove from cart'); setLoading(false); return; }
      finally { setLoading(false); }
    }
    setCartItems(prev =>
      prev.filter(i => (i.ProductId || i.id || i._id) !== productId)
    );
  }, [isAuthenticated]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true); setError(null);
      try { await clearCartAPI(); }
      catch (err) { setError(err.message || 'Failed to clear cart'); setLoading(false); return; }
      finally { setLoading(false); }
    }
    setCartItems([]);
  }, [isAuthenticated]);

  const getTotal = useCallback(() =>
    cartItems.reduce((t, i) => t + (i.price || i.Price || 0) * (i.quantity || i.Quantity || 1), 0),
  [cartItems]);

  const getCount = useCallback(() =>
    cartItems.reduce((c, i) => c + (i.quantity || i.Quantity || 1), 0),
  [cartItems]);

  const isInCart = useCallback((productId) =>
    cartItems.some(i => (i.ProductId || i.id || i._id) === productId),
  [cartItems]);

  return { cartItems, loading, error, addItem, updateItem, removeItem, clearCart, getTotal, getCount, isInCart, syncCart };
};

export default useCart;
