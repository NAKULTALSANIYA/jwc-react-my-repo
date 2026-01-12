import cloudinary from '../config/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class UploadController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No image file provided');
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'jwc-products',
            resource_type: 'image',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      return ApiResponse.success(res, 'Image uploaded successfully', {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadMultipleImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'No image files provided');
      }

      const uploadPromises = req.files.map(file => 
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'jwc-products',
              resource_type: 'image',
              transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height
              });
            }
          );

          uploadStream.end(file.buffer);
        })
      );

      const results = await Promise.all(uploadPromises);

      return ApiResponse.success(res, 'Images uploaded successfully', { images: results });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { publicId } = req.body;

      if (!publicId) {
        throw new ApiError(400, 'Public ID is required');
      }

      await cloudinary.uploader.destroy(publicId);

      return ApiResponse.success(res, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
