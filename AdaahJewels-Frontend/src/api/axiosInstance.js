import axios from 'axios';
import { getAuthToken } from './authApi';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't forcefully redirect on 401/403
    // Let React components (ProtectedRoute) handle auth redirects
    // Just reject the error and let the component decide what to do
    return Promise.reject(error);
  }
);

export default axiosInstance;
