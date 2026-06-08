import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

const getCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_URL) {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    };
  }

  try {
    const parsedUrl = new URL(process.env.CLOUDINARY_URL);
    return {
      cloud_name: parsedUrl.hostname,
      api_key: decodeURIComponent(parsedUrl.username),
      api_secret: decodeURIComponent(parsedUrl.password),
      secure: parsedUrl.searchParams.get('secure') !== 'false',
    };
  } catch (err) {
    logger.warn(`Invalid CLOUDINARY_URL: ${err.message}`);
    return { secure: true };
  }
};

cloudinary.config(getCloudinaryConfig());

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

export const uploadImageBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', ...options },
      (err, result) => {
        if (err) {
          logger.error(`Cloudinary image upload failed: ${err.message}`);
          return reject(err);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

export const deleteImage = (publicId, options = {}) =>
  cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
    ...options,
  });

export default cloudinary;
