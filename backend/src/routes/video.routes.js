import express from 'express';
import * as videoController from '../controllers/video.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/role.js';

const router = express.Router();

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), videoController.addVideo);
router.put('/:id', authenticate, authorize('admin'), videoController.updateVideo);
router.delete('/:id', authenticate, authorize('admin'), videoController.deleteVideo);

export default router;