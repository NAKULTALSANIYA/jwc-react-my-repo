import axiosInstance from '../axios';

/**
 * Products API Service
 * Handles all product-related API calls
 */

// Get all products with filters
export const getProducts = async (params = {}) => {
  const response = await axiosInstance.get('/products', { params });
  return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

// Get product by slug
export const getProductBySlug = async (slug) => {
  const response = await axiosInstance.get(`/products/slug/${slug}`);
  return response.data;
};

// Get featured products
export const getFeaturedProducts = async () => {
  const response = await axiosInstance.get('/products', {
    params: { featured: true },
  });
  return response.data;
};

// Get new arrivals
export const getNewArrivals = async () => {
  const response = await axiosInstance.get('/products', {
    params: { sortBy: 'createdAt', order: 'desc', limit: 12 },
  });
  return response.data;
};

// Search products
export const searchProducts = async (query) => {
  const response = await axiosInstance.get('/products/search', {
    params: { q: query },
  });
  return response.data;
};

// Create product (admin)
export const createProduct = async (productData) => {
  const response = await axiosInstance.post('/products', productData);
  return response.data;
};

// Update product (admin)
export const updateProduct = async ({ id, data }) => {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
};

// Delete product (admin)
export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

// Upload product images (admin)
export const uploadProductImages = async ({ id, images }) => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });
  
  const response = await axiosInstance.post(
    `/products/${id}/images`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};
