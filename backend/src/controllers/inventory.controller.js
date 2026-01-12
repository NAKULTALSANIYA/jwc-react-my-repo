
import InventoryService from '../services/inventory.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class InventoryController {
  async getInventoryLogs(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        productId, 
        variantId, 
        startDate, 
        endDate 
      } = req.query;
      
      const filters = { type, productId, variantId, startDate, endDate };
      const result = await InventoryService.getInventoryLogs(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Inventory logs retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 5 } = req.query;
      const products = await InventoryService.getLowStockProducts(parseInt(threshold));
      
      return ApiResponse.success(res, 'Low stock products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getStockMovementStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const stats = await InventoryService.getStockMovementStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Stock movement stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getStockValue(req, res, next) {
    try {
      const value = await InventoryService.getStockValue();
      
      return ApiResponse.success(res, 'Stock value retrieved successfully', { value });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryTurnoverStats(req, res, next) {
    try {
      const { productId, startDate, endDate } = req.query;
      
      if (!productId || !startDate || !endDate) {
        throw new ApiError(400, 'Product ID, start date and end date are required');
      }

      const stats = await InventoryService.getInventoryTurnoverStats(
        productId,
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Inventory turnover stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const { productId, variantId } = req.params;
      const { newStockLevel, reason } = req.body;
      const userId = req.user.id;

      if (!reason) {
        throw new ApiError(400, 'Reason for stock adjustment is required');
      }

      const result = await InventoryService.adjustStock(
        productId, 
        variantId, 
        newStockLevel, 
        reason, 
        userId
      );
      
      return ApiResponse.success(res, 'Stock adjusted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async preventOverselling(req, res, next) {
    try {
      const { orders } = req.body;

      if (!orders || !Array.isArray(orders)) {
        throw new ApiError(400, 'Orders array is required');
      }

      const result = await InventoryService.preventOverselling(orders);
      
      return ApiResponse.success(res, 'Stock validation completed', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
