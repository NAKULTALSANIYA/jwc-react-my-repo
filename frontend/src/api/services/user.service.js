import axiosInstance from '../axios';

/**
 * User API Service
 * Handles user-related endpoints such as addresses
 */

// Get all addresses for current user
export const getAddresses = async () => {
  const response = await axiosInstance.get('/users/addresses');
  return response.data;
};

// Add a new address
export const addAddress = async (address) => {
  const response = await axiosInstance.post('/users/addresses', address);
  return response.data;
};

// Update an address
export const updateAddress = async ({ addressId, address }) => {
  const response = await axiosInstance.put(`/users/addresses/${addressId}`, address);
  return response.data;
};

// Delete an address
export const deleteAddress = async (addressId) => {
  const response = await axiosInstance.delete(`/users/addresses/${addressId}`);
  return response.data;
};
