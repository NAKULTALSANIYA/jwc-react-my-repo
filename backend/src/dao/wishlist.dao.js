import Wishlist from '../models/wishlist.model.js';

class WishlistDAO {
  async findByUserId(userId) {
    return await Wishlist.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug images category brand price finalPrice variants',
        populate: { path: 'category', select: 'name slug' }
      });
  }

  async create(wishlistData) {
    const wishlist = new Wishlist(wishlistData);
    return await wishlist.save();
  }

  async updateByUserId(userId, updateData) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true, upsert: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand price finalPrice variants',
      populate: { path: 'category', select: 'name slug' }
    });
  }

  async addItem(userId, itemData) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $addToSet: {
          items: itemData
        }
      },
      { new: true, upsert: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand price finalPrice variants',
      populate: { path: 'category', select: 'name slug' }
    });
  }

  async removeItem(userId, variantId) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { variantId } } },
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand price finalPrice variants',
      populate: { path: 'category', select: 'name slug' }
    });
  }

  async clearWishlist(userId) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );
  }

  async deleteByUserId(userId) {
    return await Wishlist.findOneAndDelete({ user: userId });
  }

  async findItem(userId, variantId) {
    const wishlist = await this.findByUserId(userId);
    if (!wishlist) return null;

    return wishlist.items.find(item => 
      item.variantId.toString() === variantId.toString()
    );
  }

  async isInWishlist(userId, productId, variantId) {
    const wishlist = await this.findByUserId(userId);
    if (!wishlist) return false;

    return wishlist.items.some(item => 
      item.product._id.toString() === productId.toString() &&
      item.variantId.toString() === variantId.toString()
    );
  }

  async removeInvalidItems(userId) {
    const wishlist = await this.findByUserId(userId);
    if (!wishlist) return null;

    const validItems = wishlist.items.filter(item => item.product && item.product.isActive);
    
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { items: validItems } },
      { new: true }
    ).populate({
      path: 'items.product',
      select: 'name slug images category brand price finalPrice variants variants',
      populate: { path: 'category', select: 'name slug' }
    });
  }

  async getWishlistStats() {
    const stats = await Wishlist.aggregate([
      {
        $group: {
          _id: null,
          totalWishlists: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          avgItemsPerWishlist: { $avg: '$totalItems' }
        }
      },
      {
        $project: {
          _id: 0,
          totalWishlists: 1,
          totalItems: 1,
          avgItemsPerWishlist: { $round: ['$avgItemsPerWishlist', 2] }
        }
      }
    ]);

    return stats[0] || {
      totalWishlists: 0,
      totalItems: 0,
      avgItemsPerWishlist: 0
    };
  }

  async getMostWishedProducts(limit = 10) {
    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          wishlistCount: { $sum: 1 },
          addedCount: { $sum: 1 }
        }
      },
      { $sort: { wishlistCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
          pipeline: [
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
              }
            },
            { $unwind: '$category' }
          ]
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          product: '$product',
          wishlistCount: 1,
          addedCount: 1
        }
      }
    ];

    return await Wishlist.aggregate(pipeline);
  }
}

export default new WishlistDAO();
