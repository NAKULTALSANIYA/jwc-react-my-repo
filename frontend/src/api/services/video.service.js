import axiosInstance from '../axios';

/**
 * Videos API Service
 * Handles all video-related API calls
 */

// Get all videos
export const getVideos = async () => {
  const response = await axiosInstance.get('/videos');
  return response.data;
};

// Get video by ID
export const getVideoById = async (id) => {
  const response = await axiosInstance.get(`/videos/${id}`);
  return response.data;
};

// Add a new video (admin only)
export const addVideo = async (videoData) => {
  const response = await axiosInstance.post('/videos', videoData);
  return response.data;
};

// Update video (admin only)
export const updateVideo = async (id, videoData) => {
  const response = await axiosInstance.put(`/videos/${id}`, videoData);
  return response.data;
};

// Delete video (admin only)
export const deleteVideo = async (id) => {
  const response = await axiosInstance.delete(`/videos/${id}`);
  return response.data;
};
