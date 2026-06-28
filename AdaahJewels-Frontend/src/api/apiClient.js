/**
 * apiClient.js  —  Single Axios instance for ALL AdaahJewels backend calls
 *
 * Backend base: http://localhost:5000/api  (configured via VITE_API_BASE_URL)
 * Auth:         Bearer <accessToken> in Authorization header
 * Token store:  localStorage key "authToken"
 *
 * Usage:
 *   import api from './apiClient';
 *   const products = await api.get('/products');
 *   const order    = await api.post('/orders', payload);
 */

import axios from 'axios';

// ── Token helpers ────────────────────────────────────────────────────────────

export const getToken = () => {
  try { return localStorage.getItem('authToken') || null; }
  catch { return null; }
};

export const setToken = (token) => {
  try {
    token
      ? localStorage.setItem('authToken', token)
      : localStorage.removeItem('authToken');
  } catch { /* ignore */ }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const setStoredUser = (user) => {
  try {
    user
      ? localStorage.setItem('user', JSON.stringify(user))
      : localStorage.removeItem('user');
  } catch { /* ignore */ }
};

export const clearAuth = () => {
  setToken(null);
  setStoredUser(null);
};

// ── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;

    if (response?.status === 401 && response?.data?.code === 'TOKEN_EXPIRED') {
      // Attempt silent refresh
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );
          setToken(data.accessToken);
          // Retry original request with new token
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(error.config);
        }
      } catch {
        // Refresh failed — clear auth and redirect
        clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
