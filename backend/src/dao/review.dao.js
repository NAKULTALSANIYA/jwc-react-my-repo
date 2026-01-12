import Review from '../models/review.model.js';

class ReviewDAO {
  async create(reviewData) {
    const review = new Review(reviewData);
    return await review.save();
  }

  async findById(id) {
    return await Review.findById(id)
      .populate('user', 'name email')
      .populate('product', 'name slug images')
      .populate('order', 'orderNumber');
  }

  async findByProductId(productId, page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const query = { product: productId, status: 'approved', ...filters };
    
    return await Review.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async findByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Review.find({ user: userId })
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async findByOrderId(orderId) {
    return await Review.find({ order: orderId })
      .populate('product', 'name slug images')
      .populate('user', 'name email');
  }

  async findPendingReviews(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Review.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async updateById(id, updateData) {
    return await Review.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('user', 'name email')
     .populate('product', 'name slug images')
     .populate('order', 'orderNumber');
  }

  async approveReview(id, adminId) {
    return await this.updateById(id, {
      status: 'approved',
      'moderation.reviewedBy': adminId,
      'moderation.reviewedAt': new Date(),
    });
  }

  async rejectReview(id, adminId, reason) {
    return await this.updateById(id, {
      status: 'rejected',
      'moderation.reviewedBy': adminId,
      'moderation.reviewedAt': new Date(),
      'moderation.flagged': true,
      'moderation.flaggedReason': reason,
    });
  }

  async deleteById(id) {
    return await Review.findByIdAndDelete(id);
  }

  async findByIdAndUser(id, userId) {
    return await Review.findOne({ _id: id, user: userId })
      .populate('product', 'name slug images')
      .populate('order', 'orderNumber');
  }

  async hasUserReviewedProduct(userId, productId, orderId) {
    const review = await Review.findOne({
      user: userId,
      product: productId,
      order: orderId,
    });
    return !!review;
  }

  async updateHelpfulVotes(id, userId, isHelpful) {
    const updateOperation = isHelpful 
      ? { $addToSet: { 'helpful.users': userId } }
      : { $pull: { 'helpful.users': userId } };

    return await Review.findByIdAndUpdate(id, updateOperation, { new: true });
  }

  async getReviewStats(productId) {
    const pipeline = [
      {
        $match: {
          product: productId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ];

    const result = await Review.aggregate(pipeline);
    
    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    result.forEach(item => {
      distribution[item._id] = item.count;
    });

    // Get total count
    const totalReviews = await Review.countDocuments({
      product: productId,
      status: 'approved'
    });

    return {
      distribution,
      totalReviews,
    };
  }

  async getTopReviews(productId, limit = 5) {
    return await Review.find({
      product: productId,
      status: 'approved',
      rating: { $gte: 4 }
    })
      .populate('user', 'name')
      .sort({ 'helpful.count': -1, createdAt: -1 })
      .limit(parseInt(limit));
  }

  async getRecentReviews(limit = 10) {
    return await Review.find({ status: 'approved' })
      .populate('user', 'name')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getReviewTrends(startDate, endDate) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          ratings: { $push: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalReviews: 1,
          avgRating: { $round: ['$avgRating', 2] },
          _id: 0
        }
      }
    ];

    return await Review.aggregate(pipeline);
  }

  async getFlaggedReviews(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Review.find({
      $or: [
        { 'moderation.flagged': true },
        { status: 'rejected' }
      ]
    })
      .populate('user', 'name email')
      .populate('product', 'name slug')
      .sort({ 'moderation.reviewedAt': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
  }

  async addAdminResponse(id, response, adminId) {
    return await this.updateById(id, {
      'adminResponse.response': response,
      'adminResponse.respondedBy': adminId,
      'adminResponse.respondedAt': new Date(),
    });
  }

  async countByProductId(productId) {
    return await Review.countDocuments({ 
      product: productId, 
      status: 'approved' 
    });
  }

  async countPending() {
    return await Review.countDocuments({ status: 'pending' });
  }

  async countFlagged() {
    return await Review.countDocuments({ 
      'moderation.flagged': true 
    });
  }
}

export default new ReviewDAO();
