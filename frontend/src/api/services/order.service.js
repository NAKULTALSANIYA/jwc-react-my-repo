import axiosInstance from '../axios';

/**
 * Orders API Service
 * Handles all order-related API calls
 */

// Get all orders for logged-in user
export const getOrders = async (params = {}) => {
  const response = await axiosInstance.get('/orders/my-orders', { params });
  return response.data;
};

// Get order by ID
export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

// Create order / Checkout
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

// Update order status (admin)
export const updateOrderStatus = async ({ id, status }) => {
  const response = await axiosInstance.patch(`/orders/admin/${id}/status`, { status });
  return response.data;
};

// Cancel order
export const cancelOrder = async (id) => {
  const response = await axiosInstance.patch(`/orders/${id}/cancel`);
  return response.data;
};

// Get all orders (admin)
export const getAllOrders = async (params = {}) => {
  const response = await axiosInstance.get('/orders/admin/orders', { params });
  return response.data;
};

