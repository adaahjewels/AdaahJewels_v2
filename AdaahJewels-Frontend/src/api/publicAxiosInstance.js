import axios from 'axios';

/**
 * Public Axios Instance
 * Used for public endpoints that don't require authentication
 * Examples: Get categories, Get products, Get testimonials
 * 
 * This instance does NOT add Authorization headers
 */
const publicAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No auth interceptor for public endpoints
// Just pass through errors

export default publicAxiosInstance;
