/**
 * Formatter Utilities
 * Format and sanitize user input
 */

/**
 * Format mobile number for display
 * Input: "9876543210"
 * Output: "9876 543 210"
 */
export const formatMobileNumber = (value) => {
  if (!value) return '';

  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);

  // Format as XXXX XXX XXX
  if (limited.length <= 4) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 4)} ${limited.slice(4)}`;
  } else {
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`;
  }
};

/**
 * Get clean mobile number (digits only)
 */
export const getCleanMobileNumber = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Format OTP input
 * Ensures only digits, max 6
 */
export const formatOTP = (value) => {
  if (!value) return '';
  
  // Remove non-digits
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 6 digits
  return cleaned.slice(0, 6);
};

/**
 * Sanitize email input
 * Trim and lowercase
 */
export const sanitizeEmail = (value) => {
  return value.trim().toLowerCase();
};

/**
 * Sanitize name input
 * Trim and capitalize first letter of each word
 */
export const sanitizeName = (value) => {
  return value
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Remove special characters from input
 */
export const removeSpecialChars = (value) => {
  return value.replace(/[^a-zA-Z0-9\s-]/g, '');
};

/**
 * Limit text length
 */
export const limitLength = (value, maxLength) => {
  return value.slice(0, maxLength);
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format time
 */
export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Format phone number for display with country code
 */
export const formatPhoneWithCountryCode = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length !== 10) return phoneNumber;
  return `+91 ${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
};

/**
 * Get relative time (e.g., "2 minutes ago")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(date);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert seconds to MM:SS format
 */
export const formatSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
