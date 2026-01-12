import axiosInstance, { tokenManager } from '../axios';

/**
 * Auth API Service
 * Handles all authentication-related API calls
 */

// Login
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

// Register
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Logout
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } finally {
    // Always clear local tokens even if API call fails
    tokenManager.clearTokens();
  }
};

// Get current user profile
export const getProfile = async () => {
  const response = await axiosInstance.get('/users/profile/me');
  return response.data;
};

// Refresh access token
export const refreshToken = async (refreshToken) => {
  const response = await axiosInstance.post('/auth/refresh-token', { refreshToken });
  return response.data;
};

// Google OAuth login
export const googleLogin = async (code) => {
  const response = await axiosInstance.post('/auth/google', { code });
  return response.data;
};

// Forgot password - initiates password reset
export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (resetSessionId, otp) => {
  const response = await axiosInstance.post('/auth/verify-otp', {
    resetSessionId,
    otp,
  });
  return response.data;
};

// Resend OTP
export const resendOTP = async (resetSessionId) => {
  const response = await axiosInstance.post('/auth/resend-otp', { resetSessionId });
  return response.data;
};

// Reset password - final step
export const resetPassword = async (resetSessionId, password) => {
  const response = await axiosInstance.post('/auth/reset-password', {
    resetSessionId,
    password,
  });
  return response.data;
};

// Change password (for logged-in users)
export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

// Update profile
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put('/users/profile/me', profileData);
  return response.data;
};

// Get user by ID (admin)
export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

// Get all users (admin)
export const getAllUsers = async (params) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};
