import ReviewDAO from '../dao/review.dao.js';
import OrderDAO from '../dao/order.dao.js';
import ProductService from './product.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class ReviewService {
  async createReview(userId, reviewData) {
    try {
      const { productId, orderId, variantId, rating, title, comment, images } = reviewData;

      // Verify user has purchased this product
      const order = await OrderDAO.findById(orderId);
      if (!order || order.user.toString() !== userId) {
        throw new ApiError(403, 'You can only review products from your orders');
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        throw new ApiError(400, 'You can only review products from delivered orders');
      }

      // Check if user has already reviewed this product for this order
      const hasReviewed = await ReviewDAO.hasUserReviewedProduct(userId, productId, orderId);
      if (hasReviewed) {
        throw new ApiError(400, 'You have already reviewed this product for this order');
      }

      // Verify the product and variant are in the order
      const orderItem = order.items.find(item => 
        item.product.toString() === productId && 
        item.variantId.toString() === variantId
      );

      if (!orderItem) {
        throw new ApiError(400, 'Product variant not found in the specified order');
      }

      // Create review
      const review = await ReviewDAO.create({
        product: productId,
        user: userId,
        order: orderId,
        variantId,
        rating,
        title,
        comment,
        images: images || [],
        status: 'pending', // Requires moderation
        isVerified: true, // Verified buyer
      });

      logger.info(`Review created: ${review._id} for product ${productId} by user ${userId}`);
      return review;
    } catch (error) {
      logger.error('Create review error:', error);
      throw error;
    }
  }

  async getReviewsByProductId(productId, page = 1, limit = 10, filters = {}) {
    try {
      const reviews = await ReviewDAO.findByProductId(productId, page, limit, filters);
      const total = await ReviewDAO.countByProductId(productId);

      // Get review statistics
      const stats = await this.getReviewStats(productId);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        stats,
      };
    } catch (error) {
      logger.error('Get reviews by product error:', error);
      throw error;
    }
  }

  async getReviewsByUserId(userId, page = 1, limit = 10) {
    try {
      const reviews = await ReviewDAO.findByUserId(userId, page, limit);
      const total = await ReviewDAO.countByUserId ? ReviewDAO.countByUserId(userId) : reviews.length;

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get reviews by user error:', error);
      throw error;
    }
  }

  async getReviewById(id, userId) {
    try {
      const review = await ReviewDAO.findByIdAndUser(id, userId);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      return review;
    } catch (error) {
      logger.error('Get review by ID error:', error);
      throw error;
    }
  }

  async updateReview(id, userId, updateData) {
    try {
      const review = await ReviewDAO.findByIdAndUser(id, userId);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Only allow updates for pending reviews
      if (review.status !== 'pending') {
        throw new ApiError(400, 'Cannot update review after moderation');
      }

      const updatedReview = await ReviewDAO.updateById(id, updateData);

      logger.info(`Review updated: ${id} by user ${userId}`);
      return updatedReview;
    } catch (error) {
      logger.error('Update review error:', error);
      throw error;
    }
  }

  async deleteReview(id, userId) {
    try {
      const review = await ReviewDAO.findByIdAndUser(id, userId);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      await ReviewDAO.deleteById(id);

      logger.info(`Review deleted: ${id} by user ${userId}`);
      return { message: 'Review deleted successfully' };
    } catch (error) {
      logger.error('Delete review error:', error);
      throw error;
    }
  }

  async approveReview(id, adminId) {
    try {
      const review = await ReviewDAO.approveReview(id, adminId);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      logger.info(`Review approved: ${id} by admin ${adminId}`);
      return review;
    } catch (error) {
      logger.error('Approve review error:', error);
      throw error;
    }
  }

  async rejectReview(id, adminId, reason) {
    try {
      const review = await ReviewDAO.rejectReview(id, adminId, reason);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      logger.info(`Review rejected: ${id} by admin ${adminId}`);
      return review;
    } catch (error) {
      logger.error('Reject review error:', error);
      throw error;
    }
  }

  async getPendingReviews(page = 1, limit = 10) {
    try {
      const reviews = await ReviewDAO.findPendingReviews(page, limit);
      const total = await ReviewDAO.countPending();

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get pending reviews error:', error);
      throw error;
    }
  }

  async getFlaggedReviews(page = 1, limit = 10) {
    try {
      const reviews = await ReviewDAO.getFlaggedReviews(page, limit);
      const total = await ReviewDAO.countFlagged();

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get flagged reviews error:', error);
      throw error;
    }
  }

  async toggleHelpfulVote(id, userId) {
    try {
      const review = await ReviewDAO.findById(id);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      const hasVoted = review.helpful.users.includes(userId);
      const isHelpful = !hasVoted;

      const updatedReview = await ReviewDAO.updateHelpfulVotes(id, userId, isHelpful);

      // Update helpful count
      await ReviewDAO.updateById(id, {
        'helpful.count': updatedReview.helpful.users.length,
      });

      logger.info(`Helpful vote toggled: ${isHelpful ? 'added' : 'removed'} for review ${id} by user ${userId}`);
      return { isHelpful, helpfulCount: updatedReview.helpful.users.length };
    } catch (error) {
      logger.error('Toggle helpful vote error:', error);
      throw error;
    }
  }

  async addAdminResponse(id, response, adminId) {
    try {
      const review = await ReviewDAO.addAdminResponse(id, response, adminId);
      
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      logger.info(`Admin response added to review: ${id} by admin ${adminId}`);
      return review;
    } catch (error) {
      logger.error('Add admin response error:', error);
      throw error;
    }
  }

  async getReviewStats(productId) {
    try {
      const stats = await ReviewDAO.getReviewStats(productId);
      return stats;
    } catch (error) {
      logger.error('Get review stats error:', error);
      throw error;
    }
  }

  async getTopReviews(productId, limit = 5) {
    try {
      const reviews = await ReviewDAO.getTopReviews(productId, limit);
      return reviews;
    } catch (error) {
      logger.error('Get top reviews error:', error);
      throw error;
    }
  }

  async getRecentReviews(limit = 10) {
    try {
      const reviews = await ReviewDAO.getRecentReviews(limit);
      return reviews;
    } catch (error) {
      logger.error('Get recent reviews error:', error);
      throw error;
    }
  }

  async getReviewTrends(startDate, endDate) {
    try {
      const trends = await ReviewDAO.getReviewTrends(startDate, endDate);
      return trends;
    } catch (error) {
      logger.error('Get review trends error:', error);
      throw error;
    }
  }

  async getOrdersEligibleForReview(userId) {
    try {
      // Find delivered orders
      const deliveredOrders = await OrderDAO.findByUserIdAndStatus(userId, 'delivered', 1, 100);
      
      const eligibleProducts = [];
      
      for (const order of deliveredOrders) {
        for (const item of order.items) {
          // Check if user has already reviewed this product
          const hasReviewed = await ReviewDAO.hasUserReviewedProduct(
            userId, 
            item.product._id, 
            order._id
          );

          if (!hasReviewed) {
            eligibleProducts.push({
              order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                deliveredAt: order.tracking?.actualDeliveryDate,
              },
              product: {
                _id: item.product._id,
                name: item.product.name,
                slug: item.product.slug,
                images: item.product.images,
                variant: {
                  _id: item.variantId,
                  size: item.variantDetails.size,
                  color: item.variantDetails.color,
                  sku: item.variantDetails.sku,
                },
              },
            });
          }
        }
      }

      return eligibleProducts;
    } catch (error) {
      logger.error('Get eligible orders for review error:', error);
      throw error;
    }
  }
}

export default new ReviewService();
