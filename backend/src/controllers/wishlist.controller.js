import WishlistService from '../services/wishlist.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class WishlistController {
  async getWishlist(req, res, next) {
    try {
      const userId = req.user.id;
      const wishlist = await WishlistService.getWishlist(userId);
      
      return ApiResponse.success(res, 'Wishlist retrieved successfully', { wishlist });
    } catch (error) {
      next(error);
    }
  }

  async addToWishlist(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, variantId } = req.body;

      if (!productId || !variantId) {
        throw new ApiError(400, 'Product ID and variant ID are required');
      }

      const wishlist = await WishlistService.addToWishlist(userId, productId, variantId);
      
      return ApiResponse.success(res, 'Item added to wishlist successfully', { wishlist });
    } catch (error) {
      next(error);
    }
  }

  async removeFromWishlist(req, res, next) {
    try {
      const userId = req.user.id;
      const { variantId } = req.params;

      const wishlist = await WishlistService.removeFromWishlist(userId, variantId);
      
      return ApiResponse.success(res, 'Item removed from wishlist successfully', { wishlist });
    } catch (error) {
      next(error);
    }
  }

  async clearWishlist(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await WishlistService.clearWishlist(userId);
      
      return ApiResponse.success(res, 'Wishlist cleared successfully', { wishlist: result });
    } catch (error) {
      next(error);
    }
  }

  async checkWishlistStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, variantId } = req.query;

      if (!productId || !variantId) {
        throw new ApiError(400, 'Product ID and variant ID are required');
      }

      const isInWishlist = await WishlistService.isInWishlist(userId, productId, variantId);
      
      return ApiResponse.success(res, 'Wishlist status retrieved successfully', { 
        isInWishlist 
      });
    } catch (error) {
      next(error);
    }
  }

  async validateWishlist(req, res, next) {
    try {
      const userId = req.user.id;

      const wishlist = await WishlistService.validateWishlist(userId);
      
      return ApiResponse.success(res, 'Wishlist validation completed', { wishlist });
    } catch (error) {
      next(error);
    }
  }

  async moveToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { variantId } = req.params;

      const result = await WishlistService.moveToCart(userId, variantId);
      
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async getWishlistStats(req, res, next) {
    try {
      const stats = await WishlistService.getWishlistStats();
      
      return ApiResponse.success(res, 'Wishlist stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }

  async getMostWishedProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const products = await WishlistService.getMostWishedProducts(parseInt(limit));
      
      return ApiResponse.success(res, 'Most wished products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }
}

export default new WishlistController();
