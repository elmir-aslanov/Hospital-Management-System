import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const wrapMulter = (upload, options = {}) => (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    if (err instanceof ApiError) return next(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, options.fileSizeMessage || err.message));
    }
    next(new ApiError(400, err.message));
  });
};

const imageFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new ApiError(400, 'Only image files are allowed'), false);
};

const doctorImageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, 'Yalnız JPG, PNG və WebP formatları dəstəklənir.'), false);
};

const documentFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, 'Only images and PDFs are allowed'), false);
};

const avatarFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, 'Avatar must be JPEG, PNG, or WebP'), false);
};

export const uploadImage = wrapMulter(
  multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }).single('image'),
  { fileSizeMessage: 'Image file cannot be larger than 5MB' }
);

export const uploadDoctorImage = wrapMulter(
  multer({ storage, fileFilter: doctorImageFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single('image'),
  { fileSizeMessage: 'Şəkil ölçüsü 2MB-dan böyük ola bilməz.' }
);

export const uploadDocument = wrapMulter(
  multer({ storage, fileFilter: documentFilter, limits: { fileSize: 20 * 1024 * 1024 } }).single('document'),
  { fileSizeMessage: 'Document file cannot be larger than 20MB' }
);

export const uploadAvatar = wrapMulter(
  multer({ storage, fileFilter: avatarFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single('avatar'),
  { fileSizeMessage: 'Avatar file cannot be larger than 2MB' }
);
