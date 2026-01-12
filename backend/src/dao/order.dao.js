import Order from '../models/order.model.js';

class OrderDAO {
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  async findById(id) {
    return await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images brand');
  }

  async findByOrderNumber(orderNumber) {
    return await Order.findOne({ orderNumber })
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images brand');
  }

  async findByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Order.find({ user: userId })
      .populate('items.product', 'name slug images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async findByUserIdAndStatus(userId, status, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Order.find({ user: userId, status })
      .populate('items.product', 'name slug images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async findByStatus(status, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Order.find({ status })
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async findByPaymentStatus(paymentStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Order.find({ paymentStatus })
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async updateById(id, updateData) {
    return await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email phone')
     .populate('items.product', 'name slug images brand');
  }

  async updateStatus(id, status, changedBy, note = '') {
    const updateData = { 
      status,
      _updatedBy: changedBy,
      ...(note && { 'notes.admin': note })
    };
    
    return await this.updateById(id, updateData);
  }

  async updatePaymentStatus(id, paymentStatus, paymentDetails = {}) {
    const updateData = { 
      paymentStatus,
      ...(Object.keys(paymentDetails).length > 0 && {
        paymentDetails: { $set: paymentDetails }
      })
    };
    
    return await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email phone')
     .populate('items.product', 'name slug images brand');
  }

  async deleteById(id) {
    return await Order.findByIdAndDelete(id);
  }

  async countByUserId(userId) {
    return await Order.countDocuments({ user: userId });
  }

  async countByStatus(status) {
    return await Order.countDocuments({ status });
  }

  async countByPaymentStatus(paymentStatus) {
    return await Order.countDocuments({ paymentStatus });
  }

  async getOrderStats(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.finalAmount' },
          avgOrderValue: { $avg: '$pricing.finalAmount' },
          pendingOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
          },
          confirmedOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } 
          },
          shippedOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } 
          },
          deliveredOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } 
          },
          cancelledOrders: { 
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          pendingOrders: 1,
          confirmedOrders: 1,
          shippedOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    return result[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    };
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'processing', 'packed', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
          pipeline: [
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
              }
            },
            { $unwind: '$category' }
          ]
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          product: '$product',
          totalSold: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1
        }
      }
    ];

    return await Order.aggregate(pipeline);
  }

  async getRevenueByMonth(year) {
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59)
          },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$pricing.finalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orders: 1,
          _id: 0
        }
      }
    ];

    return await Order.aggregate(pipeline);
  }

  async getRecentOrders(limit = 10) {
    return await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images brand')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getOrdersByDateRange(startDate, endDate, filters = {}) {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate },
      ...filters
    };

    return await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images brand')
      .sort({ createdAt: -1 });
  }

  async getCustomerOrderStats(userId) {
    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.finalAmount' },
          avgOrderValue: { $avg: '$pricing.finalAmount' },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          firstOrder: 1,
          lastOrder: 1
        }
      }
    ]);

    return stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
      firstOrder: null,
      lastOrder: null
    };
  }
}

export default new OrderDAO();
