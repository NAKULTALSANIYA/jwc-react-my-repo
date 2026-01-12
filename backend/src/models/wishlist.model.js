import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [wishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0,
  },
  version: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate variants in wishlist
wishlistSchema.index(
  { user: 1, 'items.variantId': 1 },
  { 
    unique: true, 
    sparse: true,
    name: 'unique_user_variant_wishlist'
  }
);

// Indexes for better query performance
// Note: user field already has unique: true which creates the index
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ 'items.variantId': 1 });

// Update total items count before saving
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  
  // Increment version on any modification
  if (this.isModified()) {
    this.version += 1;
  }
  
  next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;