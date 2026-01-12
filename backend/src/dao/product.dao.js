
import Product from '../models/product.model.js';

class ProductDAO {
  async create(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async findById(id) {
    return await Product.findById(id).populate('category');
  }

  async findBySlug(slug) {
    return await Product.findOne({ slug }).populate('category');
  }

  async findBySku(sku) {
    return await Product.findOne({ 'variants.sku': sku });
  }

  async findAll(filters = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    const query = Product.find(filters);
    
    return await query
      .populate('category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);
  }

  async count(filters = {}) {
    return await Product.countDocuments(filters);
  }

  async updateById(id, updateData) {
    // Use finalPrice from frontend instead of recalculating
    // Frontend handles the calculation based on price and discount

    if (updateData.variants && Array.isArray(updateData.variants)) {
      const { variants, ...otherData } = updateData;

      // Build the update object with individual field updates for variants
      const updateObj = { ...otherData };

      // For each variant, update ALL fields including finalPrice from frontend
      variants.forEach((variant, index) => {
        updateObj[`variants.${index}.size`] = variant.size;
        updateObj[`variants.${index}.color`] = variant.color;
        updateObj[`variants.${index}.sku`] = variant.sku;
        updateObj[`variants.${index}.price`] = Number(variant.price);
        updateObj[`variants.${index}.discountPercentage`] = Number(variant.discountPercentage) || 0;
        updateObj[`variants.${index}.stock`] = Number(variant.stock);
        updateObj[`variants.${index}.lowStockThreshold`] = Number(variant.lowStockThreshold) || 5;
        updateObj[`variants.${index}.isActive`] = variant.isActive !== false;

        // Use finalPrice from frontend (already calculated there)
        updateObj[`variants.${index}.finalPrice`] = Number(variant.finalPrice);
      });

      return await Product.findByIdAndUpdate(
        id,
        { $set: updateObj },
        { new: true, runValidators: true }
      ).populate('category');
    }

    return await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category');
  }

  async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  async updateVariant(productId, variantId, updateData) {
    // Calculate finalPrice if price or discountPercentage is being updated
    const finalPrice = updateData.price 
      ? updateData.price - (updateData.price * (updateData.discountPercentage || 0) / 100)
      : undefined;

    return await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          'variants.$[variant].price': updateData.price,
          'variants.$[variant].discountPercentage': updateData.discountPercentage,
          'variants.$[variant].stock': updateData.stock,
          'variants.$[variant].isActive': updateData.isActive,
          ...(finalPrice !== undefined && { 'variants.$[variant].finalPrice': finalPrice }),
        }
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ 'variant._id': variantId }]
      }
    ).populate('category');
  }

  async addVariant(productId, variantData) {
    return await Product.findByIdAndUpdate(
      productId,
      { $push: { variants: variantData } },
      { new: true, runValidators: true }
    ).populate('category');
  }

  async removeVariant(productId, variantId) {
    return await Product.findByIdAndUpdate(
      productId,
      { $pull: { variants: { _id: variantId } } },
      { new: true, runValidators: true }
    ).populate('category');
  }

  async updateStock(productId, variantId, quantity, operation = 'decrement') {
    const delta = operation === 'increment' ? Math.abs(quantity) : -Math.abs(quantity);

    return await Product.findByIdAndUpdate(
      productId,
      {
        $inc: {
          'variants.$[variant].stock': delta,
          totalStock: delta,
        }
      },
      { 
        new: true, 
        runValidators: true,
        arrayFilters: [{ 'variant._id': variantId }]
      }
    ).populate('category');
  }

  async findLowStockProducts(threshold = 10) {
    return await Product.find({
      isActive: true,
      status: { $ne: 'discontinued' },
      $expr: { $lte: ['$totalStock', threshold] }
    }).populate('category');
  }

  async searchProducts(searchTerm, filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {
      $text: { $search: searchTerm },
      ...filters
    };

    return await Product.find(query)
      .populate('category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ score: { $meta: 'textScore' } });
  }

  async getFeaturedProducts(limit = 10) {
    return await Product.find({ 
      isFeatured: true, 
      isActive: true,
      status: 'active' 
    })
      .populate('category')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await Product.find({ 
      category: categoryId, 
      isActive: true,
      status: 'active' 
    })
      .populate('category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ sortOrder: 1, createdAt: -1 });
  }

  async getRelatedProducts(productId, categoryId, limit = 5) {
    return await Product.find({ 
      category: categoryId,
      _id: { $ne: productId },
      isActive: true,
      status: 'active' 
    })
      .populate('category')
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 });
  }

  async updateRating(productId, newRating, reviewCount) {
    return await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          'rating.average': newRating,
          'rating.count': reviewCount,
        }
      },
      { new: true }
    ).populate('category');
  }

  async bulkUpdateStock(updates) {
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { 
          _id: update.productId, 
          'variants._id': update.variantId 
        },
        update: {
          $inc: { 
            'variants.$.stock': update.quantity 
          }
        }
      }
    }));

    return await Product.bulkWrite(bulkOps);
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    // This will be implemented when we have the order module
    // For now, return products with highest ratings
    return await Product.find({ 
      isActive: true,
      status: 'active' 
    })
      .populate('category')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit);
  }

  async getInventoryStats() {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$totalStock' },
          avgStock: { $avg: '$totalStock' },
          lowStockProducts: {
            $sum: {
              $cond: [{ $lte: ['$totalStock', 5] }, 1, 0]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [{ $eq: ['$totalStock', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalProducts: 0,
      totalStock: 0,
      avgStock: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    };
  }
}

export default new ProductDAO();
