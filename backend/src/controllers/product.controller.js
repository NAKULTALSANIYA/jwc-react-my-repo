

import ProductService from '../services/product.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

class ProductController {
  // Admin routes - Product CRUD
  async createProduct(req, res, next) {
    try {
      const { name, description, category, fabric, occasion, gender } = req.body;
      
      if (!name || !description || !category || !fabric || !occasion || !gender) {
        throw new ApiError(400, 'Missing required fields: name, description, category, fabric, occasion, gender');
      }

      const product = await ProductService.createProduct(req.body);
      return ApiResponse.success(res, 'Product created successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        status, 
        isActive, 
        brand, 
        fabric, 
        occasion, 
        gender,
        sort = 'createdAt',
        order = 'desc'
      } = req.query;
      
      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (brand) filters.brand = brand;
      if (fabric) filters.fabric = fabric;
      if (occasion) filters.occasion = occasion;
      if (gender) filters.gender = gender;

      const sortObj = {};
      sortObj[sort] = order === 'asc' ? 1 : -1;

      const result = await ProductService.getAllProducts(filters, parseInt(page), parseInt(limit), sortObj);
      
      return ApiResponse.success(res, 'Products retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      
      return ApiResponse.success(res, 'Product retrieved successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async getProductBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);
      
      return ApiResponse.success(res, 'Product retrieved successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Update data is required');
      }

      const product = await ProductService.updateProduct(id, req.body);
      
      return ApiResponse.success(res, 'Product updated successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);
      
      return ApiResponse.success(res, 'Product deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleProductStatus(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductService.toggleProductStatus(id);
      
      return ApiResponse.success(res, 'Product status updated successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  // Variant management
  async addVariant(req, res, next) {
    try {
      const { id } = req.params;
      const { size, color, sku, price, stock } = req.body;
      
      if (!size || !color || !sku || price === undefined || stock === undefined) {
        throw new ApiError(400, 'Missing required variant fields: size, color, sku, price, stock');
      }

      const product = await ProductService.addVariant(id, req.body);
      
      return ApiResponse.success(res, 'Variant added successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req, res, next) {
    try {
      const { id, variantId } = req.params;
      
      if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'Update data is required');
      }

      const product = await ProductService.updateVariant(id, variantId, req.body);
      
      return ApiResponse.success(res, 'Variant updated successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async removeVariant(req, res, next) {
    try {
      const { id, variantId } = req.params;
      const product = await ProductService.removeVariant(id, variantId);
      
      return ApiResponse.success(res, 'Variant removed successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  // Stock management
  async updateStock(req, res, next) {
    try {
      const { id, variantId } = req.params;
      const { quantity, operation = 'decrement' } = req.body;
      
      if (quantity === undefined || quantity < 0) {
        throw new ApiError(400, 'Valid quantity is required');
      }

      const product = await ProductService.updateStock(id, variantId, quantity, operation);
      
      return ApiResponse.success(res, 'Stock updated successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateStock(req, res, next) {
    try {
      const { updates } = req.body;
      
      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        throw new ApiError(400, 'Updates array is required');
      }

      const result = await ProductService.bulkUpdateStock(updates);
      
      return ApiResponse.success(res, 'Bulk stock update completed', { result });
    } catch (error) {
      next(error);
    }
  }

  // Search and filtering
  async searchProducts(req, res, next) {
    try {
      const { 
        q: searchTerm, 
        page = 1, 
        limit = 10, 
        category, 
        brand, 
        fabric, 
        occasion, 
        gender,
        minPrice,
        maxPrice,
        size,
        color,
        isActive = true
      } = req.query;
      
      if (!searchTerm) {
        throw new ApiError(400, 'Search term is required');
      }

      const filters = { isActive: isActive === 'true' };
      if (category) filters.category = category;
      if (brand) filters.brand = brand;
      if (fabric) filters.fabric = fabric;
      if (occasion) filters.occasion = occasion;
      if (gender) filters.gender = gender;
      
      // Price range filter
      if (minPrice || maxPrice) {
        filters['variants.finalPrice'] = {};
        if (minPrice) filters['variants.finalPrice'].$gte = parseFloat(minPrice);
        if (maxPrice) filters['variants.finalPrice'].$lte = parseFloat(maxPrice);
      }

      // Size filter
      if (size) {
        filters['variants.size'] = size;
      }

      // Color filter
      if (color) {
        filters['variants.color'] = { $regex: color, $options: 'i' };
      }

      const result = await ProductService.searchProducts(searchTerm, filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Products searched successfully', result);
    } catch (error) {
      next(error);
    }
  }

  // Public routes
  async getFeaturedProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const products = await ProductService.getFeaturedProducts(parseInt(limit));
      
      return ApiResponse.success(res, 'Featured products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getProductsByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

      const sortObj = {};
      sortObj[sort] = order === 'asc' ? 1 : -1;

      const result = await ProductService.getProductsByCategory(categoryId, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Products by category retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getRelatedProducts(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      
      const product = await ProductService.getProductById(id);
      const products = await ProductService.getRelatedProducts(id, product.category, parseInt(limit));
      
      return ApiResponse.success(res, 'Related products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockProducts(req, res, next) {
    try {
      const { threshold = 10 } = req.query;
      const products = await ProductService.getLowStockProducts(parseInt(threshold));
      
      return ApiResponse.success(res, 'Low stock products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getTopSellingProducts(req, res, next) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      const products = await ProductService.getTopSellingProducts(startDate, endDate, parseInt(limit));
      
      return ApiResponse.success(res, 'Top selling products retrieved successfully', { products });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryStats(req, res, next) {
    try {
      const stats = await ProductService.getInventoryStats();
      
      return ApiResponse.success(res, 'Inventory stats retrieved successfully', { stats });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
