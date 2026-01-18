import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UploadController {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        throw new ApiError(400, 'No image file provided');
      }

      // Generate URL for the uploaded file
      const url = `${env.BACKEND_URL}/uploads/${req.file.filename}`;

      return ApiResponse.success(res, 'Image uploaded successfully', {
        url: url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
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

      const results = req.files.map(file => ({
        url: `${env.BACKEND_URL}/uploads/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));

      return ApiResponse.success(res, 'Images uploaded successfully', { images: results });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      const { filename } = req.body;

      if (!filename) {
        throw new ApiError(400, 'Filename is required');
      }

      const filePath = path.join(__dirname, '../../uploads', filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'File not found');
      }

      // Delete the file
      fs.unlinkSync(filePath);

      return ApiResponse.success(res, 'Image deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
