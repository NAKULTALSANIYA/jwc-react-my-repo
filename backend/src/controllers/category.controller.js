
import CategoryService from '../services/category.service.js';
import ApiResponse from '../utils/ApiResponse.js';

class CategoryController {
  // Admin routes - Category CRUD
  async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.success(res, 'Category created successfully', { category });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req, res, next) {
    try {
      const { page = 1, limit = 10, isActive } = req.query;
      
      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const result = await CategoryService.getAllCategories(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, 'Categories retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      
      return ApiResponse.success(res, 'Category retrieved successfully', { category });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await CategoryService.getCategoryBySlug(slug);
      
      return ApiResponse.success(res, 'Category retrieved successfully', { category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.updateCategory(id, req.body);
      
      return ApiResponse.success(res, 'Category updated successfully', { category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);
      
      return ApiResponse.success(res, 'Category deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async toggleCategoryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryService.toggleCategoryStatus(id);
      
      return ApiResponse.success(res, 'Category status updated successfully', { category });
    } catch (error) {
      next(error);
    }
  }

  // Public routes
  async getHomeOccasions(req, res, next) {
    try {
      const categories = await CategoryService.getHomeOccasions();
      
      return ApiResponse.success(res, 'Home occasions retrieved successfully', { data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getWomenCategories(req, res, next) {
    try {
      const categories = await CategoryService.getWomenCategories();
      
      return ApiResponse.success(res, 'Women categories retrieved successfully', { data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getAccessoriesCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAccessoriesCategories();
      
      return ApiResponse.success(res, 'Accessories categories retrieved successfully', { data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryTree(req, res, next) {
    try {
      const tree = await CategoryService.getCategoryTree();
      
      return ApiResponse.success(res, 'Category tree retrieved successfully', { tree });
    } catch (error) {
      next(error);
    }
  }

  async getRootCategories(req, res, next) {
    try {
      const categories = await CategoryService.getRootCategories();
      
      return ApiResponse.success(res, 'Root categories retrieved successfully', { categories });
    } catch (error) {
      next(error);
    }
  }

  async getSubcategories(req, res, next) {
    try {
      const { parentId } = req.params;
      const categories = await CategoryService.getSubcategories(parentId);
      
      return ApiResponse.success(res, 'Subcategories retrieved successfully', { categories });
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesWithProducts(req, res, next) {
    try {
      const categories = await CategoryService.getCategoriesWithProducts();
      
      return ApiResponse.success(res, 'Categories with products retrieved successfully', { categories });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
