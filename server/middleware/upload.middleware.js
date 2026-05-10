import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

const documentFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only images and PDFs are allowed'), false);
  }
};

// Wrap multer so its errors flow into the Express error handler
const wrapMulter = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    // multer-specific errors (e.g. file too large)
    next(new ApiError(400, err.message));
  });
};

export const uploadImage = wrapMulter(
  multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('image')
);

export const uploadDocument = wrapMulter(
  multer({ storage, fileFilter: documentFilter, limits: { fileSize: 20 * 1024 * 1024 } }).single('document')
);
