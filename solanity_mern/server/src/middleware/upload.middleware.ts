import multer from 'multer';

// In-memory storage: the buffer is streamed to Cloudinary manually in the
// service layer (see utils/cloudinaryUpload.ts) instead of via a storage
// engine, so we don't pin to Cloudinary v1 through multer-storage-cloudinary.
const storage = multer.memoryStorage();

export const uploadPostMedia = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — covers images and short video clips
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('image') || file.mimetype.startsWith('video') || file.mimetype === 'application/pdf';
    if (ok) cb(null, true);
    else cb(new Error('Only image/video/pdf files are allowed'));
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype.startsWith('image');
    if (ok) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});
