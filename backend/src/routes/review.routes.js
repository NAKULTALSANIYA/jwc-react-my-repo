import express from 'express';
import ReviewController from '../controllers/review.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Customer routes - Review management
router.post('/', authenticate, ReviewController.createReview);
router.get('/my-reviews', authenticate, ReviewController.getReviewsByUserId);
router.get('/eligible-orders', authenticate, ReviewController.getOrdersEligibleForReview);
router.get('/product/:productId', ReviewController.getReviewsByProductId);
router.get('/:reviewId', authenticate, ReviewController.getReviewById);
router.patch('/:reviewId', authenticate, ReviewController.updateReview);
router.delete('/:reviewId', authenticate, ReviewController.deleteReview);
router.post('/:reviewId/helpful', authenticate, ReviewController.toggleHelpfulVote);

// Admin routes - Review moderation
router.get('/admin/pending', authenticate, isManager, ReviewController.getPendingReviews);
router.get('/admin/flagged', authenticate, isManager, ReviewController.getFlaggedReviews);
router.patch('/admin/:reviewId/approve', authenticate, isManager, ReviewController.approveReview);
router.patch('/admin/:reviewId/reject', authenticate, isManager, ReviewController.rejectReview);
router.post('/admin/:reviewId/response', authenticate, isManager, ReviewController.addAdminResponse);
router.get('/admin/trends', authenticate, isManager, ReviewController.getReviewTrends);

export default router;
