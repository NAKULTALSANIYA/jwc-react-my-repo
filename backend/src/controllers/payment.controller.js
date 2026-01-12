import PaymentService from '../services/payment.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class PaymentController {
  async verifyPayment(req, res, next) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new ApiError(400, 'All payment verification fields are required');
      }

      const payment = await PaymentService.verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      return ApiResponse.success(res, 'Payment verified successfully', { payment });
    } catch (error) {
      next(error);
    }
  }

  async initiateRefund(req, res, next) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const payment = await PaymentService.initiateRefund(orderId, { reason });
      
      return ApiResponse.success(res, 'Refund initiated successfully', { payment });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const { paymentId } = req.params;
      const payment = await PaymentService.getPaymentById(paymentId);
      
      return ApiResponse.success(res, 'Payment retrieved successfully', { payment });
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

      const stats = await PaymentService.getPaymentStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Payment stats retrieved successfully', { stats });
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

      const revenue = await PaymentService.getRevenueByMonth(parseInt(year));
      
      return ApiResponse.success(res, 'Revenue data retrieved successfully', { revenue });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentMethodStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const stats = await PaymentService.getPaymentMethodStats(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Payment method stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async processWebhook(req, res, next) {
    try {
      const webhookData = {
        event: req.body.event,
        payload: req.body.payload,
      };

      const result = await PaymentService.processWebhook(webhookData);
      
      return ApiResponse.success(res, 'Webhook processed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getPaymentByOrderId(req, res, next) {
    try {
      const { orderId } = req.params;
      const payment = await PaymentService.getPaymentsByOrderId(orderId);
      
      return ApiResponse.success(res, 'Payment retrieved successfully', { payment });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
