import express from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Payment verification and management
router.post('/verify', PaymentController.verifyPayment);
router.get('/:paymentId', authenticate, PaymentController.getPaymentById);
router.get('/order/:orderId', authenticate, PaymentController.getPaymentByOrderId);
router.post('/refund/:orderId', authenticate, PaymentController.initiateRefund);

// Admin routes - Payment analytics
router.get('/admin/stats', authenticate, isManager, PaymentController.getPaymentStats);
router.get('/admin/revenue-monthly', authenticate, isManager, PaymentController.getRevenueByMonth);
router.get('/admin/payment-methods', authenticate, isManager, PaymentController.getPaymentMethodStats);

// Webhook endpoint (no auth required)
router.post('/webhook', PaymentController.processWebhook);

export default router;
