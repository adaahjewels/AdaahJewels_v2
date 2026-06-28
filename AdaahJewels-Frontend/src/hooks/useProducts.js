import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  getProductById,
  getBestSellers,
  getRecommendations,
} from '../services/productService';

/**
 * Custom hook for managing products
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(filters);
      setProducts(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
  };
};

/**
 * Custom hook for fetching a single product
 */
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};

/**
 * Custom hook for fetching best sellers
 */
export const useBestSellers = (limit = 6) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestSellersData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBestSellers(limit);
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch best sellers');
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellersData();
  }, [limit]);

  return { products, loading, error };
};

/**
 * Custom hook for fetching product recommendations
 */
export const useRecommendations = (productId, limit = 4) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchRecommendationsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecommendations(productId, limit);
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendationsData();
  }, [productId, limit]);

  return { products, loading, error };
};

export default {
  useProducts,
  useProduct,
  useBestSellers,
  useRecommendations,
};
