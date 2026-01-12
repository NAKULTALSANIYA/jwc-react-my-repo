
import express from 'express';
import ProductController from '../controllers/product.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Public routes - Product viewing (order matters: specific routes before dynamic :id)
router.get('/public/search', ProductController.searchProducts);
router.get('/public/featured', ProductController.getFeaturedProducts);
router.get('/public/category/:categoryId', ProductController.getProductsByCategory);
router.get('/public/:id/related', ProductController.getRelatedProducts);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductById);
router.get('/', ProductController.getAllProducts);

// Admin routes - Product CRUD
router.post('/', authenticate, isManager, ProductController.createProduct);
router.put('/:id', authenticate, isManager, ProductController.updateProduct);
router.delete('/:id', authenticate, isManager, ProductController.deleteProduct);
router.patch('/:id/toggle-status', authenticate, isManager, ProductController.toggleProductStatus);

// Admin routes - Analytics
router.get('/admin/low-stock', authenticate, isManager, ProductController.getLowStockProducts);
router.get('/admin/top-selling', authenticate, isManager, ProductController.getTopSellingProducts);
router.get('/admin/inventory-stats', authenticate, isManager, ProductController.getInventoryStats);

// Variant management - Admin only
router.post('/:id/variants', authenticate, isManager, ProductController.addVariant);
router.put('/:id/variants/:variantId', authenticate, isManager, ProductController.updateVariant);
router.delete('/:id/variants/:variantId', authenticate, isManager, ProductController.removeVariant);

// Stock management - Admin only
router.patch('/:id/variants/:variantId/stock', authenticate, isManager, ProductController.updateStock);
router.post('/bulk/stock', authenticate, isManager, ProductController.bulkUpdateStock);

export default router;
