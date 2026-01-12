import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'wallet', 'emi', 'upi'],
  },
  customerDetails: {
    name: String,
    email: String,
    contact: String,
  },
  notes: {
    type: String,
  },
  // Refund details
  refund: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
    },
    refundReason: String,
  },
  // Failure details
  failure: {
    code: String,
    description: String,
    source: String,
    step: String,
    reason: String,
  },
  // Webhook data
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
