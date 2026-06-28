/**
 * File Upload Service
 * Unified service for uploading files to Cloudinary
 * Handles images, documents, and videos with validation and error handling
 */

import axiosInstance from '../api/axiosInstance';
import { CLOUDINARY_CONFIG, UPLOAD_OPTIONS, FILE_TYPE_RESTRICTIONS, buildCloudinaryUrl } from '../utils/cloudinaryConfig';

/**
 * Upload file to Cloudinary using FormData
 * @param {File} file - File to upload
 * @param {string} uploadType - Type of upload (images, documents, videos, etc.)
 * @param {object} options - Additional upload options
 * @returns {Promise<object>} Upload result with URL and metadata
 */
export const uploadToCloudinary = async (file, uploadType = 'images', options = {}) => {
  try {
    // Validate file
    const validation = validateFile(file, uploadType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    // Get upload options based on type
    const uploadOpts = UPLOAD_OPTIONS[uploadType] || UPLOAD_OPTIONS.images;

    // Add folder
    formData.append('folder', uploadOpts.folder);

    // Add tags
    if (uploadOpts.tags) {
      formData.append('tags', uploadOpts.tags.join(','));
    }

    // Add context (for metadata)
    const context = {
      alt: file.name.split('.')[0],
      caption: options.caption || file.name,
      ...options.metadata,
    };
    formData.append('context', JSON.stringify(context));

    // Add custom data for retrieval
    const publicId = options.publicId || `${Date.now()}_${file.name.split('.')[0]}`;
    formData.append('public_id', publicId);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Return formatted response
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      size: data.bytes,
      format: data.format,
      duration: data.duration, // For videos
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        uploadType,
      },
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {string} uploadType - Type of upload
 * @returns {Promise<object>} Array of upload results
 */
export const uploadMultipleFiles = async (files, uploadType = 'images') => {
  try {
    if (!Array.isArray(files)) {
      throw new Error('Files must be an array');
    }

    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, uploadType)
    );

    const results = await Promise.all(uploadPromises);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      success: failed.length === 0,
      uploaded: successful.map(r => ({
        url: r.url,
        publicId: r.publicId,
        metadata: r.metadata,
      })),
      failed: failed.map((r, index) => ({
        file: files[index].name,
        error: r.error,
      })),
      summary: {
        total: files.length,
        successful: successful.length,
        failed: failed.length,
      },
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: error.message,
      uploaded: [],
      failed: files.map(f => ({ file: f.name, error: error.message })),
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @returns {Promise<object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Note: Direct API deletion from client is not recommended
    // This should be done from backend for security
    console.warn('Deletion should be done from backend for security');
    
    // Call backend endpoint to delete
    const response = await axiosInstance.post('/upload/delete', {
      publicId,
    });

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get optimized image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {object} transformations - Transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  if (!publicId) return '';

  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  };

  return buildCloudinaryUrl(publicId, defaultTransformations);
};

/**
 * Get thumbnail URL for image
 * @param {string} publicId - Public ID of the image
 * @param {number} size - Thumbnail size (default: 150)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (publicId, size = 150) => {
  if (!publicId) return '';
  
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

/**
 * Get responsive image URLs for different breakpoints
 * @param {string} publicId - Public ID of the image
 * @returns {object} Object with URLs for different sizes
 */
export const getResponsiveImageUrls = (publicId) => {
  if (!publicId) return {};

  return {
    mobile: getOptimizedImageUrl(publicId, { width: 400, height: 400, crop: 'fill' }),
    tablet: getOptimizedImageUrl(publicId, { width: 600, height: 600, crop: 'fill' }),
    desktop: getOptimizedImageUrl(publicId, { width: 800, height: 800, crop: 'fill' }),
    full: getOptimizedImageUrl(publicId, { width: 1200, height: 1200, crop: 'fill' }),
  };
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {string} uploadType - Type of upload
 * @returns {object} Validation result
 */
export const validateFile = (file, uploadType = 'images') => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const restrictions = FILE_TYPE_RESTRICTIONS[uploadType];
  
  if (!restrictions) {
    return { valid: false, error: `Unknown upload type: ${uploadType}` };
  }

  // Check file type
  if (!restrictions.allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${restrictions.extensions.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > restrictions.maxSize) {
    const maxSizeMB = (restrictions.maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
};

/**
 * Generate image srcset for responsive images
 * @param {string} publicId - Public ID of the image
 * @returns {string} srcset string for img tag
 */
export const generateImageSrcSet = (publicId) => {
  if (!publicId) return '';

  const sizes = [400, 600, 800, 1000, 1200];
  return sizes
    .map(size => 
      `${getOptimizedImageUrl(publicId, { width: size, height: size, crop: 'fill' })} ${size}w`
    )
    .join(', ');
};

/**
 * Get aspect ratio maintained image URL
 * @param {string} publicId - Public ID of the image
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @returns {string} Image URL with aspect ratio maintained
 */
export const getAspectRatioUrl = (publicId, width, height) => {
  if (!publicId) return '';

  return getOptimizedImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto',
  });
};

export default {
  uploadToCloudinary,
  uploadMultipleFiles,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getResponsiveImageUrls,
  validateFile,
  generateImageSrcSet,
  getAspectRatioUrl,
};
