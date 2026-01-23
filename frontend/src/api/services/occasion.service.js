import axiosInstance from '../axios';

/**
 * Occasions API Service (Public)
 * Handles fetching occasion categories for home page
 * No authentication required
 */

// Get home page occasions
export const getHomeOccasions = async () => {
  try {
    const response = await axiosInstance.get('/categories/public/home-occasions');
    return response.data;
  } catch (error) {
    console.error('Error fetching home occasions:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export default {
  getHomeOccasions
};
