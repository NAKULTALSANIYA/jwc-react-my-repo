
import CategoryDAO from '../dao/category.dao.js';
import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

class CategoryService {
  async createCategory(categoryData) {
    try {
      // Check if category with same name or slug exists
      const existingCategory = await CategoryDAO.findAll({ 
        $or: [
          { name: categoryData.name },
          { slug: categoryData.slug }
        ]
      });

      if (existingCategory.length > 0) {
        throw new ApiError(400, 'Category with this name or slug already exists');
      }

      const category = await CategoryDAO.create(categoryData);

      logger.info(`Category created: ${category.name} (${category._id})`);
      return category;
    } catch (error) {
      logger.error('Create category error:', error);
      throw error;
    }
  }

  async getAllCategories(filters = {}, page = 1, limit = 10) {
    try {
      const categories = await CategoryDAO.findAll(filters, page, limit);
      const total = await CategoryDAO.count(filters);

      return {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Get all categories error:', error);
      throw error;
    }
  }

  async getCategoryById(categoryId) {
    try {
      const category = await CategoryDAO.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      return category;
    } catch (error) {
      logger.error('Get category by ID error:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug) {
    try {
      const category = await CategoryDAO.findBySlug(slug);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      return category;
    } catch (error) {
      logger.error('Get category by slug error:', error);
      throw error;
    }
  }

  async updateCategory(categoryId, updateData) {
    try {
      // Check if updating name and if new name conflicts
      if (updateData.name) {
        const existingCategory = await CategoryDAO.findAll({
          name: updateData.name,
          _id: { $ne: categoryId }
        });

        if (existingCategory.length > 0) {
          throw new ApiError(400, 'Category with this name already exists');
        }
      }

      const category = await CategoryDAO.updateById(categoryId, updateData);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      logger.info(`Category updated: ${category.name} (${category._id})`);
      return category;
    } catch (error) {
      logger.error('Update category error:', error);
      throw error;
    }
  }


  async deleteCategory(categoryId) {
    try {
      // Check if category has children
      const category = await CategoryDAO.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      if (category.children && category.children.length > 0) {
        throw new ApiError(400, 'Cannot delete category with subcategories. Please delete subcategories first.');
      }

      const deletedCategory = await CategoryDAO.deleteById(categoryId);

      logger.info(`Category deleted: ${deletedCategory.name} (${categoryId})`);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      logger.error('Delete category error:', error);
      throw error;
    }
  }

  async toggleCategoryStatus(categoryId) {
    try {
      const category = await CategoryDAO.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      const updatedCategory = await CategoryDAO.updateById(categoryId, { 
        isActive: !category.isActive 
      });

      logger.info(`Category status toggled: ${updatedCategory.name} - ${updatedCategory.isActive ? 'active' : 'inactive'}`);
      return updatedCategory;
    } catch (error) {
      logger.error('Toggle category status error:', error);
      throw error;
    }
  }

  async getCategoryTree() {
    try {
      const tree = await CategoryDAO.getCategoryTree();
      return tree;
    } catch (error) {
      logger.error('Get category tree error:', error);
      throw error;
    }
  }

  async getHomeOccasions() {
    try {
      // Fetch categories that are displayed on home page, sorted by sequence
      const categories = await CategoryDAO.findAll(
        { displayOnHome: true, isActive: true },
        1,
        100
      );
      
      // Sort by sequence
      const sorted = Array.isArray(categories) 
        ? categories.sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
        : [];
      
      return sorted;
    } catch (error) {
      logger.error('Get home occasions error:', error);
      throw error;
    }
  }

  async getRootCategories() {
    try {
      const categories = await CategoryDAO.findRootCategories();
      return categories;
    } catch (error) {
      logger.error('Get root categories error:', error);
      throw error;
    }
  }

  async getSubcategories(parentId) {
    try {
      const categories = await CategoryDAO.findByParentId(parentId);
      return categories;
    } catch (error) {
      logger.error('Get subcategories error:', error);
      throw error;
    }
  }

  async getCategoriesWithProducts() {
    try {
      const categories = await CategoryDAO.getCategoriesWithProducts();
      return categories;
    } catch (error) {
      logger.error('Get categories with products error:', error);
      throw error;
    }
  }

  async updateProductCount(categoryId, increment = 1) {
    try {
      return await CategoryDAO.updateProductCount(categoryId, increment);
    } catch (error) {
      logger.error('Update product count error:', error);
      throw error;
    }
  }
}

export default new CategoryService();
