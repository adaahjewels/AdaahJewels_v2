import { useState, useEffect } from 'react';
import { getCategories, getCategoryById } from '../services/categoryService';

/**
 * Custom hook for fetching categories
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  return { categories, loading, error };
};

/**
 * Custom hook for fetching a single category
 */
export const useCategory = (categoryId) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCategoryById(categoryId);
        setCategory(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  return { category, loading, error };
};

export default {
  useCategories,
  useCategory,
};
