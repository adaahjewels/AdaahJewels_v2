import { useEffect, useRef, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';
import { CLOUDINARY_CONFIG, UPLOAD_FOLDERS } from '../../../utils/cloudinaryConfig';

/**
 * FileUpload - Cloudinary Upload Widget wrapper
 * Props:
 *   value       - current image URL string
 *   onChange    - callback(url: string)
 *   folder      - upload folder key from UPLOAD_FOLDERS (default: 'product')
 *   label       - field label
 *   error       - validation error string
 *   required    - bool
 *   multiple    - bool (allows multiple uploads, onChange called per file)
 */
export const FileUpload = ({
  value,
  onChange,
  folder = 'product',
  label,
  error,
  required = false,
  multiple = false,
}) => {
  const widgetRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const folderPath = UPLOAD_FOLDERS[folder] || UPLOAD_FOLDERS.product;

  // Load Cloudinary Upload Widget script once
  useEffect(() => {
    if (window.cloudinary) return;
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openWidget = () => {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      alert(
        'Cloudinary is not configured.\n\n' +
        'Steps to fix:\n' +
        '1. Go to cloudinary.com → Settings → Upload\n' +
        '2. Add an Upload Preset (set to "Unsigned" mode)\n' +
        '3. Add to mystic-jewel/.env:\n' +
        '   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name\n\n' +
        'Or paste an image URL directly in the URL field below.'
      );
      return;
    }

    if (!window.cloudinary) {
      alert('Cloudinary widget is still loading, please try again.');
      return;
    }

    setUploading(true);

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: folderPath,
        multiple,
        maxFiles: multiple ? 5 : 1,
        resourceType: 'image',
        cropping: false,
        showAdvancedOptions: false,
        sources: ['local', 'url', 'camera'],
        styles: { palette: { action: '#2563EB', window: '#FFFFFF' } },
      },
      (error, result) => {
        if (error) {
          setUploading(false);
          console.error('Cloudinary upload error:', error);
          return;
        }
        if (result.event === 'success') {
          onChange(result.info.secure_url);
        }
        if (result.event === 'close') {
          setUploading(false);
        }
      }
    );

    widgetRef.current.open();
  };

  const clearImage = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Upload button */}
        <button
          type="button"
          onClick={openWidget}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-50 min-w-[140px]"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Image'}</span>
        </button>

        {/* Preview */}
        {value && (
          <div className="relative group">
            <img
              src={value}
              alt="preview"
              className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Error'; }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Empty state */}
        {!value && (
          <div className="h-16 w-16 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <Image className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* URL fallback input */}
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL directly"
        className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
