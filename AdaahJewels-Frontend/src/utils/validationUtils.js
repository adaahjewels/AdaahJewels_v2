/**
 * Validation Utilities
 * Client-side form validation functions
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate password strength
 * Requirements:
 * - Min 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*)
 */
export const validatePassword = (password) => {
  if (!password) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  const minLength = password.length >= 8;

  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar && minLength;
};

/**
 * Get password strength level
 * Returns: 'weak', 'fair', 'good', 'strong'
 */
export const getPasswordStrength = (password) => {
  if (!password) return 'weak';

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  // Return strength based on score
  if (score <= 2) return 'weak';
  if (score <= 4) return 'fair';
  if (score <= 6) return 'good';
  return 'strong';
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'good':
      return 'bg-blue-500';
    case 'strong':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

/**
 * Get password strength color for text
 */
export const getPasswordStrengthTextColor = (strength) => {
  switch (strength) {
    case 'weak':
      return 'text-red-600';
    case 'fair':
      return 'text-yellow-600';
    case 'good':
      return 'text-blue-600';
    case 'strong':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Validate mobile number (Indian format)
 * Must be 10 digits starting with 6, 7, 8, or 9
 */
export const validateMobileNumber = (mobile) => {
  if (!mobile) return false;
  
  // Remove any non-digit characters
  const cleaned = mobile.replace(/\D/g, '');
  
  // Check format: 10 digits, starts with 6-9
  const regex = /^[6-9]\d{9}$/;
  return regex.test(cleaned);
};

/**
 * Check if passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) return false;
  return password === confirmPassword;
};

/**
 * Validate entire registration form
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // First name validation
  if (!formData.firstName?.trim()) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (formData.firstName.trim().length > 50) {
    errors.firstName = 'First name must not exceed 50 characters';
  }

  // Last name validation (optional but validate if provided)
  if (formData.lastName && formData.lastName.trim().length > 50) {
    errors.lastName = 'Last name must not exceed 50 characters';
  }

  // Mobile validation
  if (!formData.phoneNumber?.trim()) {
    errors.phoneNumber = 'Mobile number is required';
  } else if (!validateMobileNumber(formData.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid 10-digit mobile number (6-9)';
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (!@#$%^&*)';
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (!passwordsMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (emailOrMobile, password) => {
  const errors = {};

  if (!emailOrMobile?.trim()) {
    errors.emailOrMobile = 'Email or mobile number is required';
  } else if (
    !validateEmail(emailOrMobile) &&
    !validateMobileNumber(emailOrMobile)
  ) {
    errors.emailOrMobile = 'Please enter a valid email or mobile number';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Validate password reset form
 */
export const validatePasswordResetForm = (password, confirmPassword) => {
  const errors = {};

  if (!password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(password)) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (!@#$%^&*)';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (!passwordsMatch(password, confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validate change password form
 */
export const validateChangePasswordForm = (oldPassword, newPassword, confirmPassword) => {
  const errors = {};

  if (!oldPassword) {
    errors.oldPassword = 'Current password is required';
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required';
  } else if (!validatePassword(newPassword)) {
    errors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (!@#$%^&*)';
  }

  if (oldPassword && newPassword && oldPassword === newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (!passwordsMatch(newPassword, confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validate OTP
 * Must be 6 digits
 */
export const validateOTP = (otp) => {
  if (!otp) return false;
  return /^\d{6}$/.test(otp);
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Clear specific error
 */
export const clearError = (errors, field) => {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
};
