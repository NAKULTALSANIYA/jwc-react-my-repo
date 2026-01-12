import OrderService from '../services/order.service.js';
import PaymentService from '../services/payment.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class OrderController {
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const orderData = req.body;

      const order = await OrderService.createOrder(userId, orderData);
      
      return ApiResponse.success(res, 'Order created successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id?.toString();
      const userRole = req.user.role;

      const order = await OrderService.getOrderById(orderId);
      
      // Check if user has permission to view this order
      const orderUserId = order.user?._id?.toString() || order.user?.toString();
      
      if (userRole !== 'admin' && orderUserId !== userId) {
        throw new ApiError(403, 'Access denied');
      }

      return ApiResponse.success(res, 'Order retrieved successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async getOrderByOrderNumber(req, res, next) {
    try {
      const { orderNumber } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const order = await OrderService.getOrderByOrderNumber(orderNumber);
      
      // Check if user has permission to view this order
      if (userRole !== 'admin' && order.user._id.toString() !== userId) {
        throw new ApiError(403, 'Access denied');
      }

      return ApiResponse.success(res, 'Order retrieved successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async getOrdersByUserId(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await OrderService.getOrdersByUserId(userId, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status, note } = req.body;
      const userId = req.user.id;

      if (!status) {
        throw new ApiError(400, 'Status is required');
      }

      const order = await OrderService.updateOrderStatus(orderId, status, userId, note);
      
      return ApiResponse.success(res, 'Order status updated successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const order = await OrderService.cancelOrder(orderId, userId, reason);
      
      return ApiResponse.success(res, 'Order cancelled successfully', { order });
    } catch (error) {
      next(error);
    }
  }

  async getOrderStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const stats = await OrderService.getOrderStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Order stats retrieved successfully', { stats });
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

      const products = await OrderService.getTopSellingProducts(
        new Date(startDate), 
        new Date(endDate),
        parseInt(limit)
      );
      
      return ApiResponse.success(res, 'Top selling products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueByMonth(req, res, next) {
    try {
      const { year } = req.query;
      
      if (!year) {
        throw new ApiError(400, 'Year is required');
      }

      const revenue = await OrderService.getRevenueByMonth(parseInt(year));
      
      return ApiResponse.success(res, 'Revenue data retrieved successfully', { revenue });
    } catch (error) {
      next(error);
    }
  }

  async getRecentOrders(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const orders = await OrderService.getRecentOrders(parseInt(limit));
      
      return ApiResponse.success(res, 'Recent orders retrieved successfully', { orders });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerOrderStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await OrderService.getCustomerOrderStats(userId);
      
      return ApiResponse.success(res, 'Customer order stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getOrdersForAdmin(req, res, next) {
    try {
      const { status, paymentStatus, startDate, endDate, page = 1, limit = 10 } = req.query;
      
      const filters = { status, paymentStatus, startDate, endDate };
      const result = await OrderService.getOrdersForAdmin(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Orders retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 1: Create Razorpay order without creating DB order
   * This is the first step in new payment flow
   */
  async createRazorpayOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { items, shippingAddress, paymentMethod, totals } = req.body;

      if (!items || items.length === 0) {
        throw new ApiError(400, 'Order items are required');
      }

      if (!shippingAddress) {
        throw new ApiError(400, 'Shipping address is required');
      }

      if (!totals || !totals.total) {
        throw new ApiError(400, 'Order total is required');
      }

      // Create receipt for Razorpay (unique identifier)
      const timestamp = Date.now().toString().slice(-6);
      const receipt = `RECEIPT_${timestamp}`;

      // Create only Razorpay order (not DB order yet)
      const razorpayOrder = await PaymentService.createRazorpayOrderOnly(
        totals.total,
        'INR',
        receipt
      );

      // Store the order data temporarily for when payment is verified
      // (Frontend will send this back after payment verification)
      return ApiResponse.success(res, 'Razorpay order created successfully', {
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
        },
        // Include necessary info for frontend to complete the payment flow
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Step 2: Verify payment and create order
   * This happens after successful payment verification from frontend
   */
  async verifyPaymentAndCreateOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderData } = req.body;

      // Validate payment data
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new ApiError(400, 'Payment verification details are incomplete');
      }

      if (!orderData) {
        throw new ApiError(400, 'Order data is required');
      }

      // Verify payment and create order
      const { order, payment } = await PaymentService.verifyPaymentAndCreateOrder(
        {
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
        orderData,
        userId
      );

      return ApiResponse.success(res, 'Payment verified and order created successfully', {
        order,
        payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
