import axios from 'axios';
import { getAuthToken } from '../../api/authApi';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
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
    // On 401/403 inside admin panel, redirect to /admin/login (not /login)
    if ((error.response?.status === 401 || error.response?.status === 403)
        && window.location.pathname.startsWith('/admin')
        && !window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
