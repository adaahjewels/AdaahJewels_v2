import authAxiosInstance from './authAxiosInstance';

/**
 * Token storage using localStorage for persistence across browser closes
 * localStorage survives browser restart (user stays logged in)
 * On XSS attack, attacker can read localStorage, but API token has expiry
 */
let _accessToken = (() => {
  // Try to restore token from localStorage on module load (persists across sessions)
  try {
    const stored = localStorage.getItem('authToken');
    return stored ? stored : null;
  } catch (_) {
    return null;
  }
})();

export const setAccessToken = (token) => {
  _accessToken = token;
  // Persist to localStorage (survives browser restart)
  try {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  } catch (_) {}
};

export const getAuthToken = () => _accessToken;

export const isAuthenticated = () => !!_accessToken;

/**
 * Persist non-sensitive user profile to localStorage only (not token).
 */
const persistUser = (user) => {
  try { localStorage.setItem('user', JSON.stringify(user)); } catch (_) {}
};

const clearUser = () => {
  try { localStorage.removeItem('user'); } catch (_) {}
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

/** Register new user */
export const registerUser = async (email, password, phoneNumber, firstName, lastName = '') => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_REGISTER_ENDPOINT,
    { email, password, phoneNumber, firstName, lastName }
  );

  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) persistUser(user);
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to register');
};

/** Login with email/mobile and password */
export const loginUser = async (emailOrMobile, password) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_LOGIN_ENDPOINT,
    { emailOrMobile, password }
  );

  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) persistUser(user);
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to login');
};

/** Send email verification OTP */
export const sendOtp = async (email) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_SEND_OTP_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to send OTP');
};

/** Resend OTP */
export const resendOtp = async (email) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_RESEND_OTP_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to resend OTP');
};

/** Verify email OTP */
export const verifyEmailOtp = async (email, otp) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_VERIFY_EMAIL_OTP_ENDPOINT,
    { email, otp }
  );
  if (response.data?.status === true) {
    const { token, user } = response.data.data;
    if (token) setAccessToken(token);
    if (user) persistUser(user);
    return response.data;
  }
  throw new Error(response.data?.message || 'Failed to verify OTP');
};

/** Send password reset OTP */
export const sendPasswordResetOtp = async (email) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_FORGOT_PASSWORD_ENDPOINT,
    { email }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to send reset OTP');
};

/** Verify password reset OTP */
export const verifyPasswordResetOtp = async (email, otp) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_VERIFY_RESET_OTP_ENDPOINT,
    { email, otp }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to verify OTP');
};

/** Reset password */
export const resetPassword = async (email, newPassword) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_RESET_PASSWORD_ENDPOINT,
    { email, newPassword }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to reset password');
};

/** Change password (authenticated) */
export const changePassword = async (oldPassword, newPassword) => {
  const response = await authAxiosInstance.post(
    import.meta.env.VITE_CHANGE_PASSWORD_ENDPOINT,
    { oldPassword, newPassword }
  );
  if (response.data?.status === true) return response.data;
  throw new Error(response.data?.message || 'Failed to change password');
};

/** Logout — clear token and user data from localStorage */
export const logout = () => {
  setAccessToken(null); // Clears token from memory and localStorage
  clearUser(); // Clears user data from localStorage
};

export default {
  registerUser, loginUser, sendOtp, resendOtp, verifyEmailOtp,
  sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword,
  changePassword, logout, getCurrentUser, getAuthToken, isAuthenticated,
};
