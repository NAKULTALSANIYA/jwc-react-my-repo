import DashboardService from '../services/dashboard.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class DashboardController {
  async getOverviewStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const stats = await DashboardService.getOverviewStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Overview stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueByPeriod(req, res, next) {
    try {
      const { period = 'monthly', startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const revenueData = await DashboardService.getRevenueByPeriod(
        period,
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Revenue data retrieved successfully', { 
        period, 
        revenue: revenueData 
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopSellingProducts(req, res, next) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const products = await DashboardService.getTopSellingProducts(
        new Date(startDate), 
        new Date(endDate),
        parseInt(limit)
      );
      
      return ApiResponse.success(res, 'Top selling products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockProducts(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const products = await DashboardService.getLowStockProducts(parseInt(limit));
      
      return ApiResponse.success(res, 'Low stock products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getRecentOrders(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const orders = await DashboardService.getRecentOrders(parseInt(limit));
      
      return ApiResponse.success(res, 'Recent orders retrieved successfully', { orders });
    } catch (error) {
      next(error);
    }
  }

  async getRecentCustomers(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const customers = await DashboardService.getRecentCustomers(parseInt(limit));
      
      return ApiResponse.success(res, 'Recent customers retrieved successfully', { customers });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerGrowth(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const growth = await DashboardService.getCustomerGrowth(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Customer growth data retrieved successfully', { growth });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryPerformance(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const performance = await DashboardService.getCategoryPerformance(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Category performance retrieved successfully', { performance });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const stats = await DashboardService.getPaymentStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Payment stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const stats = await DashboardService.getReviewsStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Reviews stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryStats(req, res, next) {
    try {
      const stats = await DashboardService.getInventoryStats();
      
      return ApiResponse.success(res, 'Inventory stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const summary = await DashboardService.getDashboardSummary();
      
      return ApiResponse.success(res, 'Dashboard summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }

  async getSalesAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const analytics = await DashboardService.getSalesAnalytics(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Sales analytics retrieved successfully', analytics);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const analytics = await DashboardService.getCustomerAnalytics(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Customer analytics retrieved successfully', analytics);
    } catch (error) {
      next(error);
    }
  }

  async getInventoryAnalytics(req, res, next) {
    try {
      const analytics = await DashboardService.getInventoryAnalytics();
      
      return ApiResponse.success(res, 'Inventory analytics retrieved successfully', analytics);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
