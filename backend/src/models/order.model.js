import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  variantDetails: {
    size: String,
    color: String,
    sku: String,
  },
}, {
  timestamps: true,
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending',
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'card', 'netbanking', 'wallet', 'cod'],
    required: true,
  },
  // Payment details
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    transactionId: String,
    paymentDate: Date,
  },
  // Refund information (for pending payments where money might be debited)
  refundInfo: {
    isApplicable: { type: Boolean, default: false },
    estimatedRefundDate: Date, // 7-10 days from payment date
    refundInitiatedDate: Date,
    refundCompletedDate: Date,
    refundStatus: {
      type: String,
      enum: ['not_applicable', 'pending', 'initiated', 'completed'],
      default: 'not_applicable',
    },
    refundAmount: Number,
    refundReason: String,
  },
  // Pricing details
  pricing: {
    totalItems: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCharges: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
  },
  // Shipping address
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String,
    alternatePhone: String,
  },
  // Billing address
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  // Order tracking
  tracking: {
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    trackingNumber: String,
    courierService: String,
    trackingUrl: String,
  },
  // Order notes
  notes: {
    customer: String,
    admin: String,
    cancellation: String,
  },
  // Timestamps for status changes
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
  }],
  // Return/Refund details
  returnDetails: {
    returnRequested: { type: Boolean, default: false },
    returnRequestedDate: Date,
    returnApprovedDate: Date,
    returnRejectedDate: Date,
    returnReason: String,
    returnStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: 'pending',
    },
    refundAmount: Number,
    refundDate: Date,
    refundMethod: String,
  },
  // Metadata
  metadata: {
    source: { type: String, default: 'web' }, // web, mobile, admin
    utm: {
      source: String,
      medium: String,
      campaign: String,
    },
    referrer: String,
    userAgent: String,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Ensure order number exists before validation (required field)
orderSchema.pre('validate', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    const orderNum = `ORD${timestamp}${String(count + 1).padStart(4, '0')}`;
    this.orderNumber = orderNum;
  }
  next();
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      changedBy: this._updatedBy, // Will be set by the service
      note: this.notes?.admin || '',
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
