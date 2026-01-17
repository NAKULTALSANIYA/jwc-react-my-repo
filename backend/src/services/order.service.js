import OrderDAO from '../dao/order.dao.js';
import CartService from './cart.service.js';
import InventoryService from './inventory.service.js';
import PaymentService from './payment.service.js';
import UserService from './user.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { emitOrderUpdated } from '../utils/socket.js';

class OrderService {
  async createOrder(userId, orderData) {
    try {
      const { items, shippingAddress, billingAddress, paymentMethod, notes } = orderData;

      if (!items || items.length === 0) {
        throw new ApiError(400, 'Order items are required');
      }

      if (!shippingAddress) {
        throw new ApiError(400, 'Shipping address is required');
      }

      // Validate cart items and get current prices
      const cartItems = await CartService.getCartItemsForCheckout(userId);
      
      // Calculate pricing
      const pricing = await this.calculatePricing(cartItems, shippingAddress);

      // Create order items (safe variant resolution from populated product)
      const orderItems = cartItems.items.map(item => {
        const productDoc = item.product;
        const productId = productDoc?._id || item.product;
        const productName = productDoc?.name || 'Unknown Product';
        const variantDoc = productDoc?.variants?.id?.(item.variantId);

        if (!variantDoc) {
          logger.warn('Variant not found while creating order item', {
            productId: productId?.toString?.() || productId,
            variantId: item.variantId?.toString?.() || item.variantId,
          });
        }

        return {
          product: productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          discountPrice: item.discountPrice,
          finalPrice: item.finalPrice,
          totalPrice: item.finalPrice * item.quantity,
          productName,
          variantDetails: {
            size: variantDoc?.size || null,
            color: variantDoc?.color || null,
            sku: variantDoc?.sku || null,
          },
        };
      });

      // Create order
      const order = await OrderDAO.create({
        user: userId,
        items: orderItems,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        pricing,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        notes: {
          customer: notes?.customer || '',
          admin: notes?.admin || '',
        },
        metadata: {
          source: 'web',
          userAgent: orderData.userAgent,
          referrer: orderData.referrer,
        },
      });

      // Process payment if not COD; tolerate gateway unavailability
      if (paymentMethod !== 'cod') {
        try {
          const payment = await PaymentService.createPayment({
            orderId: order._id,
            amount: pricing.finalAmount,
            currency: 'INR',
            receipt: order.orderNumber,
          });

          order.paymentDetails = {
            razorpayOrderId: payment?.id || null,
          };
          await order.save();
        } catch (payErr) {
          logger.warn('Skipping gateway creation; payment pending', {
            orderId: order._id?.toString?.(),
            reason: payErr?.message,
          });
          // Keep paymentStatus as 'pending' and proceed
        }
      }

      // Clear cart after order creation
      await CartService.clearCart(userId);

      // Update inventory
      await InventoryService.processOrderStock(orderItems, order._id, userId);

      logger.info(`Order created: ${order.orderNumber} for user ${userId}`);
      return order;
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    } finally {
      // Ensure cart is unlocked if this flow locked it
      try {
        await CartService.unlockCart(userId);
      } catch (unlockErr) {
        logger.warn('Failed to unlock cart after createOrder', { userId, message: unlockErr.message });
      }
    }
  }

  /**
   * Create order after payment is successfully verified
   * This method is used in the new payment flow where payment verification happens before order creation
   */
  async createOrderAfterPayment(userId, orderData, paymentDetails) {
    try {
      const { items, shippingAddress, billingAddress, paymentMethod, notes, totals } = orderData;

      if (!items || items.length === 0) {
        throw new ApiError(400, 'Order items are required');
      }

      if (!shippingAddress) {
        throw new ApiError(400, 'Shipping address is required');
      }

      // Validate cart items and get current prices
      const cartItems = await CartService.getCartItemsForCheckout(userId);
      
      // Transform totals from frontend into proper pricing structure
      // Frontend sends: { subtotal, tax, shipping, total }
      // Backend expects: { totalItems, subtotal, totalDiscount, tax, shippingCharges, totalAmount, finalAmount }
      let pricing;
      if (totals) {
        pricing = {
          totalItems: items.length,
          subtotal: totals.subtotal || 0,
          totalDiscount: 0,
          tax: totals.tax || 0,
          shippingCharges: totals.shipping || 0,
          totalAmount: totals.total || 0,
          finalAmount: totals.total || 0,
        };
      } else {
        // Fallback: calculate pricing from current cart
        pricing = await this.calculatePricing(cartItems, shippingAddress);
      }

      // Create order items
      const orderItems = cartItems.items.map(item => {
        const productDoc = item.product;
        const productId = productDoc?._id || item.product;
        const productName = productDoc?.name || 'Unknown Product';
        const variantDoc = productDoc?.variants?.id?.(item.variantId);

        return {
          product: productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          discountPrice: item.discountPrice,
          finalPrice: item.finalPrice,
          totalPrice: item.finalPrice * item.quantity,
          productName,
          variantDetails: {
            size: variantDoc?.size || null,
            color: variantDoc?.color || null,
            sku: variantDoc?.sku || null,
          },
        };
      });

      // Create order with payment already verified
      const order = await OrderDAO.create({
        user: userId,
        items: orderItems,
        status: 'confirmed', // Order is confirmed since payment is verified
        paymentStatus: 'paid', // Payment status is already paid
        paymentMethod,
        paymentDetails, // Store the verified payment details
        pricing,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        notes: {
          customer: notes?.customer || '',
          admin: notes?.admin || '',
        },
        metadata: {
          source: 'web',
          userAgent: orderData.userAgent,
          referrer: orderData.referrer,
        },
      });

      // Clear cart after order creation
      await CartService.clearCart(userId);

      // Update inventory
      await InventoryService.processOrderStock(orderItems, order._id, userId);

      logger.info(`Order created after payment verification: ${order.orderNumber} for user ${userId}`);
      return order;
    } catch (error) {
      logger.error('Create order after payment error:', error);
      throw error;
    } finally {
      // Ensure cart lock is released even if an error occurs
      try {
        await CartService.unlockCart(userId);
      } catch (unlockErr) {
        logger.warn('Failed to unlock cart in createOrderAfterPayment', { userId, message: unlockErr.message });
      }
    }
  }

  async calculatePricing(cartItems, shippingAddress) {
    const totalItems = cartItems.totalItems;
    const subtotal = cartItems.finalAmount;
    
    // Calculate discount
    const totalDiscount = cartItems.totalDiscount;
    
    // Calculate tax (example: 18% GST)
    const taxRate = 0.18;
    const tax = Math.round(subtotal * taxRate);
    
    // Calculate shipping charges
    const shippingCharges = this.calculateShippingCharges(subtotal, shippingAddress);
    
    const totalAmount = subtotal + tax + shippingCharges;
    const finalAmount = totalAmount;

    return {
      totalItems,
      subtotal,
      totalDiscount,
      tax,
      shippingCharges,
      totalAmount,
      finalAmount,
    };
  }

  calculateShippingCharges(subtotal, shippingAddress) {
    // Free shipping for orders above ₹1000
    if (subtotal >= 1000) {
      return 0;
    }
    
    // Standard shipping charges
    return 50;
  }

  async getOrderById(id) {
    try {
      const order = await OrderDAO.findById(id);
      
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Get order error:', error);
      throw error;
    }
  }

  async getOrderByOrderNumber(orderNumber) {
    try {
      const order = await OrderDAO.findByOrderNumber(orderNumber);
      
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Get order by order number error:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId, page = 1, limit = 10) {
    try {
      const orders = await OrderDAO.findByUserId(userId, page, limit);
      const total = await OrderDAO.countByUserId(userId);

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get orders by user error:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, userId, note = '') {
    try {
      const order = await this.getOrderById(orderId);
      
      // Validate status transition
      this.validateStatusTransition(order.status, status);

      const updatedOrder = await OrderDAO.updateStatus(orderId, status, userId, note);

      // Handle inventory updates for certain status changes
      if (status === 'cancelled' && order.status !== 'cancelled') {
        await InventoryService.processReturnStock(order.items, orderId, userId);
      }

      emitOrderUpdated(updatedOrder);

      logger.info(`Order status updated: ${order.orderNumber} from ${order.status} to ${status}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Update order status error:', error);
      throw error;
    }
  }

  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['packed', 'cancelled'],
      packed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['returned'],
      cancelled: [],
      returned: [],
      refunded: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ApiError(400, `Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }

  async cancelOrder(orderId, userId, reason = '') {
    try {
      const order = await this.getOrderById(orderId);
      
      // Check if order can be cancelled
      if (!['pending', 'confirmed', 'processing'].includes(order.status)) {
        throw new ApiError(400, 'Order cannot be cancelled at this stage');
      }

      const updatedOrder = await this.updateOrderStatus(orderId, 'cancelled', userId, reason);

      // Initiate refund if payment was made
      if (order.paymentStatus === 'paid') {
        await PaymentService.initiateRefund(orderId);
      }

      logger.info(`Order cancelled: ${order.orderNumber} by user ${userId}`);
      return updatedOrder;
    } catch (error) {
      logger.error('Cancel order error:', error);
      throw error;
    }
  }

  async getOrderStats(startDate, endDate) {
    try {
      const stats = await OrderDAO.getOrderStats(startDate, endDate);
      return stats;
    } catch (error) {
      logger.error('Get order stats error:', error);
      throw error;
    }
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      const products = await OrderDAO.getTopSellingProducts(startDate, endDate, limit);
      return products;
    } catch (error) {
      logger.error('Get top selling products error:', error);
      throw error;
    }
  }

  async getRevenueByMonth(year) {
    try {
      const revenue = await OrderDAO.getRevenueByMonth(year);
      return revenue;
    } catch (error) {
      logger.error('Get revenue by month error:', error);
      throw error;
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const orders = await OrderDAO.getRecentOrders(limit);
      return orders;
    } catch (error) {
      logger.error('Get recent orders error:', error);
      throw error;
    }
  }

  async getCustomerOrderStats(userId) {
    try {
      const stats = await OrderDAO.getCustomerOrderStats(userId);
      return stats;
    } catch (error) {
      logger.error('Get customer order stats error:', error);
      throw error;
    }
  }

  async getOrdersForAdmin(filters = {}, page = 1, limit = 10) {
    try {
      const { status, paymentStatus, startDate, endDate } = filters;
      
      let queryFilters = {};
      if (status) queryFilters.status = status;
      if (paymentStatus) queryFilters.paymentStatus = paymentStatus;
      
      if (startDate && endDate) {
        queryFilters.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      const skip = (page - 1) * limit;
      const orders = await OrderDAO.getOrdersByDateRange(
        startDate || new Date(0),
        endDate || new Date(),
        queryFilters
      );

      const total = orders.length;
      const paginatedOrders = orders.slice(skip, skip + parseInt(limit));

      return {
        orders: paginatedOrders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get orders for admin error:', error);
      throw error;
    }
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentDetails) {
    try {
      const updatedOrder = await OrderDAO.updatePaymentStatus(orderId, paymentStatus, paymentDetails);
      
      // Update order status based on payment status
      if (paymentStatus === 'paid' && updatedOrder.status === 'pending') {
        await this.updateOrderStatus(orderId, 'confirmed', null, 'Payment confirmed');
      } else if (paymentStatus === 'failed') {
        await this.updateOrderStatus(orderId, 'cancelled', null, 'Payment failed');
      }

      return updatedOrder;
    } catch (error) {
      logger.error('Update payment status error:', error);
      throw error;
    }
  }
}

export default new OrderService();
