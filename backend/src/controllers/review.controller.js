import ReviewService from '../services/review.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class ReviewController {
  async createReview(req, res, next) {
    try {
      const userId = req.user.id;
      const reviewData = req.body;

      if (!reviewData.productId || !reviewData.orderId || !reviewData.variantId || 
          !reviewData.rating || !reviewData.title || !reviewData.comment) {
        throw new ApiError(400, 'All review fields are required');
      }

      const review = await ReviewService.createReview(userId, reviewData);
      
      return ApiResponse.success(res, 'Review created successfully and pending approval', { review });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByProductId(req, res, next) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, rating, sortBy } = req.query;

      const filters = {};
      if (rating) filters.rating = parseInt(rating);

      const sortOptions = {};
      if (sortBy === 'helpful') {
        sortOptions['helpful.count'] = -1;
      } else if (sortBy === 'rating') {
        sortOptions.rating = -1;
      } else {
        sortOptions.createdAt = -1; // Default sort by date
      }

      const result = await ReviewService.getReviewsByProductId(
        productId, 
        parseInt(page), 
        parseInt(limit), 
        { ...filters, ...sortOptions }
      );
      
      return ApiResponse.success(res, 'Reviews retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByUserId(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await ReviewService.getReviewsByUserId(userId, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'User reviews retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getReviewById(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const review = await ReviewService.getReviewById(reviewId, userId);
      
      return ApiResponse.success(res, 'Review retrieved successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const review = await ReviewService.updateReview(reviewId, userId, updateData);
      
      return ApiResponse.success(res, 'Review updated successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const result = await ReviewService.deleteReview(reviewId, userId);
      
      return ApiResponse.success(res, result.message, {});
    } catch (error) {
      next(error);
    }
  }

  async toggleHelpfulVote(req, res, next) {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;

      const result = await ReviewService.toggleHelpfulVote(reviewId, userId);
      
      return ApiResponse.success(res, 'Helpful vote updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getOrdersEligibleForReview(req, res, next) {
    try {
      const userId = req.user.id;
      const eligibleProducts = await ReviewService.getOrdersEligibleForReview(userId);
      
      return ApiResponse.success(res, 'Eligible products for review retrieved successfully', {
        products: eligibleProducts
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin routes
  async approveReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const adminId = req.user.id;

      const review = await ReviewService.approveReview(reviewId, adminId);
      
      return ApiResponse.success(res, 'Review approved successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async rejectReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const adminId = req.user.id;
      const { reason } = req.body;

      if (!reason) {
        throw new ApiError(400, 'Rejection reason is required');
      }

      const review = await ReviewService.rejectReview(reviewId, adminId, reason);
      
      return ApiResponse.success(res, 'Review rejected successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async getPendingReviews(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await ReviewService.getPendingReviews(parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Pending reviews retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getFlaggedReviews(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await ReviewService.getFlaggedReviews(parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Flagged reviews retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async addAdminResponse(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { response } = req.body;
      const adminId = req.user.id;

      if (!response) {
        throw new ApiError(400, 'Admin response is required');
      }

      const review = await ReviewService.addAdminResponse(reviewId, response, adminId);
      
      return ApiResponse.success(res, 'Admin response added successfully', { review });
    } catch (error) {
      next(error);
    }
  }

  async getReviewTrends(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }

      const trends = await ReviewService.getReviewTrends(
        new Date(startDate), 
        new Date(endDate)
      );
      
      return ApiResponse.success(res, 'Review trends retrieved successfully', { trends });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
