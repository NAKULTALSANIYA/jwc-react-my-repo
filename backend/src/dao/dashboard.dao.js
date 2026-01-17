import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';
import Wishlist from '../models/wishlist.model.js';
import Cart from '../models/cart.model.js';
import Payment from '../models/payment.model.js';

class DashboardDAO {
  async getOverviewStats(startDate, endDate) {
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
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['cancelled', 'returned', 'refunded']] },
                0,
                '$pricing.finalAmount'
              ]
            }
          },
          totalCustomers: { $addToSet: '$user' },
          avgOrderValue: {
            $avg: {
              $cond: [
                { $in: ['$status', ['cancelled', 'returned', 'refunded']] },
                null,
                '$pricing.finalAmount'
              ]
            }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
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
          totalCustomers: { $size: '$totalCustomers' },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          pendingOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1
        }
      }
    ];

    const [result] = await Order.aggregate(pipeline);

    // Get additional stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      variants: {
        $elemMatch: {
          stock: { $lt: 10 },
          isActive: true
        }
      }
    });

    return {
      orders: result || {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      inventory: {
        totalProducts,
        lowStockProducts
      },
      customers: {
        totalUsers
      }
    };
  }

  async getAllTimeStats() {
    // Get all-time order statistics without date filtering
    const pipeline = [
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['cancelled', 'returned', 'refunded']] },
                0,
                '$pricing.finalAmount'
              ]
            }
          },
          totalCustomers: { $addToSet: '$user' },
          avgOrderValue: {
            $avg: {
              $cond: [
                { $in: ['$status', ['cancelled', 'returned', 'refunded']] },
                null,
                '$pricing.finalAmount'
              ]
            }
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
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
          totalCustomers: { $size: '$totalCustomers' },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          pendingOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          deliveredOrders: 1,
          cancelledOrders: 1
        }
      }
    ];

    const [result] = await Order.aggregate(pipeline);

    // Get additional stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      variants: {
        $elemMatch: {
          stock: { $lt: 10 },
          isActive: true
        }
      }
    });

    return {
      orders: result || {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      inventory: {
        totalProducts,
        lowStockProducts
      },
      customers: {
        totalUsers
      }
    };
  }

  async getRevenueByPeriod(period, startDate, endDate) {
    let groupBy;
    let sortBy;

    switch (period) {
      case 'daily':
        groupBy = {
          day: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
        break;
      case 'weekly':
        groupBy = {
          week: { $week: '$createdAt' },
          year: { $year: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.week': 1 };
        break;
      case 'monthly':
        groupBy = {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.month': 1 };
        break;
      case 'yearly':
        groupBy = { year: { $year: '$createdAt' } };
        sortBy = { '_id.year': 1 };
        break;
      default:
        groupBy = {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        };
        sortBy = { '_id.year': 1, '_id.month': 1 };
    }

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid',
          status: { $nin: ['cancelled', 'returned', 'refunded'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$pricing.finalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: sortBy },
      {
        $project: {
          period: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orders: 1,
          _id: 0
        }
      }
    ];

    return await Order.aggregate(pipeline);
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
          orderCount: { $addToSet: '$_id' }
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
          orderCount: { $size: '$orderCount' }
        }
      }
    ];

    return await Order.aggregate(pipeline);
  }

  async getLowStockProducts(limit = 20) {
    const pipeline = [
      {
        $match: {
          isActive: true
        }
      },
      { $unwind: '$variants' },
      {
        $match: {
          'variants.isActive': true,
          'variants.stock': { $lt: 10 }
        }
      },
      { $sort: { 'variants.stock': 1 } },
      { $limit: parseInt(limit) },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          slug: { $first: '$slug' },
          brand: { $first: '$brand' },
          category: { $first: '$category' },
          images: { $first: '$images' },
          variants: {
            $push: {
              _id: '$variants._id',
              size: '$variants.size',
              color: '$variants.color',
              sku: '$variants.sku',
              stock: '$variants.stock'
            }
          },
          totalStock: { $sum: '$variants.stock' }
        }
      }
    ];

    const result = await Product.aggregate(pipeline);
    
    // Populate category
    return await Product.populate(result, {
      path: 'category',
      select: 'name slug'
    });
  }

  async getRecentOrders(limit = 10) {
    return await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-items.quantity'); // Remove quantity for security
  }

  async getRecentCustomers(limit = 10) {
    return await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email phone createdAt lastLogin isActive');
  }

  async getCustomerGrowth(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          role: 'customer'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          newCustomers: 1,
          _id: 0
        }
      }
    ];

    return await User.aggregate(pipeline);
  }

  async getCategoryPerformance(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['confirmed', 'processing', 'packed', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$product.category',
          category: { $first: '$category' },
          totalRevenue: { $sum: '$items.totalPrice' },
          totalOrders: { $addToSet: '$_id' },
          totalProductsSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      {
        $project: {
          category: '$category',
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalOrders: { $size: '$totalOrders' },
          totalProductsSold: 1
        }
      }
    ];

    return await Order.aggregate(pipeline);
  }

  async getPaymentStats(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          paymentMethod: '$_id',
          count: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          _id: 0
        }
      }
    ];

    return await Payment.aggregate(pipeline);
  }

  async getReviewsStats(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ];

    const result = await Review.aggregate(pipeline);
    
    const totalReviews = await Review.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'approved'
    });

    const avgRating = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    result.forEach(item => {
      distribution[item._id] = item.count;
    });

    return {
      totalReviews,
      avgRating: avgRating[0]?.avgRating || 0,
      distribution
    };
  }

  async getInventoryStats() {
    const pipeline = [
      {
        $match: {
          isActive: true
        }
      },
      { $unwind: '$variants' },
      {
        $match: {
          'variants.isActive': true
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $addToSet: '$_id' },
          totalVariants: { $sum: 1 },
          totalStock: { $sum: '$variants.stock' },
          lowStockVariants: {
            $sum: { $cond: [{ $lt: ['$variants.stock', 10] }, 1, 0] }
          },
          outOfStockVariants: {
            $sum: { $cond: [{ $eq: ['$variants.stock', 0] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          totalProducts: { $size: '$totalProducts' },
          totalVariants: 1,
          totalStock: 1,
          lowStockVariants: 1,
          outOfStockVariants: 1
        }
      }
    ];

    const [result] = await Product.aggregate(pipeline);

    return result || {
      totalProducts: 0,
      totalVariants: 0,
      totalStock: 0,
      lowStockVariants: 0,
      outOfStockVariants: 0
    };
  }
}

export default new DashboardDAO();
