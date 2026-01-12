
import CartDAO from '../dao/cart.dao.js';
import ProductService from './product.service.js';
import InventoryService from './inventory.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class CartService {
  async getCart(userId) {
    try {
      const cart = await CartDAO.findByUserId(userId);
      
      if (!cart) {
        return { items: [], totalItems: 0, totalPrice: 0, totalDiscount: 0, finalAmount: 0, version: 0 };
      }

      // Recalculate prices server-side
      const cartWithPrices = this._enrichCartWithPrices(cart);
      return cartWithPrices;
    } catch (error) {
      logger.error('Get cart error:', error);
      throw error;
    }
  }

  _enrichCartWithPrices(cart) {
    /**
     * Enrich cart items with prices calculated server-side
     * Prices are NOT stored in DB - only recalculated on retrieval
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
          // Prices calculated server-side
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

  async addToCart(userId, productId, variantId, quantity = 1) {
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

      // Check stock availability
      if (variant.stock < quantity) {
        throw new ApiError(400, 'Insufficient stock');
      }

      // Check if item already exists in cart
      const existingItem = await CartDAO.findItem(userId, variantId);

      let cart;
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > 10) {
          throw new ApiError(400, 'Maximum 10 items per variant allowed');
        }

        if (variant.stock < newQuantity) {
          throw new ApiError(400, 'Insufficient stock for requested quantity');
        }

        // Update existing item
        cart = await CartDAO.updateItem(userId, variantId, newQuantity);
      } else {
        // Add new item - NO prices stored, only IDs and quantity
        const cartItemData = {
          product: productId,
          variantId,
          quantity,
          // NO price fields - calculated server-side
        };

        cart = await CartDAO.addItem(userId, cartItemData);
      }

      // Recalculate and update totals
      cart = await CartDAO.calculateAndUpdateTotals(userId);

      logger.info(`Item added to cart: ${product.name} (${variant.size}, ${variant.color}) x${quantity} for user ${userId}`);
      return this._enrichCartWithPrices(cart);
    } catch (error) {
      logger.error('Add to cart error:', error);
      throw error;
    }
  }

  async updateCartItem(userId, variantId, quantity) {
    try {
      if (quantity < 0 || quantity > 10) {
        throw new ApiError(400, 'Quantity must be between 0 and 10');
      }

      // If quantity is 0, remove the item
      if (quantity === 0) {
        return await this.removeFromCart(userId, variantId);
      }

      // Validate stock availability
      const cart = await CartDAO.findByUserId(userId);
      const item = cart?.items.find(item => item.variantId.toString() === variantId);

      if (!item) {
        throw new ApiError(404, 'Item not found in cart');
      }

      const product = await ProductService.getProductById(item.product._id);
      const variant = product.variants.id(variantId);

      if (variant.stock < quantity) {
        throw new ApiError(400, 'Insufficient stock');
      }

      const updatedCart = await CartDAO.updateItem(userId, variantId, quantity);

      // Recalculate totals
      const cartWithTotals = await CartDAO.calculateAndUpdateTotals(userId);

      logger.info(`Cart item updated: ${product.name} (${variant.size}, ${variant.color}) quantity set to ${quantity} for user ${userId}`);
      return this._enrichCartWithPrices(cartWithTotals);
    } catch (error) {
      logger.error('Update cart item error:', error);
      throw error;
    }
  }

  async removeFromCart(userId, variantId) {
    try {
      const cart = await CartDAO.findByUserId(userId);
      const item = cart?.items.find(item => item.variantId.toString() === variantId);

      if (!item) {
        throw new ApiError(404, 'Item not found in cart');
      }

      const product = await ProductService.getProductById(item.product._id);

      const updatedCart = await CartDAO.removeItem(userId, variantId);

      // Recalculate totals
      const cartWithTotals = await CartDAO.calculateAndUpdateTotals(userId);

      logger.info(`Item removed from cart: ${product.name} (${item.variantId}) for user ${userId}`);
      return this._enrichCartWithPrices(cartWithTotals);
    } catch (error) {
      logger.error('Remove from cart error:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      const cart = await CartDAO.findByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new ApiError(404, 'Cart is already empty');
      }

      const updatedCart = await CartDAO.clearCart(userId);

      logger.info(`Cart cleared for user ${userId}`);
      return updatedCart;
    } catch (error) {
      logger.error('Clear cart error:', error);
      throw error;
    }
  }

  async lockCart(userId) {
    /**
     * Lock cart for payment processing
     * Prevents concurrent modifications during checkout
     */
    try {
      const cart = await CartDAO.lockCart(userId);
      logger.info(`Cart locked for user ${userId}`);
      return cart;
    } catch (error) {
      logger.error('Lock cart error:', error);
      throw error;
    }
  }

  async unlockCart(userId) {
    /**
     * Unlock cart after payment failure or cancellation
     * Allows user to modify cart again
     */
    try {
      const cart = await CartDAO.unlockCart(userId);
      logger.info(`Cart unlocked for user ${userId}`);
      return cart;
    } catch (error) {
      logger.error('Unlock cart error:', error);
      throw error;
    }
  }

  async validateCart(userId, autoRemove = false) {
    try {
      const validation = await CartDAO.validateCartItems(userId, { autoRemove });

      if (!validation.isValid) {
        logger.warn(`Cart validation failed for user ${userId}`, {
          invalidItems: validation.invalidItems
        });
      }

      return validation;
    } catch (error) {
      logger.error('Validate cart error:', error);
      throw error;
    }
  }

  async getCartItemsForCheckout(userId) {
    try {
      const cart = await CartDAO.findByUserId(userId);
      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Cart is empty');
      }

      // Check if cart is already locked
      if (cart.isLocked) {
        const lockAgeMs = cart.lockedAt ? (Date.now() - new Date(cart.lockedAt).getTime()) : 0;
        const isStaleLock = !cart.lockedAt || lockAgeMs > 5 * 60 * 1000; // 5 minutes

        if (isStaleLock) {
          logger.warn(`Cart lock stale for user ${userId}, auto-unlocking`);
          await this.unlockCart(userId);
        } else {
          // Active lock, surface conflict so client can retry once it clears
          throw new ApiError(409, 'Cart is currently locked for payment processing');
        }
      }

      // Validate cart items and auto-remove invalid ones during checkout
      const validation = await this.validateCart(userId, true);

      if (!validation.isValid) {
        throw new ApiError(400, 'Some items in cart are no longer available', {
          invalidItems: validation.invalidItems
        });
      }

      // Get fresh cart data
      const freshCart = await CartDAO.findByUserId(userId);

      // Validate stock for checkout
      const orders = freshCart.items.map(item => ({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      await InventoryService.preventOverselling(orders);

      // Lock cart for payment processing
      await this.lockCart(userId);

      const enrichedCart = this._enrichCartWithPrices(freshCart);
      return {
        items: enrichedCart.items,
        totalItems: enrichedCart.totalItems,
        totalPrice: enrichedCart.totalPrice,
        totalDiscount: enrichedCart.totalDiscount,
        finalAmount: enrichedCart.finalAmount,
        cartVersion: enrichedCart.version
      };
    } catch (error) {
      logger.error('Get cart items for checkout error:', error);
      throw error;
    }
  }

  async getCartStats() {
    try {
      const stats = await CartDAO.getCartStats();
      return stats;
    } catch (error) {
      logger.error('Get cart stats error:', error);
      throw error;
    }
  }

  async mergeGuestCart(userId, guestCartItems) {
    /**
     * Merge guest cart (from localStorage) with user's database cart
     * Handles duplicate resolution by summing quantities (max 10)
     * Validates stock and removes invalid items
     */
    try {
      if (!guestCartItems || guestCartItems.length === 0) {
        return await this.getCart(userId);
      }

      let cart = await CartDAO.findByUserId(userId);

      for (const guestItem of guestCartItems) {
        try {
          // Validate each item
          const product = await ProductService.getProductById(guestItem.productId);
          const variant = product.variants.id(guestItem.variantId);

          if (variant && variant.isActive && variant.stock >= guestItem.quantity) {
            // Use addToCart which handles duplicate resolution
            await this.addToCart(userId, guestItem.productId, guestItem.variantId, guestItem.quantity);
          } else if (!variant || !variant.isActive) {
            logger.warn(`Skipped unavailable guest cart item: ${guestItem.productId}-${guestItem.variantId}`);
          } else {
            logger.warn(`Skipped guest cart item due to insufficient stock: ${guestItem.productId}-${guestItem.variantId}`);
          }
        } catch (error) {
          // Skip invalid items
          logger.warn(`Skipped invalid guest cart item: ${guestItem.productId}-${guestItem.variantId}`, error.message);
        }
      }

      cart = await this.getCart(userId);
      logger.info(`Guest cart merged for user ${userId}: ${guestCartItems.length} items processed`);
      return cart;
    } catch (error) {
      logger.error('Merge guest cart error:', error);
      throw error;
    }
  }
}

export default new CartService()