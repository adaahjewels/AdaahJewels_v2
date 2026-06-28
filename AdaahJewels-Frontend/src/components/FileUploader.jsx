/**
 * FileUploader Component - Simplified Version for Cloudinary
 * Reusable component with direct Cloudinary integration
 */

import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Simplified FileUploader Component
 * @param {object} props - Component props
 * @param {string} props.uploadType - Type of upload ('images', 'documents', 'videos')
 * @param {number} props.maxFiles - Maximum number of files
 * @param {function} props.onSuccess - Callback on successful upload
 * @param {function} props.onError - Callback on error
 * @param {string} props.className - Additional CSS classes
 */
const FileUploader = ({
  uploadType = 'images',
  maxFiles = 1,
  onSuccess = () => {},
  onError = () => {},
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Get Cloudinary config from env
  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Validate config before attempting upload
  // Both Cloud Name and Upload Preset must be set and not be empty
  const isConfigured = !!(
    cloudinaryCloudName &&
    uploadPreset &&
    cloudinaryCloudName.trim() &&
    uploadPreset.trim()
  );

  // Determine accepted file types
  const getAcceptedTypes = () => {
    switch (uploadType) {
      case 'images':
        return 'image/jpeg,image/png,image/webp,image/gif';
      case 'videos':
        return 'video/mp4,video/avi,video/quicktime';
      case 'documents':
        return '.pdf,.doc,.docx';
      default:
        return '*';
    }
  };

  const validateFile = (file) => {
    const maxSizes = {
      images: 5 * 1024 * 1024, // 5MB
      videos: 100 * 1024 * 1024, // 100MB
      documents: 10 * 1024 * 1024, // 10MB
    };

    const maxSize = maxSizes[uploadType] || 5 * 1024 * 1024;

    if (file.size > maxSize) {
      const sizeMB = (maxSize / 1024 / 1024).toFixed(1);
      return { valid: false, error: `File size exceeds ${sizeMB}MB limit` };
    }

    return { valid: true };
  };

  const uploadToCloudinary = async (file) => {
    try {
      const validation = validateFile(file);
      if (!validation.valid) throw new Error(validation.error);

      if (!isConfigured) {
        setError('Cloudinary upload preset not configured. Go to Cloudinary Dashboard → Settings → Upload → Add upload preset (unsigned mode), then set VITE_CLOUDINARY_UPLOAD_PRESET in .env');
        toast.error('Upload not configured. See console for details.');
        return null;
      }

      setUploading(true);
      setProgress(10);
      setError(null);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudinaryCloudName);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific Cloudinary errors
        if (data.error?.message === 'Upload preset not found') {
          const setupError = `❌ Upload preset not found!\n\nSetup required:\n1. Go to: https://cloudinary.com/console/settings/upload\n2. Click "Add upload preset"\n3. Name: mystic_jewel_unsigned\n4. Mode: Unsigned\n5. Save\n6. Restart frontend (npm run dev)`;
          setError(setupError);
          toast.error('Cloudinary preset not found. Check browser console for setup steps.');
          return null;
        } else if (data.error?.message === 'Invalid upload preset') {
          throw new Error('Invalid upload preset. Check that the preset name matches exactly in .env and Cloudinary dashboard.');
        } else {
          throw new Error(`Upload failed: ${data.error?.message || response.statusText}`);
        }
      }

      const uploadedFile = {
        url: data.secure_url,
        publicId: data.public_id,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setProgress(100);
      toast.success('File uploaded successfully!');
      onSuccess(uploadedFile);

      return uploadedFile;
    } catch (err) {
      const errorMessage = err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      onError(err);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Check file count limit
    if (files.length > maxFiles) {
      const errorMsg = `Maximum ${maxFiles} file(s) allowed`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Upload files
    for (const file of files) {
      await uploadToCloudinary(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const getDescription = () => {
    switch (uploadType) {
      case 'images':
        return 'JPG, PNG, WebP, GIF (Max 5MB)';
      case 'videos':
        return 'MP4, AVI, MOV (Max 100MB)';
      case 'documents':
        return 'PDF, DOC, DOCX (Max 10MB)';
      default:
        return 'Any file type';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
          accept={getAcceptedTypes()}
        />

        <div className="flex flex-col items-center justify-center">
          {uploading && progress > 0 ? (
            <>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-700 font-medium">Uploading... {progress}%</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-700 font-medium mb-1">Drag and drop your files here</p>
              <p className="text-sm text-gray-500">or click to select files</p>
              <p className="text-xs text-gray-500 mt-2">{getDescription()}</p>
              {maxFiles > 1 && (
                <p className="text-xs text-gray-500 mt-1">Max {maxFiles} files</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
