import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  comment: {
    type: String,
    required: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  }],
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  // Helpful votes
  helpful: {
    count: { type: Number, default: 0 },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  // Admin response
  adminResponse: {
    response: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
  // Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  // Moderation
  moderation: {
    flagged: { type: Boolean, default: false },
    flaggedReason: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound indexes
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1, product: 1 });

// Unique constraint - one review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Pre-save middleware to calculate average rating
reviewSchema.post('save', async function(doc) {
  await this.constructor.calculateAverageRating(doc.product);
});

// Pre-remove middleware to recalculate average rating
reviewSchema.post('remove', async function(doc) {
  await this.constructor.calculateAverageRating(doc.product);
});

reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length > 0) {
    const stats = result[0];
    
    // Calculate rating distribution
    const distribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    stats.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    // Update product with review stats
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(productId, {
      'reviewStats.averageRating': Math.round(stats.averageRating * 10) / 10,
      'reviewStats.totalReviews': stats.totalReviews,
      'reviewStats.ratingDistribution': distribution,
    });
  }
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
