import { v2 as cloudinary } from 'cloudinary';

/**
 * Upload a Buffer to Cloudinary and return the secure_url.
 * @param {Buffer} buffer
 * @param {{ folder?: string, public_id?: string, transformation?: object[] }} options
 * @returns {Promise<string>} secure_url
 */
const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type:  'image',
        folder:         options.folder         || 'hms/avatars',
        public_id:      options.public_id,
        transformation: options.transformation || [
          { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

export default uploadBufferToCloudinary;
