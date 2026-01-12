
import express from 'express';
import CategoryController from '../controllers/category.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Admin routes - Category CRUD
router.post('/', authenticate, isManager, CategoryController.createCategory);
router.get('/', authenticate, isManager, CategoryController.getAllCategories);
router.get('/tree', authenticate, isManager, CategoryController.getCategoryTree);
router.get('/:id', authenticate, isManager, CategoryController.getCategoryById);
router.put('/:id', authenticate, isManager, CategoryController.updateCategory);
router.delete('/:id', authenticate, isManager, CategoryController.deleteCategory);
router.patch('/:id/toggle-status', authenticate, isManager, CategoryController.toggleCategoryStatus);

// Public routes
router.get('/public/root', CategoryController.getRootCategories);
router.get('/public/tree', CategoryController.getCategoryTree);
router.get('/public/with-products', CategoryController.getCategoriesWithProducts);
router.get('/public/slug/:slug', CategoryController.getCategoryBySlug);
router.get('/public/:parentId/subcategories', CategoryController.getSubcategories);

export default router;
