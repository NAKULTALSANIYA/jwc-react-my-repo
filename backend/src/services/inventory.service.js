
import ProductService from './product.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class InventoryService {
  async updateStock(productId, variantId, quantity, operation, reason, userId, orderId = null) {
    try {
      // Get current product to validate stock
      const product = await ProductService.getProductById(productId);
      const variant = product.variants.id(variantId);
      
      if (!variant) {
        throw new ApiError(404, 'Variant not found');
      }

      const previousStock = variant.stock;
      let newStock;

      // Calculate new stock based on operation
      if (operation === 'increment') {
        newStock = previousStock + quantity;
      } else if (operation === 'decrement') {
        if (previousStock < quantity) {
          throw new ApiError(400, 'Insufficient stock');
        }
        newStock = previousStock - quantity;
      } else {
        throw new ApiError(400, 'Invalid operation. Use increment or decrement');
      }

      // Update product stock
      await ProductService.updateStock(productId, variantId, quantity, operation);

      // Check for low stock alert
      if (newStock <= variant.lowStockThreshold) {
        logger.warn(`Low stock alert: ${product.name} (${variant.size}, ${variant.color}) - Stock: ${newStock}`);
      }

      logger.info(`Stock updated: ${product.name} - ${previousStock} -> ${newStock} (${operation})`);
      return { newStock };
    } catch (error) {
      logger.error('Update stock error:', error);
      throw error;
    }
  }

  async adjustStock(productId, variantId, newStockLevel, reason, userId) {
    try {
      const product = await ProductService.getProductById(productId);
      const variant = product.variants.id(variantId);
      
      if (!variant) {
        throw new ApiError(404, 'Variant not found');
      }

      const previousStock = variant.stock;
      const adjustmentQuantity = newStockLevel - previousStock;

      // Update product stock
      await ProductService.updateStock(productId, variantId, Math.abs(adjustmentQuantity), 
        adjustmentQuantity > 0 ? 'increment' : 'decrement');

      logger.info(`Stock adjusted for ${product.name}: ${previousStock} -> ${newStockLevel}`);
      return { newStock: newStockLevel };
    } catch (error) {
      logger.error('Adjust stock error:', error);
      throw error;
    }
  }

  async getInventoryLogs(filters = {}, page = 1, limit = 10) {
    try {
      const { type, productId, variantId, startDate, endDate } = filters;
      
      let queryFilters = {};
      if (type) queryFilters.type = type;
      if (productId) queryFilters.product = productId;
      if (variantId) queryFilters.variant = variantId;
      
      if (startDate && endDate) {
        queryFilters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      // Get logs based on type
      if (type) {
        const logs = await InventoryDAO.findByType(type, queryFilters, page, limit);
        const total = await InventoryDAO.countByType(type, queryFilters);

        return {
          logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } else {
        // Get all logs (custom implementation needed)
        const logs = await InventoryDAO.getLogsByDateRange(
          startDate || new Date(0), 
          endDate || new Date(), 
          queryFilters
        );
        
        const total = logs.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedLogs = logs.slice(startIndex, endIndex);

        return {
          logs: paginatedLogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      }
    } catch (error) {
      logger.error('Get inventory logs error:', error);
      throw error;
    }
  }

  async getLowStockProducts(threshold = 5) {
    try {
      const products = await InventoryDAO.getLowStockAlerts(threshold);
      return products;
    } catch (error) {
      logger.error('Get low stock products error:', error);
      throw error;
    }
  }

  async getStockMovementStats(startDate, endDate) {
    try {
      const stats = await InventoryDAO.getStockMovementStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get stock movement stats error:', error);
      throw error;
    }
  }

  async getStockValue() {
    try {
      const value = await InventoryDAO.getStockValue();
      return value;
    } catch (error) {
      logger.error('Get stock value error:', error);
      throw error;
    }
  }

  async getInventoryTurnoverStats(productId, startDate, endDate) {
    try {
      const stats = await InventoryDAO.getInventoryTurnoverStats(productId, startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get inventory turnover stats error:', error);
      throw error;
    }
  }

  async preventOverselling(orders) {
    try {
      const insufficientStockItems = [];

      for (const order of orders) {
        const product = await ProductService.getProductById(order.productId);
        const variant = product.variants.id(order.variantId);
        
        if (!variant) {
          insufficientStockItems.push({
            productId: order.productId,
            variantId: order.variantId,
            reason: 'Variant not found'
          });
          continue;
        }

        if (variant.stock < order.quantity) {
          insufficientStockItems.push({
            productId: order.productId,
            variantId: order.variantId,
            availableStock: variant.stock,
            requestedQuantity: order.quantity,
            reason: 'Insufficient stock'
          });
        }
      }

      if (insufficientStockItems.length > 0) {
        throw new ApiError(400, 'Insufficient stock for some items', { insufficientStockItems });
      }

      return { canProcess: true };
    } catch (error) {
      logger.error('Prevent overselling error:', error);
      throw error;
    }
  }

  async processOrderStock(orders, orderId, userId) {
    try {
      const stockUpdates = [];

      for (const order of orders) {
        // Handle both 'product' and 'productId' field names for compatibility
        const productId = order.productId || order.product;
        
        if (!productId) {
          logger.warn('Product ID missing from order item', { order });
          continue;
        }

        const result = await this.updateStock(
          productId,
          order.variantId,
          order.quantity,
          'decrement',
          'Order placed',
          userId,
          orderId
        );
        
        stockUpdates.push(result);
      }

      logger.info(`Stock updated for order ${orderId}: ${orders.length} items processed`);
      return stockUpdates;
    } catch (error) {
      logger.error('Process order stock error:', error);
      throw error;
    }
  }

  async processReturnStock(orderItems, orderId, userId) {
    try {
      const stockUpdates = [];

      for (const item of orderItems) {
        // Handle both 'product' and 'productId' field names for compatibility
        const productId = item.productId || item.product;
        
        if (!productId) {
          logger.warn('Product ID missing from return item', { item });
          continue;
        }

        const result = await this.updateStock(
          productId,
          item.variantId,
          item.quantity,
          'increment',
          'Item returned',
          userId,
          orderId
        );
        
        stockUpdates.push(result);
      }

      logger.info(`Stock updated for return order ${orderId}: ${orderItems.length} items processed`);
      return stockUpdates;
    } catch (error) {
      logger.error('Process return stock error:', error);
      throw error;
    }
  }
}

export default new InventoryService();
