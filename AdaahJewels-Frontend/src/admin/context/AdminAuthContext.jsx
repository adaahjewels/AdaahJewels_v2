import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, sendOtp, verifyOtp, adminLogout, getAdminUser, isAdminAuthenticated } from '../api/authApi';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const token = isAdminAuthenticated();
    const userData = getAdminUser();
    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const loginAdminAccount = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginAdmin(email, password);
      const userData = response?.user;

      if (!userData) {
        throw new Error('No user data returned from server');
      }
      if (userData.role !== 'admin') {
        // Clear the stored token — this user is not an admin
        adminLogout();
        throw new Error('Access denied — admin credentials required');
      }

      setUser(userData);
      setIsAuthenticated(true);
      setOtpSent(false);
      setOtpEmail('');
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to login admin';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTPEmail = async (email) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setOtpEmail(email);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTPCode = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await verifyOtp(email, otp);
      const userData = response.data?.user;
      setUser(userData);
      setIsAuthenticated(true);
      setOtpSent(false);
      setOtpEmail('');
      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    adminLogout();
    setUser(null);
    setIsAuthenticated(false);
    setOtpSent(false);
    setOtpEmail('');
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    otpSent,
    otpEmail,
    loginAdminAccount,
    sendOTPEmail,
    verifyOTPCode,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
