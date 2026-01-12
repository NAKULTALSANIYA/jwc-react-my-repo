import express from 'express';
import uploadController from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';

const router = express.Router();

// Admin routes - require authentication and admin role
router.post(
  '/image',
  authenticate,
  authorize('admin'),
  upload.single('image'),
  uploadController.uploadImage
);

router.post(
  '/images',
  authenticate,
  authorize('admin'),
  upload.array('images', 10), // Max 10 images
  uploadController.uploadMultipleImages
);

router.delete(
  '/image',
  authenticate,
  authorize('admin'),
  uploadController.deleteImage
);

export default router;
