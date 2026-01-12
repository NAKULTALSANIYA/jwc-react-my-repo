import axiosInstance from '../axios';

/**
 * Wishlist API Service
 */

// Get user's wishlist
export const getWishlist = async () => {
  const response = await axiosInstance.get('/wishlist');
  return response.data;
};

// Add item to wishlist
export const addToWishlist = async (productId, variantId) => {
  const response = await axiosInstance.post('/wishlist/add', { productId, variantId });
  return response.data;
};

// Remove item from wishlist
export const removeFromWishlist = async (variantId) => {
  const response = await axiosInstance.delete(`/wishlist/item/${variantId}`);
  return response.data;
};

// Check if product is in wishlist
export const isInWishlist = async (productId, variantId) => {
  const response = await axiosInstance.get(`/wishlist/check/${productId}`, {
    params: { variantId },
  });
  return response.data;
};

// Clear entire wishlist
export const clearWishlist = async () => {
  const response = await axiosInstance.delete('/wishlist');
  return response.data;
};
