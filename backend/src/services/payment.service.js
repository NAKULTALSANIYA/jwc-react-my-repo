import razorpay from '../config/razorpay.js';
import PaymentDAO from '../dao/payment.dao.js';
import OrderService from './order.service.js';
import CartService from './cart.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

class PaymentService {
  _normalizeAmountToPaise(amount) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      throw new ApiError(400, 'Invalid payment amount');
    }

    // If the value already looks like paise (large number), avoid double multiplying.
    const paise = numeric < 1_000_000 ? Math.round(numeric * 100) : Math.round(numeric);

    const MAX_ALLOWED_PAISE = 100_000_000; // ₹1,000,000 cap to stay within Razorpay limits
    if (paise > MAX_ALLOWED_PAISE) {
      throw new ApiError(400, 'Order amount exceeds supported limit');
    }

    return paise;
  }

  async createPayment(paymentData) {
    try {
      const { orderId, amount, currency = 'INR', receipt } = paymentData;

      // Create order in Razorpay
      const razorpayOrder = await razorpay.orders.create({
        amount: this._normalizeAmountToPaise(amount),
        currency,
        receipt,
        notes: {
          orderId: orderId.toString(),
        },
      });

      // Save payment record
      const payment = await PaymentDAO.create({
        order: orderId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency,
        status: 'pending',
      });

      logger.info(`Payment created: ${razorpayOrder.id} for order ${orderId}`);
      return razorpayOrder;
    } catch (error) {
      logger.error('Create payment error:', error);
      throw new ApiError(500, 'Failed to create payment order');
    }
  }

  async verifyPaymentSignature(paymentData) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', razorpay.key_secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        throw new ApiError(400, 'Invalid payment signature');
      }

      // Get payment details from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

      // Update payment record
      const payment = await PaymentDAO.findByRazorpayOrderId(razorpayOrderId);
      if (!payment) {
        throw new ApiError(404, 'Payment record not found');
      }

      const updatedPayment = await PaymentDAO.updatePaymentSuccess(payment._id, {
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        method: razorpayPayment.method,
        contact: razorpayPayment.contact,
        description: razorpayPayment.description,
      });

      // Update order payment status
      await OrderService.updatePaymentStatus(payment.order, 'paid', {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        transactionId: razorpayPaymentId,
        paymentDate: new Date(),
      });

      logger.info(`Payment verified and updated: ${razorpayPaymentId} for order ${payment.order}`);
      return updatedPayment;
    } catch (error) {
      logger.error('Verify payment signature error:', error);
      throw error;
    }
  }

  async handlePaymentFailure(paymentData, userId) {
    /**
     * Handle payment failure by:
     * 1. Updating payment status
     * 2. Unlocking cart so user can modify it
     * 3. NOT clearing the cart
     */
    try {
      const { razorpayOrderId, error } = paymentData;

      const payment = await PaymentDAO.findByRazorpayOrderId(razorpayOrderId);
      if (!payment) {
        throw new ApiError(404, 'Payment record not found');
      }

      const failureData = {
        code: error.code,
        description: error.description,
        source: error.source,
        step: error.step,
        reason: error.reason,
      };

      await PaymentDAO.updatePaymentFailure(payment._id, failureData);

      // Update order status
      await OrderService.updatePaymentStatus(payment.order, 'failed');

      // Unlock cart so user can retry or modify
      if (userId) {
        try {
          await CartService.unlockCart(userId);
          logger.info(`Cart unlocked after payment failure for user ${userId}`);
        } catch (unlockError) {
          logger.warn(`Failed to unlock cart for user ${userId}:`, unlockError.message);
        }
      }

      logger.warn(`Payment failed: ${razorpayOrderId} for order ${payment.order}`);
      return payment;
    } catch (error) {
      logger.error('Handle payment failure error:', error);
      throw error;
    }
  }

  async initiateRefund(orderId, refundData = {}) {
    try {
      const payment = await PaymentDAO.findByOrderId(orderId);
      if (!payment) {
        throw new ApiError(404, 'Payment record not found');
      }

      if (payment.status !== 'paid') {
        throw new ApiError(400, 'Payment must be successful to initiate refund');
      }

      // Initiate refund in Razorpay
      const refund = await razorpay.refunds.create({
        payment_id: payment.razorpayPaymentId,
        amount: Math.round(payment.amount * 100), // Convert to paise
        notes: {
          reason: refundData.reason || 'Customer requested refund',
        },
      });

      // Update payment record
      const updatedPayment = await PaymentDAO.initiateRefund(payment._id, refund);

      // Update order status
      await OrderService.updatePaymentStatus(orderId, 'refunded');

      logger.info(`Refund initiated: ${refund.id} for order ${orderId}`);
      return updatedPayment;
    } catch (error) {
      logger.error('Initiate refund error:', error);
      throw error;
    }
  }

  async getPaymentById(id) {
    try {
      const payment = await PaymentDAO.findById(id);
      
      if (!payment) {
        throw new ApiError(404, 'Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Get payment error:', error);
      throw error;
    }
  }

  async getPaymentByRazorpayOrderId(razorpayOrderId) {
    try {
      const payment = await PaymentDAO.findByRazorpayOrderId(razorpayOrderId);
      return payment;
    } catch (error) {
      logger.error('Get payment by Razorpay order ID error:', error);
      throw error;
    }
  }

  async getPaymentsByOrderId(orderId) {
    try {
      const payment = await PaymentDAO.findByOrderId(orderId);
      return payment;
    } catch (error) {
      logger.error('Get payment by order ID error:', error);
      throw error;
    }
  }

  async getPaymentStats(startDate, endDate) {
    try {
      const stats = await PaymentDAO.getPaymentStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get payment stats error:', error);
      throw error;
    }
  }

  async getPaymentsByDateRange(startDate, endDate, filters = {}) {
    try {
      const payments = await PaymentDAO.getPaymentsByDateRange(startDate, endDate, filters);
      return payments;
    } catch (error) {
      logger.error('Get payments by date range error:', error);
      throw error;
    }
  }

  async getRevenueByMonth(year) {
    try {
      const revenue = await PaymentDAO.getRevenueByMonth(year);
      return revenue;
    } catch (error) {
      logger.error('Get revenue by month error:', error);
      throw error;
    }
  }

  async getPaymentMethodStats(startDate, endDate) {
    try {
      const stats = await PaymentDAO.getPaymentMethodStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get payment method stats error:', error);
      throw error;
    }
  }

  async processWebhook(webhookData) {
    try {
      const { event, payload } = webhookData;

      logger.info(`Processing webhook: ${event}`);

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'refund.created':
          await this.handleRefundCreated(payload);
          break;
        case 'refund.updated':
          await this.handleRefundUpdated(payload);
          break;
        default:
          logger.warn(`Unhandled webhook event: ${event}`);
      }

      return { success: true, event };
    } catch (error) {
      logger.error('Process webhook error:', error);
      throw error;
    }
  }

  async handlePaymentCaptured(payload) {
    try {
      const { payment_id, order_id } = payload;
      
      const payment = await PaymentDAO.findByRazorpayPaymentId(payment_id);
      if (!payment) {
        logger.warn(`Payment not found for webhook: ${payment_id}`);
        return;
      }

      // Update payment if not already updated
      if (payment.status !== 'paid') {
        await PaymentDAO.updateStatus(payment._id, 'paid', {
          razorpayPaymentId: payment_id,
          webhookData: payload,
        });

        // Update order status
        await OrderService.updatePaymentStatus(payment.order, 'paid', {
          razorpayPaymentId: payment_id,
          paymentDate: new Date(),
        });
      }

      logger.info(`Payment captured webhook processed: ${payment_id}`);
    } catch (error) {
      logger.error('Handle payment captured error:', error);
    }
  }

  async handlePaymentFailed(payload) {
    try {
      const { payment_id } = payload;
      
      const payment = await PaymentDAO.findByRazorpayPaymentId(payment_id);
      if (!payment) {
        logger.warn(`Payment not found for webhook: ${payment_id}`);
        return;
      }

      // Update payment status
      await PaymentDAO.updateStatus(payment._id, 'failed', {
        webhookData: payload,
      });

      // Update order status
      await OrderService.updatePaymentStatus(payment.order, 'failed');

      logger.info(`Payment failed webhook processed: ${payment_id}`);
    } catch (error) {
      logger.error('Handle payment failed error:', error);
    }
  }

  async handleRefundCreated(payload) {
    try {
      const { refund_id, payment_id } = payload;
      
      const payment = await PaymentDAO.findByRazorpayPaymentId(payment_id);
      if (!payment) {
        logger.warn(`Payment not found for refund webhook: ${payment_id}`);
        return;
      }

      // Update refund details
      await PaymentDAO.updateById(payment._id, {
        'refund.refundId': refund_id,
        'refund.refundStatus': 'processed',
        'refund.refundDate': new Date(),
        webhookData: payload,
      });

      logger.info(`Refund created webhook processed: ${refund_id}`);
    } catch (error) {
      logger.error('Handle refund created error:', error);
    }
  }

  async handleRefundUpdated(payload) {
    try {
      const { refund_id } = payload;
      
      // Find payment by refund ID
      const payment = await PaymentDAO.findById(payload.payment_id);
      
      if (payment && payment.refund?.refundId === refund_id) {
        await PaymentDAO.updateById(payment._id, {
          'refund.refundStatus': payload.status,
          webhookData: payload,
        });
      }

      logger.info(`Refund updated webhook processed: ${refund_id}`);
    } catch (error) {
      logger.error('Handle refund updated error:', error);
    }
  }

  /**
   * Create only Razorpay order without creating DB order
   * Used in new payment flow: client creates Razorpay order first, then creates DB order after payment verification
   */
  async createRazorpayOrderOnly(amount, currency = 'INR', receipt) {
    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: this._normalizeAmountToPaise(amount),
        currency,
        receipt,
      });

      logger.info(`Razorpay order created: ${razorpayOrder.id}`);
      return razorpayOrder;
    } catch (error) {
      logger.error('Create Razorpay order error:', error);
      throw new ApiError(500, 'Failed to create payment order');
    }
  }

  /**
   * Verify payment and create order after successful payment
   * This is the new flow where order is created only after payment is verified
   */
  async verifyPaymentAndCreateOrder(paymentData, orderData, userId) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', razorpay.key_secret)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        throw new ApiError(400, 'Invalid payment signature');
      }

      // Get payment details from Razorpay to confirm
      const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
        throw new ApiError(400, 'Payment not captured by Razorpay');
      }

      // NOW create the order in DB after payment is verified
      const order = await OrderService.createOrderAfterPayment(userId, orderData, {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        transactionId: razorpayPaymentId,
        paymentDate: new Date(),
      });

      // Save payment record
      const payment = await PaymentDAO.create({
        order: order._id,
        razorpayOrderId,
        razorpayPaymentId,
        amount: orderData.totals.total,
        currency: 'INR',
        status: 'paid',
      });

      logger.info(`Payment verified and order created: ${order.orderNumber}`);
      return { order, payment };
    } catch (error) {
      logger.error('Verify payment and create order error:', error);
      throw error;
    }
  }}

export default new PaymentService();