import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Admin dashboard routes - All require authentication and manager/admin role
router.get('/overview', authenticate, isManager, DashboardController.getOverviewStats);
router.get('/revenue', authenticate, isManager, DashboardController.getRevenueByPeriod);
router.get('/top-products', authenticate, isManager, DashboardController.getTopSellingProducts);
router.get('/low-stock', authenticate, isManager, DashboardController.getLowStockProducts);
router.get('/recent-orders', authenticate, isManager, DashboardController.getRecentOrders);
router.get('/recent-customers', authenticate, isManager, DashboardController.getRecentCustomers);
router.get('/customer-growth', authenticate, isManager, DashboardController.getCustomerGrowth);
router.get('/category-performance', authenticate, isManager, DashboardController.getCategoryPerformance);
router.get('/payment-stats', authenticate, isManager, DashboardController.getPaymentStats);
router.get('/reviews-stats', authenticate, isManager, DashboardController.getReviewsStats);
router.get('/inventory-stats', authenticate, isManager, DashboardController.getInventoryStats);
router.get('/summary', authenticate, isManager, DashboardController.getDashboardSummary);
router.get('/analytics/sales', authenticate, isManager, DashboardController.getSalesAnalytics);
router.get('/analytics/customers', authenticate, isManager, DashboardController.getCustomerAnalytics);
router.get('/analytics/inventory', authenticate, isManager, DashboardController.getInventoryAnalytics);

export default router;
