
import express from 'express';
import InventoryController from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { isAdmin, isManager } from '../middlewares/role.js';

const router = express.Router();

// Admin routes - Inventory management
router.get('/logs', authenticate, isManager, InventoryController.getInventoryLogs);
router.get('/low-stock', authenticate, isManager, InventoryController.getLowStockProducts);
router.get('/stock-value', authenticate, isManager, InventoryController.getStockValue);
router.get('/turnover-stats', authenticate, isManager, InventoryController.getInventoryTurnoverStats);
router.get('/movement-stats', authenticate, isManager, InventoryController.getStockMovementStats);

// Stock adjustment
router.patch('/adjust/:productId/:variantId', authenticate, isManager, InventoryController.adjustStock);

// Validation
router.post('/validate-stock', authenticate, isManager, InventoryController.preventOverselling);

export default router;
