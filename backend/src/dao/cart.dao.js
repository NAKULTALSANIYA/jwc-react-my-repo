
import Cart from '../models/cart.model.js';
import mongoose from 'mongoose';

class CartDAO {
  async findByUserId(userId) {
    return await Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug images category brand variants isActive status'
      });
  }

  async create(cartData) {
    const cart = new Cart(cartData);
    return await cart.save();
  }

  async findById(id) {
    return await Cart.findById(id)
      .populate({
        path: 'items.product',
        select: 'name slug images category brand variants isActive status'
      });
  }

  async updateByUserId(userId, updateData) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand variants isActive status'
    });
  }

  async addItem(userId, itemData) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      {
        $push: {
          items: itemData
        }
      },
      { new: true, upsert: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand variants isActive status'
    });
  }

  async updateItem(userId, variantId, quantity) {
    const updateQuery = {
      user: userId,
      'items.variantId': variantId
    };

    const updateData = quantity === 0 
      ? { $pull: { items: { variantId } } }
      : { $set: { 'items.$.quantity': quantity } };

    return await Cart.findOneAndUpdate(
      updateQuery,
      updateData,
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand variants isActive status'
    });
  }

  async removeItem(userId, variantId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { variantId } } },
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand variants isActive status'
    });
  }

  async clearCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { 
        $set: { 
          items: [],
          isLocked: false,
          lockedAt: null,
        } 
      },
      { new: true }
    );
  }

  async lockCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { 
        $set: { 
          isLocked: true,
          lockedAt: new Date()
        }
      },
      { new: true }
    );
  }

  async unlockCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { 
        $set: { 
          isLocked: false,
          lockedAt: null
        }
      },
      { new: true }
    );
  }

  async deleteByUserId(userId) {
    return await Cart.findOneAndDelete({ user: userId });
  }

  async findItem(userId, variantId) {
    const cart = await this.findByUserId(userId);
    if (!cart) return null;

    return cart.items.find(item => item.variantId.toString() === variantId.toString());
  }

  // Removed updateItemPrice method - prices are calculated server-side only
  
  async calculateAndUpdateTotals(userId) {
    const cart = await this.findByUserId(userId);
    if (!cart || cart.items.length === 0) return cart;

    // Recalculate all prices server-side
    let totalPrice = 0;
    let totalDiscount = 0;
    let finalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      const variant = product?.variants?.id(item.variantId);
      
      if (variant) {
        const itemPrice = variant.price * item.quantity;
        const itemFinalPrice = variant.finalPrice * item.quantity;
        const itemDiscount = itemPrice - itemFinalPrice;

        totalPrice += itemPrice;
        totalDiscount += itemDiscount;
        finalAmount += itemFinalPrice;
      }
    }

    return await Cart.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          totalPrice,
          totalDiscount,
          finalAmount
        }
      },
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand variants isActive status'
    });
  }

  async validateCartItems(userId, options = { autoRemove: false }) {
    const cart = await this.findByUserId(userId);
    if (!cart) return { isValid: true, invalidItems: [] };

    const invalidItems = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        invalidItems.push({
          variantId: item.variantId,
          reason: 'Product not available',
          productName: product?.name || 'Unknown'
        });
        continue;
      }

      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive) {
        invalidItems.push({
          variantId: item.variantId,
          reason: 'Variant not available',
          productName: product.name
        });
        continue;
      }

      if (variant.stock < item.quantity) {
        invalidItems.push({
          variantId: item.variantId,
          reason: 'Insufficient stock',
          availableStock: variant.stock,
          requestedQuantity: item.quantity,
          productName: product.name
        });
        continue;
      }

      validItems.push(item);
    }

    // Only remove invalid items if explicitly requested
    if (options.autoRemove && invalidItems.length > 0) {
      const validVariantIds = validItems.map(item => item.variantId);
      await Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { variantId: { $nin: validVariantIds } } } },
        { new: true }
      );
    }

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
      validItems
    };
  }

  async getCartStats() {
    const stats = await Cart.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalCarts: { $addToSet: '$_id' },
          totalItems: { $sum: '$items.quantity' },
          totalValue: { $sum: '$finalAmount' },
          avgItemsPerCart: { $avg: '$items.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          totalCarts: { $size: '$totalCarts' },
          totalItems: 1,
          totalValue: 1,
          avgItemsPerCart: { $round: ['$avgItemsPerCart', 2] }
        }
      }
    ]);

    return stats[0] || {
      totalCarts: 0,
      totalItems: 0,
      totalValue: 0,
      avgItemsPerCart: 0
    };
  }

  // Transaction-based wishlist to cart move
  async moveWishlistItemToCart(userId, variantId, wishlistItemData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Add to cart
      await Cart.findOneAndUpdate(
        { user: userId },
        { $push: { items: wishlistItemData } },
        { new: true, session }
      );

      // Remove from wishlist
      const Wishlist = (await import('../models/wishlist.model.js')).default;
      await Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { variantId } } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

export default new CartDAO();
