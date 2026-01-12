
import InventoryLog from '../models/inventorylog.model.js';
import Product from '../models/product.model.js';

class InventoryDAO {
  async createLog(logData) {
    const log = new InventoryLog(logData);
    return await log.save();
  }

  async findById(id) {
    return await InventoryLog.findById(id)
      .populate('product')
      .populate('variant')
      .populate('orderId')
      .populate('userId');
  }

  async findByProduct(productId) {
    return await InventoryLog.find({ product: productId })
      .populate('variant')
      .populate('orderId')
      .populate('userId')
      .sort({ createdAt: -1 });
  }

  async findByVariant(variantId) {
    return await InventoryLog.find({ variant: variantId })
      .populate('product')
      .populate('orderId')
      .populate('userId')
      .sort({ createdAt: -1 });
  }

  async findByType(type, filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = { type, ...filters };
    
    return await InventoryLog.find(query)
      .populate('product')
      .populate('variant')
      .populate('orderId')
      .populate('userId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
  }

  async countByType(type, filters = {}) {
    return await InventoryLog.countDocuments({ type, ...filters });
  }

  async getRecentLogs(limit = 50) {
    return await InventoryLog.find()
      .populate('product')
      .populate('variant')
      .populate('orderId')
      .populate('userId')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getLogsByDateRange(startDate, endDate, filters = {}) {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate },
      ...filters
    };
    
    return await InventoryLog.find(query)
      .populate('product')
      .populate('variant')
      .populate('orderId')
      .populate('userId')
      .sort({ createdAt: -1 });
  }

  async getInventoryTurnoverStats(productId, startDate, endDate) {
    const pipeline = [
      {
        $match: {
          product: productId,
          createdAt: { $gte: startDate, $lte: endDate },
          type: { $in: ['sale', 'restock'] }
        }
      },
      {
        $group: {
          _id: '$type',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ];

    return await InventoryLog.aggregate(pipeline);
  }

  async getLowStockAlerts(threshold = 5) {
    const products = await Product.find({
      isActive: true,
      status: { $ne: 'discontinued' },
      $expr: { $lte: ['$totalStock', threshold] }
    }).populate('category');

    return products;
  }

  async getStockMovementStats(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ];

    return await InventoryLog.aggregate(pipeline);
  }

  async getStockValue() {
    const pipeline = [
      {
        $unwind: '$product.variants'
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ['$product.variants.stock', '$product.variants.finalPrice']
            }
          },
          totalItems: { $sum: '$product.variants.stock' }
        }
      }
    ];

    const result = await Product.aggregate(pipeline);
    return result[0] || { totalValue: 0, totalItems: 0 };
  }
}

export default new InventoryDAO();
