import axiosInstance from '../axios';

/**
 * Dashboard API Service (Admin)
 */

// Get dashboard overview
export const getDashboardOverview = async () => {
  const response = await axiosInstance.get('/dashboard/overview');
  return response.data;
};

// Get dashboard stats
export const getDashboardStats = async (params = {}) => {
  const response = await axiosInstance.get('/dashboard/stats', { params });
  return response.data;
};

// Get revenue analytics
export const getRevenueAnalytics = async (params = {}) => {
  const response = await axiosInstance.get('/dashboard/revenue', { params });
  return response.data;
};

// Get top products
export const getTopProducts = async (params = {}) => {
  const response = await axiosInstance.get('/dashboard/top-products', { params });
  return response.data;
};

// Get recent orders
export const getRecentOrders = async (params = {}) => {
  const response = await axiosInstance.get('/dashboard/recent-orders', { params });
  return response.data;
};
