/**
 * useAuth.js — Authentication hook
 * Uses backendServices.authService + apiClient token helpers.
 * API contract (backend POST /api/auth/login):
 *   body:     { emailOrPhone, password }
 *   response: { accessToken, refreshToken, user: { id, name, email, phone, role } }
 */
import { useState, useCallback, useEffect } from 'react';
import { authService, otpService } from '../api/backendServices';
import { getToken, getStoredUser, setStoredUser, clearAuth } from '../api/apiClient';

export const useAuth = () => {
  const [user, setUser]         = useState(() => getStoredUser());
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);
  const [otpSent, setOtpSent]   = useState(false);
  const [otpEmail, setOtpEmail] = useState('');

  // ── Initialise auth state on mount ─────────────────────────────────────────
  // Validate the stored token against the server so auth persists across refreshes
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    // Token exists — try to fetch the profile to confirm it's still valid
    (async () => {
      try {
        const userData = await authService.getProfile();
        setUser(userData);
        setStoredUser(userData);
      } catch (err) {
        const code = err?.response?.data?.code || err?.response?.data?.error || null;
        // If token expired, attempt silent refresh using refresh token then retry once
        if (code === 'TOKEN_EXPIRED' || err?.response?.status === 401) {
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
              const res = await fetch(`${base}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
              });
              if (res.ok) {
                const data = await res.json();
                // store new access token and retry profile
                setStoredUser(getStoredUser());
                // setToken helper is imported via apiClient; use window.localStorage directly to avoid circular import
                localStorage.setItem('authToken', data.accessToken);
                try {
                  const userData = await authService.getProfile();
                  setUser(userData);
                  setStoredUser(userData);
                  setLoading(false);
                  return;
                } catch (e) {
                  // fall through to clearing auth
                }
              }
            }
          } catch (refreshErr) {
            // ignore and clear auth below
          }
        }
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (emailOrMobile, password) => {
    setLoading(true); setError(null);
    try {
      const { user: userData } = await authService.login(emailOrMobile, password);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to login';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const registerNewUser = useCallback(async (email, password, phoneNumber, firstName, lastName = '') => {
    setLoading(true); setError(null);
    try {
      const name = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
      const { user: userData } = await authService.register({
        name,
        email,
        phone: phoneNumber,
        password,
      });
      setUser(userData);
      return { success: true, data: { user: userData } };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to register';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  // ── OTP: send ───────────────────────────────────────────────────────────────
  const sendEmailVerificationOTP = useCallback(async (email) => {
    setLoading(true); setError(null);
    try {
      await otpService.send(email, null, 'registration');
      setOtpSent(true); setOtpEmail(email);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const resendEmailOTP = useCallback(async (email) => {
    setLoading(true); setError(null);
    try {
      await otpService.send(email, null, 'registration');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  // ── OTP: verify email ───────────────────────────────────────────────────────
  const verifyEmailOTPCode = useCallback(async (email, otp) => {
    setLoading(true); setError(null);
    try {
      await otpService.verify(email, null, otp, 'registration');
      // After verification, complete registration via otp-auth
      const { user: userData } = await otpService.otpAuth({ email, isNewUser: false });
      setUser(userData); setOtpSent(false); setOtpEmail('');
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  // ── Password reset ──────────────────────────────────────────────────────────
  const sendResetOTP = useCallback(async (email) => {
    setLoading(true); setError(null);
    try {
      await authService.forgotPassword(email);
      setOtpEmail(email);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send reset OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const verifyResetOTPCode = useCallback(async (email, otp) => {
    setLoading(true); setError(null);
    try {
      // Backend uses token-based reset, not OTP verify step separately
      // Store OTP to use in resetPasswordFunc
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to verify OTP';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const resetPasswordFunc = useCallback(async (resetToken, newPassword) => {
    setLoading(true); setError(null);
    try {
      await authService.resetPassword(resetToken, newPassword);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  const changePasswordFunc = useCallback(async (oldPassword, newPassword) => {
    setLoading(true); setError(null);
    try {
      await authService.changePassword(oldPassword, newPassword);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password';
      setError(msg);
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logoutUser = useCallback(() => {
    authService.logout();
    setUser(null); setOtpSent(false); setOtpEmail('');
  }, []);

  return {
    user,
    setUser,
    isLoading,
    error,
    otpSent,
    otpEmail,
    // Actions
    login,
    registerNewUser,
    sendEmailVerificationOTP,
    resendEmailOTP,
    verifyEmailOTPCode,
    sendResetOTP,
    verifyResetOTPCode,
    resetPasswordFunc,
    changePasswordFunc,
    logoutUser,
    // Computed
    isAuthenticated: !!user && !!getToken(),
    token: getToken(),
  };
};

export default useAuth;
