import DashboardDAO from '../dao/dashboard.dao.js';
import { logger } from '../utils/logger.js';

class DashboardService {
  async getOverviewStats(startDate, endDate) {
    try {
      const stats = await DashboardDAO.getOverviewStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get overview stats error:', error);
      throw error;
    }
  }

  async getRevenueByPeriod(period, startDate, endDate) {
    try {
      const revenueData = await DashboardDAO.getRevenueByPeriod(period, startDate, endDate);
      return revenueData;
    } catch (error) {
      logger.error('Get revenue by period error:', error);
      throw error;
    }
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      const products = await DashboardDAO.getTopSellingProducts(startDate, endDate, limit);
      return products;
    } catch (error) {
      logger.error('Get top selling products error:', error);
      throw error;
    }
  }

  async getLowStockProducts(limit = 20) {
    try {
      const products = await DashboardDAO.getLowStockProducts(limit);
      return products;
    } catch (error) {
      logger.error('Get low stock products error:', error);
      throw error;
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const orders = await DashboardDAO.getRecentOrders(limit);
      return orders;
    } catch (error) {
      logger.error('Get recent orders error:', error);
      throw error;
    }
  }

  async getRecentCustomers(limit = 10) {
    try {
      const customers = await DashboardDAO.getRecentCustomers(limit);
      return customers;
    } catch (error) {
      logger.error('Get recent customers error:', error);
      throw error;
    }
  }

  async getCustomerGrowth(startDate, endDate) {
    try {
      const growth = await DashboardDAO.getCustomerGrowth(startDate, endDate);
      return growth;
    } catch (error) {
      logger.error('Get customer growth error:', error);
      throw error;
    }
  }

  async getCategoryPerformance(startDate, endDate) {
    try {
      const performance = await DashboardDAO.getCategoryPerformance(startDate, endDate);
      return performance;
    } catch (error) {
      logger.error('Get category performance error:', error);
      throw error;
    }
  }

  async getPaymentStats(startDate, endDate) {
    try {
      const stats = await DashboardDAO.getPaymentStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get payment stats error:', error);
      throw error;
    }
  }

  async getReviewsStats(startDate, endDate) {
    try {
      const stats = await DashboardDAO.getReviewsStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get reviews stats error:', error);
      throw error;
    }
  }

  async getInventoryStats() {
    try {
      const stats = await DashboardDAO.getInventoryStats();
      return stats;
    } catch (error) {
      logger.error('Get inventory stats error:', error);
      throw error;
    }
  }

  async getDashboardSummary() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get all-time stats for total counts (no date filtering)
      const allTimeStats = await DashboardDAO.getAllTimeStats();
      
      // Get current month stats
      const currentMonthStats = await DashboardDAO.getOverviewStats(startOfMonth, now);
      
      // Get last month stats for comparison
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const lastMonthStats = await DashboardDAO.getOverviewStats(lastMonth, lastMonthEnd);

      // Calculate growth percentages (month-over-month)
      const revenueGrowth = lastMonthStats.orders.totalRevenue > 0 
        ? ((currentMonthStats.orders.totalRevenue - lastMonthStats.orders.totalRevenue) / lastMonthStats.orders.totalRevenue * 100).toFixed(2)
        : 0;

      const ordersGrowth = lastMonthStats.orders.totalOrders > 0
        ? ((currentMonthStats.orders.totalOrders - lastMonthStats.orders.totalOrders) / lastMonthStats.orders.totalOrders * 100).toFixed(2)
        : 0;

      const customersGrowth = lastMonthStats.customers.totalUsers > 0
        ? ((currentMonthStats.customers.totalUsers - lastMonthStats.customers.totalUsers) / lastMonthStats.customers.totalUsers * 100).toFixed(2)
        : 0;

      return {
        currentMonth: currentMonthStats,
        lastMonth: lastMonthStats,
        allTime: allTimeStats,
        growth: {
          revenue: parseFloat(revenueGrowth),
          orders: parseFloat(ordersGrowth),
          customers: parseFloat(customersGrowth),
        },
        quickStats: {
          totalRevenue: allTimeStats.orders.totalRevenue,
          totalOrders: allTimeStats.orders.totalOrders,
          totalCustomers: allTimeStats.customers.totalUsers,
          avgOrderValue: allTimeStats.orders.avgOrderValue,
          lowStockProducts: allTimeStats.inventory.lowStockProducts,
        }
      };
    } catch (error) {
      logger.error('Get dashboard summary error:', error);
      throw error;
    }
  }

  async getSalesAnalytics(startDate, endDate) {
    try {
      // Get revenue data for different periods
      const dailyRevenue = await this.getRevenueByPeriod('daily', startDate, endDate);
      const weeklyRevenue = await this.getRevenueByPeriod('weekly', startDate, endDate);
      const monthlyRevenue = await this.getRevenueByPeriod('monthly', startDate, endDate);

      // Get category performance
      const categoryPerformance = await this.getCategoryPerformance(startDate, endDate);

      // Get top selling products
      const topProducts = await this.getTopSellingProducts(startDate, endDate, 10);

      return {
        revenue: {
          daily: dailyRevenue,
          weekly: weeklyRevenue,
          monthly: monthlyRevenue
        },
        categories: categoryPerformance,
        topProducts
      };
    } catch (error) {
      logger.error('Get sales analytics error:', error);
      throw error;
    }
  }

  async getCustomerAnalytics(startDate, endDate) {
    try {
      // Get customer growth
      const customerGrowth = await this.getCustomerGrowth(startDate, endDate);

      // Get recent customers
      const recentCustomers = await this.getRecentCustomers(20);

      return {
        growth: customerGrowth,
        recentCustomers
      };
    } catch (error) {
      logger.error('Get customer analytics error:', error);
      throw error;
    }
  }

  async getInventoryAnalytics() {
    try {
      const inventoryStats = await this.getInventoryStats();
      const lowStockProducts = await this.getLowStockProducts(10);

      return {
        stats: inventoryStats,
        lowStockProducts
      };
    } catch (error) {
      logger.error('Get inventory analytics error:', error);
      throw error;
    }
  }
}

export default new DashboardService();
