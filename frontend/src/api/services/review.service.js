import axiosInstance from '../axios';

/**
 * Reviews API Service
 */

// Get reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  const response = await axiosInstance.get(`/reviews/product/${productId}`, { params });
  return response.data;
};

// Get user's reviews
export const getUserReviews = async () => {
  const response = await axiosInstance.get('/reviews/user');
  return response.data;
};

// Create a review
export const createReview = async (reviewData) => {
  const response = await axiosInstance.post('/reviews', reviewData);
  return response.data;
};

// Update a review
export const updateReview = async ({ id, data }) => {
  const response = await axiosInstance.put(`/reviews/${id}`, data);
  return response.data;
};

// Delete a review
export const deleteReview = async (id) => {
  const response = await axiosInstance.delete(`/reviews/${id}`);
  return response.data;
};

// Get review by ID
export const getReviewById = async (id) => {
  const response = await axiosInstance.get(`/reviews/${id}`);
  return response.data;
};
