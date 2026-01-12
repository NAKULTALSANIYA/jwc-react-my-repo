import WishlistDAO from '../dao/wishlist.dao.js';
import CartDAO from '../dao/cart.dao.js';
import ProductService from './product.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class WishlistService {
  async getWishlist(userId) {
    try {
      const wishlist = await WishlistDAO.findByUserId(userId);
      if (!wishlist) {
        return { items: [], totalItems: 0, version: 0 };
      }
      
      // Enrich wishlist items with current pricing
      return this._enrichWishlistWithPrices(wishlist);
    } catch (error) {
      logger.error('Get wishlist error:', error);
      throw error;
    }
  }

  _enrichWishlistWithPrices(wishlist) {
    /**
     * Enrich wishlist items with server-side calculated prices
     */
    const enrichedItems = wishlist.items.map(item => {
      const product = item.product;
      const variant = product?.variants?.id(item.variantId);

      if (variant) {
        return {
          _id: item._id,
          product: item.product,
          variantId: item.variantId,
          addedAt: item.addedAt,
          // Prices calculated server-side
          price: variant.price,
          finalPrice: variant.finalPrice,
          discountPrice: variant.price - variant.finalPrice,
          inStock: variant.stock > 0
        };
      }

      return item;
    });

    return {
      _id: wishlist._id,
      user: wishlist.user,
      items: enrichedItems,
      totalItems: wishlist.totalItems,
      version: wishlist.version,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt
    };
  }

  async addToWishlist(userId, productId, variantId) {
    try {
      // Validate product and variant
      const product = await ProductService.getProductById(productId);
      const variant = product.variants.id(variantId);

      if (!variant) {
        throw new ApiError(404, 'Variant not found');
      }

      if (!variant.isActive) {
        throw new ApiError(400, 'Variant is not available');
      }

      // Check if item already exists in wishlist
      const existingItem = await WishlistDAO.findItem(userId, variantId);

      if (existingItem) {
        throw new ApiError(400, 'Item already exists in wishlist');
      }

      const itemData = {
        product: productId,
        variantId,
        addedAt: new Date(),
        // NO prices stored - calculated server-side
      };

      const wishlist = await WishlistDAO.addItem(userId, itemData);

      logger.info(`Item added to wishlist: ${product.name} (${variant.size}, ${variant.color}) for user ${userId}`);
      return this._enrichWishlistWithPrices(wishlist);
    } catch (error) {
      logger.error('Add to wishlist error:', error);
      throw error;
    }
  }

  async removeFromWishlist(userId, variantId) {
    try {
      const wishlist = await WishlistDAO.findByUserId(userId);
      const item = wishlist?.items.find(item =>
        item.variantId.toString() === variantId
      );

      if (!item) {
        throw new ApiError(404, 'Item not found in wishlist');
      }

      const updatedWishlist = await WishlistDAO.removeItem(userId, variantId);

      logger.info(`Item removed from wishlist: ${item.product.name} (${variantId}) for user ${userId}`);
      return this._enrichWishlistWithPrices(updatedWishlist);
    } catch (error) {
      logger.error('Remove from wishlist error:', error);
      throw error;
    }
  }

  async clearWishlist(userId) {
    try {
      const wishlist = await WishlistDAO.findByUserId(userId);
      if (!wishlist || wishlist.items.length === 0) {
        throw new ApiError(404, 'Wishlist is already empty');
      }

      const updatedWishlist = await WishlistDAO.clearWishlist(userId);

      logger.info(`Wishlist cleared for user ${userId}`);
      return updatedWishlist;
    } catch (error) {
      logger.error('Clear wishlist error:', error);
      throw error;
    }
  }

  async isInWishlist(userId, productId, variantId) {
    try {
      return await WishlistDAO.isInWishlist(userId, productId, variantId);
    } catch (error) {
      logger.error('Check wishlist status error:', error);
      throw error;
    }
  }

  async validateWishlist(userId) {
    try {
      const wishlist = await WishlistDAO.removeInvalidItems(userId);
      return wishlist;
    } catch (error) {
      logger.error('Validate wishlist error:', error);
      throw error;
    }
  }

  async moveToCart(userId, variantId) {
    /**
     * Atomic operation: Move item from wishlist to cart using transaction
     * Prevents race conditions and partial updates
     */
    try {
      const wishlist = await WishlistDAO.findByUserId(userId);
      const item = wishlist?.items.find(item =>
        item.variantId.toString() === variantId
      );

      if (!item) {
        throw new ApiError(404, 'Item not found in wishlist');
      }

      const product = item.product;
      const variant = product.variants.id(variantId);

      if (!variant || !variant.isActive) {
        throw new ApiError(400, 'Variant is no longer available');
      }

      if (variant.stock < 1) {
        throw new ApiError(400, 'Variant is out of stock');
      }

      // Use atomic transaction to move item
      const cartItemData = {
        product: product._id,
        variantId,
        quantity: 1,
        // NO prices stored - calculated server-side
      };

      await CartDAO.moveWishlistItemToCart(userId, variantId, cartItemData);

      // Recalculate cart totals
      const cart = await CartDAO.calculateAndUpdateTotals(userId);

      logger.info(`Item moved from wishlist to cart: ${product.name} (${variant.size}, ${variant.color}) for user ${userId}`);
      return {
        cart: this._enrichCartWithPrices(cart),
        message: 'Item moved to cart successfully'
      };
    } catch (error) {
      logger.error('Move to cart error:', error);
      throw error;
    }
  }

  _enrichCartWithPrices(cart) {
    /**
     * Enrich cart items with prices calculated server-side
     */
    let totalPrice = 0;
    let totalDiscount = 0;
    let finalAmount = 0;

    const enrichedItems = cart.items.map(item => {
      const product = item.product;
      const variant = product?.variants?.id(item.variantId);

      if (variant) {
        const price = variant.price;
        const finalPrice = variant.finalPrice;
        const itemDiscount = price - finalPrice;

        totalPrice += price * item.quantity;
        finalAmount += finalPrice * item.quantity;
        totalDiscount += itemDiscount * item.quantity;

        return {
          _id: item._id,
          product: item.product,
          variantId: item.variantId,
          quantity: item.quantity,
          price,
          discountPrice: itemDiscount,
          finalPrice,
          timestamps: item.timestamps
        };
      }

      return item;
    });

    return {
      _id: cart._id,
      user: cart.user,
      items: enrichedItems,
      totalItems: cart.totalItems,
      totalPrice,
      totalDiscount,
      finalAmount,
      version: cart.version,
      isLocked: cart.isLocked,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }

  async getWishlistStats() {
    try {
      const stats = await WishlistDAO.getWishlistStats();
      return stats;
    } catch (error) {
      logger.error('Get wishlist stats error:', error);
      throw error;
    }
  }

  async getMostWishedProducts(limit = 10) {
    try {
      const products = await WishlistDAO.getMostWishedProducts(limit);
      return products;
    } catch (error) {
      logger.error('Get most wished products error:', error);
      throw error;
    }
  }

  async getWishlistItemsForCheckout(userId) {
    try {
      const wishlist = await WishlistDAO.findByUserId(userId);
      if (!wishlist || wishlist.items.length === 0) {
        return { items: [], totalItems: 0, version: 0 };
      }

      // Validate wishlist items
      const validatedWishlist = await this.validateWishlist(userId);

      const availableItems = validatedWishlist?.items || [];

      return {
        items: this._enrichWishlistWithPrices(validatedWishlist).items,
        totalItems: availableItems.length,
        version: validatedWishlist.version
      };
    } catch (error) {
      logger.error('Get wishlist items for checkout error:', error);
      throw error;
    }
  }
}

export default new WishlistService();
