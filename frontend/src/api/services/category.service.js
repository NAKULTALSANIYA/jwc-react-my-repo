import axiosInstance from '../axios';

/**
 * Categories API Service
 * Handles all category-related API calls
 */

// Get all categories
export const getCategories = async () => {
  const response = await axiosInstance.get('/categories');
  return response.data;
};

// Get category by ID
export const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`/categories/${id}`);
  return response.data;
};

// Get category with products
export const getCategoryWithProducts = async (id) => {
  const response = await axiosInstance.get(`/categories/${id}/products`);
  return response.data;
};

// Create category (admin)
export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post('/categories', categoryData);
  return response.data;
};

// Update category (admin)
export const updateCategory = async ({ id, data }) => {
  const response = await axiosInstance.put(`/categories/${id}`, data);
  return response.data;
};

// Delete category (admin)
export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};
