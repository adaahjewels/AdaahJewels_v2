/**
 * ImageUploadField.jsx
 *
 * Reusable image field for admin forms.
 * Supports:
 *   1. Direct file upload → POST /api/upload/image (server-side Cloudinary)
 *   2. Fallback unsigned Cloudinary upload (if VITE_CLOUDINARY_CLOUD_NAME is set)
 *   3. Manual URL paste
 *
 * Props:
 *   label      – field label (string)
 *   value      – current URL string
 *   onChange   – (url: string) => void
 *   required   – bool
 *   error      – error message string
 *   previewClass – extra tailwind classes for the preview img
 */
import { useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon, Loader } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET     = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const ImageUploadField = ({
  label = 'Image',
  value = '',
  onChange,
  required = false,
  error,
  previewClass = 'w-full h-32',
}) => {
  const fileRef     = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput,  setUrlInput]  = useState('');
  const [mode,      setMode]      = useState('file'); // 'file' | 'url'
  const [uploadErr, setUploadErr] = useState('');

  /* ── Upload via backend /api/upload/image ─────────────────── */
  const uploadViaBackend = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await axiosInstance.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  };

  /* ── Upload directly to Cloudinary (unsigned preset) ─────── */
  const uploadDirectToCloudinary = async (file) => {
    if (!CLOUD_NAME || !PRESET) throw new Error('Cloudinary not configured');
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', PRESET);
    form.append('folder', 'adaah-jewels');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST', body: form,
    });
    if (!res.ok) throw new Error('Cloudinary upload failed');
    const json = await res.json();
    return json.secure_url;
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('File must be under 5 MB');
      return;
    }
    if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) {
      setUploadErr('Only JPEG, PNG, WebP or GIF allowed');
      return;
    }
    setUploading(true);
    setUploadErr('');
    try {
      // Try backend first; fall back to direct Cloudinary
      let url;
      try { url = await uploadViaBackend(file); }
      catch { url = await uploadDirectToCloudinary(file); }
      onChange(url);
    } catch (err) {
      setUploadErr(err.message || 'Upload failed — please try a URL instead');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    const u = urlInput.trim();
    if (!u) return;
    onChange(u);
    setUrlInput('');
  };

  return (
    <div>
      {/* Label + mode toggle */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('file')}
            title="Upload file"
            className={`p-1.5 rounded-lg text-xs transition-colors ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            title="Paste URL"
            className={`p-1.5 rounded-lg text-xs transition-colors ${mode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* File upload mode */}
      {mode === 'file' && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
            uploading
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to upload or drag &amp; drop
              </p>
              <p className="text-[10px] text-gray-400">JPEG, PNG, WebP, GIF · max 5 MB</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      )}

      {/* URL input mode */}
      {mode === 'url' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleUrlSubmit())}
            placeholder="https://…"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
          >
            Use
          </button>
        </div>
      )}

      {/* Upload error */}
      {uploadErr && (
        <p className="text-red-500 text-xs mt-1">{uploadErr}</p>
      )}
      {/* Validation error from parent */}
      {error && !uploadErr && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      {/* Preview + clear */}
      {value && (
        <div className="mt-2 relative group">
          <img
            src={value}
            alt="preview"
            className={`${previewClass} object-cover rounded-lg border border-gray-200 dark:border-gray-600`}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
