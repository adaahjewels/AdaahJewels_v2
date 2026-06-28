/**
 * useFileUpload Hook
 * React hook for file uploads with progress tracking and error handling
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  uploadToCloudinary,
  uploadMultipleFiles,
  validateFile,
} from '../services/fileUploadService';

/**
 * Custom hook for file uploads
 * @param {object} options - Upload options
 * @returns {object} Upload handler and state
 */
export const useFileUpload = (options = {}) => {
  const {
    uploadType = 'images',
    onSuccess = null,
    onError = null,
    maxFiles = 1,
    autoRetry = true,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Handle single file upload
   */
  const uploadFile = useCallback(
    async (file, metadata = {}) => {
      try {
        // Validate file
        const validation = validateFile(file, uploadType);
        if (!validation.valid) {
          setError(validation.error);
          toast.error(validation.error);
          onError?.(validation.error);
          return null;
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        // Upload file
        const result = await uploadToCloudinary(file, uploadType, metadata);

        clearInterval(progressInterval);

        if (!result.success) {
          throw new Error(result.error);
        }

        setProgress(100);
        setFiles(prev => [...prev, result]);

        // Success notification
        toast.success('File uploaded successfully');
        onSuccess?.(result);

        return result;
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        onError?.(err);
        return null;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadType, onSuccess, onError]
  );

  /**
   * Handle multiple file uploads
   */
  const uploadFiles = useCallback(
    async (fileList, metadata = {}) => {
      try {
        if (fileList.length > maxFiles) {
          const error = `Maximum ${maxFiles} file(s) allowed`;
          setError(error);
          toast.error(error);
          onError?.(error);
          return null;
        }

        setUploading(true);
        setProgress(0);
        setError(null);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 5, 90));
        }, 100);

        // Upload all files
        const results = await uploadMultipleFiles(fileList, uploadType);

        clearInterval(progressInterval);

        if (!results.success && results.failed.length > 0) {
          const errorMessage = `${results.failed.length} file(s) failed to upload`;
          setError(errorMessage);
          toast.error(errorMessage);
          onError?.(errorMessage);
        }

        if (results.uploaded.length > 0) {
          setProgress(100);
          setFiles(prev => [...prev, ...results.uploaded]);
          toast.success(`${results.uploaded.length} file(s) uploaded successfully`);
          onSuccess?.(results.uploaded);
        }

        return results;
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
        onError?.(err);
        return null;
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadType, maxFiles, onSuccess, onError]
  );

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    async (event) => {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      if (maxFiles === 1) {
        await uploadFile(fileList[0]);
      } else {
        await uploadFiles(Array.from(fileList));
      }

      // Reset input
      event.target.value = '';
    },
    [uploadFile, uploadFiles, maxFiles]
  );

  /**
   * Remove uploaded file
   */
  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  }, []);

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    uploading,
    progress,
    files,
    error,
    uploadFile,
    uploadFiles,
    handleFileInputChange,
    removeFile,
    clearFiles,
  };
};

export default useFileUpload;
