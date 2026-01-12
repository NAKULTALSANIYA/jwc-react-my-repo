
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
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
    max: [10, 'Maximum 10 items per variant allowed'],
  },
  // Price fields are NOT stored - calculated server-side only
  // This prevents frontend manipulation
}, {
  timestamps: true,
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    default: 0,
  },
  version: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate variants in cart
cartSchema.index(
  { user: 1, 'items.variantId': 1 },
  { 
    unique: true, 
    sparse: true,
    name: 'unique_user_variant'
  }
);

// Index for better query performance
// Note: user field already has unique: true which creates the index
cartSchema.index({ isLocked: 1, lockedAt: 1 });

// Calculate totals before saving (recalculated server-side)
cartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    // Prices will be recalculated in service layer
    this.totalPrice = 0;
    this.totalDiscount = 0;
    this.finalAmount = 0;
  }
  
  // Increment version on any modification
  if (this.isModified()) {
    this.version += 1;
  }
  
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
