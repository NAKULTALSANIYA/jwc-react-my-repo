import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { useToast } from '../components/Toast';
import Loader from '../components/Loader';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [uploadType, setUploadType] = useState('url'); // 'url' or 'file'
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    productId: '',
    thumbnailUrl: '',
    duration: '',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchVideos();
    fetchProducts();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.videos();
      if (response && response.data && response.data.success) {
        setVideos(response.data.data || []);
      } else if (response && response.success && response.data) {
        setVideos(response.data);
      } else if (Array.isArray(response)) {
        setVideos(response);
      } else if (response && Array.isArray(response.data)) {
        setVideos(response.data);
      } else {
        setVideos([]);
      }
    } catch (error) {
      toast.error('Failed to fetch videos');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminApi.products();
      if (response.data) {
        setProducts(Array.isArray(response.data) ? response.data : response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file size must be less than 100MB');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    try {
      setIsUploading(true);
      const uploaded = await adminApi.uploadVideo(videoFile);

      if (uploaded && uploaded.url) {
        setFormData(prev => ({ ...prev, url: uploaded.url }));
        toast.success('Video uploaded successfully');
        setVideoFile(null);
        return uploaded.url; // return the URL so callers can continue flow
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload video');
      console.error('Error uploading video:', error);
    } finally {
      setIsUploading(false);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If upload type is file but no URL yet, upload the file first, then continue submit
    if (uploadType === 'file' && videoFile && !formData.url) {
      const uploadedUrl = await handleUploadVideo();
      if (!uploadedUrl) return;
      // Update formData with the uploaded URL before submitting
      setFormData(prev => ({ ...prev, url: uploadedUrl }));
    }

    // Validate URL exists
    if (!formData.url) {
      toast.error('Please provide a video URL or upload a video file');
      return;
    }

    try {
      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        order: parseInt(formData.order) || 0,
        productId: formData.productId || undefined
      };

      if (editingVideo) {
        await adminApi.updateVideo(editingVideo._id, payload);
        toast.success('Video updated successfully');
      } else {
        await adminApi.createVideo(payload);
        toast.success('Video created successfully');
      }

      resetForm();
      fetchVideos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save video');
      console.error('Error saving video:', error);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
      description: video.description,
      productId: video.productId?._id || '',
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration || '',
      isActive: video.isActive,
      order: video.order || 0
    });
    setUploadType('url'); // Default to URL when editing
    setVideoFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await adminApi.deleteVideo(id);
      toast.success('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to delete video');
      console.error('Error deleting video:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      productId: '',
      thumbnailUrl: '',
      duration: '',
      isActive: true,
      order: 0
    });
    setEditingVideo(null);
    setShowForm(false);
    setUploadType('url');
    setVideoFile(null);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Video Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Video
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Upload Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Source *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="url"
                      checked={uploadType === 'url'}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">URL</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="file"
                      checked={uploadType === 'file'}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Upload File</span>
                  </label>
                </div>
              </div>

              {/* Video URL or File Upload */}
              {uploadType === 'url' ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Video File {!formData.url && '*'} (Max 100MB)
                  </label>
                  {formData.url && !videoFile && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      Current: {formData.url.split('/').pop()}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                      onChange={handleFileChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {videoFile && (
                      <button
                        type="button"
                        onClick={handleUploadVideo}
                        disabled={isUploading}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                  </div>
                  {videoFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Product
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Active (visible on homepage)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingVideo ? 'Update Video' : 'Create Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No videos found. Click "Add New Video" to create one.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {video.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {video.thumbnailUrl && (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{video.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {video.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {video.productId?.name || 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          video.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {video.isActive ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(video)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Videos;
