import express from 'express';
import OrderController from '../controllers/order.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// NEW PAYMENT FLOW: Create Razorpay order first, then verify and create DB order
router.get('/shipping-cost', OrderController.getShippingCost);
router.post('/payment/create-razorpay-order', authenticate, OrderController.createRazorpayOrder);
router.post('/payment/verify-and-create', authenticate, OrderController.verifyPaymentAndCreateOrder);

// Customer routes - Order management
router.post('/', authenticate, OrderController.createOrder);
router.get('/my-orders', authenticate, OrderController.getOrdersByUserId);
router.get('/my-stats', authenticate, OrderController.getCustomerOrderStats);
router.get('/:orderId', authenticate, OrderController.getOrderById);
router.get('/number/:orderNumber', authenticate, OrderController.getOrderByOrderNumber);
router.patch('/:orderId/cancel', authenticate, OrderController.cancelOrder);

// Admin routes - Order management
router.get('/admin/orders', authenticate, isManager, OrderController.getOrdersForAdmin);
router.get('/admin/stats', authenticate, isManager, OrderController.getOrderStats);
router.get('/admin/top-selling', authenticate, isManager, OrderController.getTopSellingProducts);
router.get('/admin/revenue-monthly', authenticate, isManager, OrderController.getRevenueByMonth);
router.get('/admin/recent', authenticate, isManager, OrderController.getRecentOrders);
router.patch('/admin/:orderId/status', authenticate, isManager, OrderController.updateOrderStatus);

export default router;
