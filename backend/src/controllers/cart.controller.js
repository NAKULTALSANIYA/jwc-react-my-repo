
import CartService from '../services/cart.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cart = await CartService.getCart(userId);
      
      return ApiResponse.success(res, 'Cart retrieved successfully', { cart });
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, variantId, quantity = 1 } = req.body;

      if (!productId || !variantId) {
        throw new ApiError(400, 'Product ID and variant ID are required');
      }

      const cart = await CartService.addToCart(userId, productId, variantId, quantity);
      
      return ApiResponse.success(res, 'Item added to cart successfully', { cart });
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { variantId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        throw new ApiError(400, 'Valid quantity is required');
      }

      const cart = await CartService.updateCartItem(userId, variantId, quantity);
      
      return ApiResponse.success(res, 'Cart item updated successfully', { cart });
    } catch (error) {
      next(error);
    }
  }

  async removeFromCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { variantId } = req.params;

      const cart = await CartService.removeFromCart(userId, variantId);
      
      return ApiResponse.success(res, 'Item removed from cart successfully', { cart });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await CartService.clearCart(userId);
      
      return ApiResponse.success(res, 'Cart cleared successfully', { cart: result });
    } catch (error) {
      next(error);
    }
  }

  async validateCart(req, res, next) {
    try {
      const userId = req.user.id;

      const validation = await CartService.validateCart(userId);
      
      return ApiResponse.success(res, 'Cart validation completed', { validation });
    } catch (error) {
      next(error);
    }
  }

  async getCartForCheckout(req, res, next) {
    try {
      const userId = req.user.id;

      const cartData = await CartService.getCartItemsForCheckout(userId);
      
      return ApiResponse.success(res, 'Cart items for checkout retrieved successfully', cartData);
    } catch (error) {
      next(error);
    }
  }

  async mergeGuestCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        throw new ApiError(400, 'Valid cart items are required');
      }

      const cart = await CartService.mergeGuestCart(userId, items);
      
      return ApiResponse.success(res, 'Guest cart merged successfully', { cart });
    } catch (error) {
      next(error);
    }
  }

  async getCartStats(req, res, next) {
    try {
      const stats = await CartService.getCartStats();
      
      return ApiResponse.success(res, 'Cart stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
