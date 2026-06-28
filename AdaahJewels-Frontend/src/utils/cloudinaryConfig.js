/**
 * Cloudinary Configuration
 * Uses Cloudinary Upload Widget (unsigned uploads via upload preset)
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
};

// Folder per upload context
export const UPLOAD_FOLDERS = {
  product: 'adaah-jewels/products',
  category: 'adaah-jewels/categories',
  banner: 'adaah-Jewels/banners',
  mobileBanner: 'adaah-jewels/banners/mobile',
  testimonial: 'adaah-jewels/testimonials',
  avatar: 'adaah-jewels/avatars',
};

export default CLOUDINARY_CONFIG;
