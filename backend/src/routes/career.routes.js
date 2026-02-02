import express from 'express';
import CareerController from '../controllers/career.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isManager } from '../middlewares/role.js';
import resumeUpload from '../middlewares/resumeUpload.js';

const router = express.Router();

// Public
router.post('/', resumeUpload.single('resume'), CareerController.submitCareer);

// Admin (order matters: stats before :id)
router.get('/stats', authenticate, isManager, CareerController.getCareerStats);
router.get('/', authenticate, isManager, CareerController.getAllCareers);
router.get('/:id', authenticate, isManager, CareerController.getCareerById);
router.patch('/:id/approve', authenticate, isManager, CareerController.approveCareer);
router.patch('/:id/reject', authenticate, isManager, CareerController.rejectCareer);

export default router;
