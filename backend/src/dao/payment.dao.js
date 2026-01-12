import Payment from '../models/payment.model.js';

class PaymentDAO {
  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async findById(id) {
    return await Payment.findById(id).populate('order');
  }

  async findByRazorpayOrderId(razorpayOrderId) {
    return await Payment.findOne({ razorpayOrderId }).populate('order');
  }

  async findByRazorpayPaymentId(razorpayPaymentId) {
    return await Payment.findOne({ razorpayPaymentId }).populate('order');
  }

  async findByOrderId(orderId) {
    return await Payment.findOne({ order: orderId }).populate('order');
  }

  async updateById(id, updateData) {
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('order');
  }

  async updateStatus(id, status, additionalData = {}) {
    const updateData = { status, ...additionalData };
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('order');
  }

  async updatePaymentSuccess(id, paymentData) {
    const updateData = {
      status: 'paid',
      razorpayPaymentId: paymentData.paymentId,
      razorpaySignature: paymentData.signature,
      paymentMethod: paymentData.method,
      customerDetails: paymentData.contact,
      notes: paymentData.description || '',
    };
    
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('order');
  }

  async updatePaymentFailure(id, failureData) {
    const updateData = {
      status: 'failed',
      failure: failureData,
    };
    
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('order');
  }

  async initiateRefund(id, refundData) {
    const updateData = {
      status: 'refunded',
      refund: {
        refundId: refundData.id,
        refundAmount: refundData.amount / 100, // Razorpay returns amount in paise
        refundDate: new Date(),
        refundStatus: 'processed',
        refundReason: refundData.reason || 'Customer requested refund',
      },
    };
    
    return await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('order');
  }

  async deleteById(id) {
    return await Payment.findByIdAndDelete(id);
  }

  async findByStatus(status) {
    return await Payment.find({ status }).populate('order').sort({ createdAt: -1 });
  }

  async countByStatus(status) {
    return await Payment.countDocuments({ status });
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
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulPayments: { 
            $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } 
          },
          failedPayments: { 
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } 
          },
          refundedPayments: { 
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } 
          },
          avgPaymentAmount: { $avg: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalPayments: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          successfulPayments: 1,
          failedPayments: 1,
          refundedPayments: 1,
          avgPaymentAmount: { $round: ['$avgPaymentAmount', 2] }
        }
      }
    ];

    const result = await Payment.aggregate(pipeline);
    return result[0] || {
      totalPayments: 0,
      totalAmount: 0,
      successfulPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
      avgPaymentAmount: 0
    };
  }

  async getPaymentsByDateRange(startDate, endDate, filters = {}) {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate },
      ...filters
    };

    return await Payment.find(query)
      .populate('order')
      .sort({ createdAt: -1 });
  }

  async getRevenueByMonth(year) {
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59)
          },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' },
          payments: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          revenue: { $round: ['$revenue', 2] },
          payments: 1,
          _id: 0
        }
      }
    ];

    return await Payment.aggregate(pipeline);
  }

  async getPaymentMethodStats(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'paid'
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
}

export default new PaymentDAO();
