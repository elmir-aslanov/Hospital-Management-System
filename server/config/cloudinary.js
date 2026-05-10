import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 * @param {Buffer} buffer
 * @param {object} options - Cloudinary upload options (folder, resource_type, etc.)
 * @returns {Promise<string>} secure_url
 */
export const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) {
        logger.error(`Cloudinary upload failed: ${err.message}`);
        return reject(err);
      }
      resolve(result.secure_url);
    });
    uploadStream.end(buffer);
  });

export default cloudinary;
