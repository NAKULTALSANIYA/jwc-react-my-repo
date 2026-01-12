import axiosInstance from '../axios';

/**
 * Cart API Service
 * Handles all cart-related API calls
 */

// Get user's cart
export const getCart = async () => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

// Add item to cart
export const addToCart = async (item) => {
  const response = await axiosInstance.post('/cart/add', item);
  return response.data;
};

// Update cart item quantity by variant
export const updateCartItem = async ({ variantId, quantity }) => {
  const response = await axiosInstance.patch(`/cart/item/${variantId}`, {
    quantity,
  });
  return response.data;
};

// Remove item from cart
export const removeFromCart = async (variantId) => {
  const response = await axiosInstance.delete(`/cart/item/${variantId}`);
  return response.data;
};

// Clear entire cart
export const clearCart = async () => {
  const response = await axiosInstance.delete('/cart');
  return response.data;
};

// Get cart count
export const getCartCount = async () => {
  const response = await axiosInstance.get('/cart/count');
  return response.data;
};
