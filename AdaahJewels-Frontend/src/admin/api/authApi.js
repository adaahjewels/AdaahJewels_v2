import axiosInstance from './axiosInstance';
import { setAccessToken, getAuthToken } from '../../api/authApi';

/**
 * Admin auth — uses the same token store as the main app (localStorage key "authToken").
 * Admin user profile is stored in sessionStorage for the admin-only panel.
 */

export const loginAdmin = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { emailOrPhone: email, password });

  // Backend returns: { accessToken, refreshToken, user }
  const data  = response.data;
  const token = data?.accessToken || data?.token;
  const user  = data?.user;

  if (!token) {
    throw new Error(data?.message || 'No token returned from server');
  }

  // Persist token in localStorage (same as customer auth)
  setAccessToken(token);

  // Persist refresh token too
  if (data?.refreshToken) {
    try { localStorage.setItem('refreshToken', data.refreshToken); } catch (_) {}
  }

  // Store admin user profile in sessionStorage
  if (user) {
    try { sessionStorage.setItem('adminUser', JSON.stringify(user)); } catch (_) {}
  }

  return { success: true, data, user, token };
};

export const sendOtp = async (email) => {
  const response = await axiosInstance.post('/otp/send', { email, type: 'login' });
  // Backend otp/send returns { message } without a status wrapper
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await axiosInstance.post('/otp/verify', { email, otp, type: 'login' });
  const data = response.data;
  const token = data?.accessToken || data?.token;
  if (token) setAccessToken(token);
  const user = data?.user;
  if (user) {
    try { sessionStorage.setItem('adminUser', JSON.stringify(user)); } catch (_) {}
  }
  return data;
};

export const adminLogout = () => {
  setAccessToken(null);
  try { localStorage.removeItem('refreshToken'); } catch (_) {}
  try { sessionStorage.removeItem('adminUser'); } catch (_) {}
};

export const getAdminUser = () => {
  try {
    const raw = sessionStorage.getItem('adminUser');
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};

export { getAuthToken };

export const isAdminAuthenticated = () => !!getAuthToken();

export default {
  loginAdmin, sendOtp, verifyOtp, adminLogout,
  getAdminUser, getAuthToken, isAdminAuthenticated,
};
