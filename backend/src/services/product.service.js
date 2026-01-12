
import ProductDAO from '../dao/product.dao.js';
import CategoryService from './category.service.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class ProductService {
  async createProduct(productData) {
    try {
      // Validate category exists
      const category = await CategoryService.getCategoryById(productData.category);
      if (!category) {
        throw new ApiError(400, 'Invalid category');
      }

      // Check if product with same name exists
      const existingProduct = await ProductDAO.findAll({ name: productData.name });
      if (existingProduct.length > 0) {
        throw new ApiError(400, 'Product with this name already exists');
      }

      const product = await ProductDAO.create(productData);

      // Update category product count
      await CategoryService.updateProductCount(productData.category, 1);

      logger.info(`Product created: ${product.name} (${product._id})`);
      return product;
    } catch (error) {
      logger.error('Create product error:', error);
      throw error;
    }
  }

  async getAllProducts(filters = {}, page = 1, limit = 10, sort = { createdAt: -1 }) {
    try {
      const products = await ProductDAO.findAll(filters, page, limit, sort);
      const total = await ProductDAO.count(filters);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all products error:', error);
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      const product = await ProductDAO.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Get product by ID error:', error);
      throw error;
    }
  }

  async getProductBySlug(slug) {
    try {
      const product = await ProductDAO.findBySlug(slug);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Get product by slug error:', error);
      throw error;
    }
  }

  async updateProduct(productId, updateData) {
    try {
      // If category is being updated, validate it
      if (updateData.category) {
        const category = await CategoryService.getCategoryById(updateData.category);
        if (!category) {
          throw new ApiError(400, 'Invalid category');
        }
      }

      const product = await ProductDAO.updateById(productId, updateData);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      logger.info(`Product updated: ${product.name} (${product._id})`);
      return product;
    } catch (error) {
      logger.error('Update product error:', error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const product = await ProductDAO.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      await ProductDAO.deleteById(productId);

      // Update category product count
      await CategoryService.updateProductCount(product.category, -1);

      logger.info(`Product deleted: ${product.name} (${productId})`);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      logger.error('Delete product error:', error);
      throw error;
    }
  }

  async addVariant(productId, variantData) {
    try {
      // Check if SKU already exists
      const existingProduct = await ProductDAO.findBySku(variantData.sku);
      if (existingProduct && existingProduct._id.toString() !== productId) {
        throw new ApiError(400, 'Product with this SKU already exists');
      }

      const product = await ProductDAO.addVariant(productId, variantData);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      logger.info(`Variant added to product: ${product.name} (${product._id})`);
      return product;
    } catch (error) {
      logger.error('Add variant error:', error);
      throw error;
    }
  }

  async updateVariant(productId, variantId, variantData) {
    try {
      // Check if SKU already exists
      if (variantData.sku) {
        const existingProduct = await ProductDAO.findBySku(variantData.sku);
        if (existingProduct && existingProduct._id.toString() !== productId) {
          throw new ApiError(400, 'Product with this SKU already exists');
        }
      }

      const product = await ProductDAO.updateVariant(productId, variantId, variantData);
      if (!product) {
        throw new ApiError(404, 'Product or variant not found');
      }

      logger.info(`Variant updated for product: ${product.name} (${product._id})`);
      return product;
    } catch (error) {
      logger.error('Update variant error:', error);
      throw error;
    }
  }

  async removeVariant(productId, variantId) {
    try {
      const product = await ProductDAO.removeVariant(productId, variantId);
      if (!product) {
        throw new ApiError(404, 'Product or variant not found');
      }

      logger.info(`Variant removed from product: ${product.name} (${product._id})`);
      return product;
    } catch (error) {
      logger.error('Remove variant error:', error);
      throw error;
    }
  }

  async updateStock(productId, variantId, quantity, operation = 'decrement') {
    try {
      const product = await ProductDAO.updateStock(productId, variantId, quantity, operation);
      if (!product) {
        throw new ApiError(404, 'Product or variant not found');
      }

      logger.info(`Stock ${operation} for variant ${variantId} in product ${product.name}`);
      return product;
    } catch (error) {
      logger.error('Update stock error:', error);
      throw error;
    }
  }

  async bulkUpdateStock(updates) {
    try {
      const result = await ProductDAO.bulkUpdateStock(updates);
      logger.info(`Bulk stock update completed for ${updates.length} variants`);
      return result;
    } catch (error) {
      logger.error('Bulk update stock error:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm, filters = {}, page = 1, limit = 10) {
    try {
      const products = await ProductDAO.searchProducts(searchTerm, filters, page, limit);
      const total = await ProductDAO.count({
        ...filters,
        $text: { $search: searchTerm }
      });

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Search products error:', error);
      throw error;
    }
  }

  async getFeaturedProducts(limit = 10) {
    try {
      const products = await ProductDAO.getFeaturedProducts(limit);
      return products;
    } catch (error) {
      logger.error('Get featured products error:', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    try {
      const products = await ProductDAO.getProductsByCategory(categoryId, page, limit);
      const total = await ProductDAO.count({ 
        category: categoryId, 
        isActive: true,
        status: 'active' 
      });

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get products by category error:', error);
      throw error;
    }
  }

  async getRelatedProducts(productId, categoryId, limit = 5) {
    try {
      const products = await ProductDAO.getRelatedProducts(productId, categoryId, limit);
      return products;
    } catch (error) {
      logger.error('Get related products error:', error);
      throw error;
    }
  }

  async getLowStockProducts(threshold = 10) {
    try {
      const products = await ProductDAO.findLowStockProducts(threshold);
      return products;
    } catch (error) {
      logger.error('Get low stock products error:', error);
      throw error;
    }
  }

  async getTopSellingProducts(startDate, endDate, limit = 10) {
    try {
      const products = await ProductDAO.getTopSellingProducts(startDate, endDate, limit);
      return products;
    } catch (error) {
      logger.error('Get top selling products error:', error);
      throw error;
    }
  }

  async updateRating(productId, newRating, reviewCount) {
    try {
      const product = await ProductDAO.updateRating(productId, newRating, reviewCount);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      logger.info(`Rating updated for product: ${product.name} (${product._id})`);
      return product;
    } catch (error) {
      logger.error('Update rating error:', error);
      throw error;
    }
  }

  async getInventoryStats() {
    try {
      const stats = await ProductDAO.getInventoryStats();
      return stats;
    } catch (error) {
      logger.error('Get inventory stats error:', error);
      throw error;
    }
  }

  async toggleProductStatus(productId) {
    try {
      const product = await ProductDAO.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      const updatedProduct = await ProductDAO.updateById(productId, { 
        isActive: !product.isActive 
      });

      logger.info(`Product status toggled: ${updatedProduct.name} - ${updatedProduct.isActive ? 'active' : 'inactive'}`);
      return updatedProduct;
    } catch (error) {
      logger.error('Toggle product status error:', error);
      throw error;
    }
  }
}

export default new ProductService();
