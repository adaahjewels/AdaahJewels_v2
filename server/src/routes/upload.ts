import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
    }
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── POST /api/upload/image ─────────────────────────────────────────────────
// authenticate is intentionally optional here so frontend direct-upload
// can also call this endpoint. Remove `authenticate` if you want fully public.
router.post('/image', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      return res.status(503).json({
        message: 'Image upload is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in server/.env',
      });
    }

    const streamUpload = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder:        process.env.CLOUDINARY_FOLDER || 'adaah-jewels',
            resource_type: 'image',
            overwrite:     false,
            // Auto-generate a unique public_id
            use_filename:  false,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });
    };

    const result = await streamUpload();
    res.json({
      success:  true,
      url:      result.secure_url,
      publicId: result.public_id,
      width:    result.width,
      height:   result.height,
      format:   result.format,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
});

// ── DELETE /api/upload/image/:publicId ────────────────────────────────────
router.delete('/image/:publicId(*)', authenticate, async (req, res) => {
  try {
    // publicId may contain slashes (folder/filename), so we use (*) capture
    const publicId = req.params.publicId;
    const result: any = await cloudinary.uploader.destroy(publicId);
    res.json({ success: result.result === 'ok', message: 'Image deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Image delete failed' });
  }
});

export default router;
