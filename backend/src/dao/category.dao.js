
import Category from '../models/category.model.js';

class CategoryDAO {
  async create(categoryData) {
    const category = new Category(categoryData);
    return await category.save();
  }

  async findById(id) {
    return await Category.findById(id)
      .populate('parent')
      .populate('children');
  }

  async findBySlug(slug) {
    return await Category.findOne({ slug })
      .populate('parent')
      .populate('children');
  }

  async findAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = Category.find(filters);
    
    return await query
      .populate('parent')
      .populate('children')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ level: 1, order: 1, name: 1 });
  }

  async findRootCategories() {
    return await Category.find({ parent: null, isActive: true })
      .populate('children')
      .sort({ order: 1, name: 1 });
  }

  async findByParentId(parentId) {
    return await Category.find({ parent: parentId, isActive: true })
      .populate('children')
      .sort({ order: 1, name: 1 });
  }

  async updateById(id, updateData) {
    return await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('parent').populate('children');
  }

  async deleteById(id) {
    return await Category.findByIdAndDelete(id);
  }

  async count(filters = {}) {
    return await Category.countDocuments(filters);
  }

  async getCategoryTree() {
    const categories = await Category.find({ isActive: true })
      .populate('parent')
      .populate('children')
      .sort({ level: 1, order: 1, name: 1 });

    // Build tree structure
    const categoryMap = {};
    const tree = [];

    // First pass: create map
    categories.forEach(category => {
      categoryMap[category._id.toString()] = {
        ...category.toObject(),
        children: []
      };
    });

    // Second pass: build tree
    categories.forEach(category => {
      const categoryData = categoryMap[category._id.toString()];
      if (category.parent) {
        const parentId = category.parent.toString();
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryData);
        }
      } else {
        tree.push(categoryData);
      }
    });

    return tree;
  }

  async updateProductCount(categoryId, increment = 0) {
    return await Category.findByIdAndUpdate(
      categoryId,
      { $inc: { productCount: increment } },
      { new: true }
    );
  }

  async getCategoriesWithProducts() {
    return await Category.find({ isActive: true, productCount: { $gt: 0 } })
      .populate('children')
      .sort({ level: 1, order: 1, name: 1 });
  }
}

export default new CategoryDAO();
