import { apiClient } from './client';

const toQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const adminApi = {
  login: (payload) => apiClient.post('/api/auth/login', payload),
  dashboardSummary: () => apiClient.get('/api/dashboard/summary'),
  revenueByMonth: (year) => apiClient.get(`/api/orders/admin/revenue-monthly${toQuery({ year })}`),
  revenueByPeriod: (params = {}) => apiClient.get(`/api/dashboard/revenue${toQuery(params)}`),
  recentOrders: (limit = 5) => apiClient.get(`/api/dashboard/recent-orders${toQuery({ limit })}`),
  
  // Products
  products: (params = {}) => apiClient.get(`/api/products${toQuery(params)}`),
  getProduct: (id) => apiClient.get(`/api/products/${id}`),
  createProduct: (payload) => apiClient.post('/api/products', payload),
  updateProduct: (id, payload) => apiClient.put(`/api/products/${id}`, payload),
  deleteProduct: (id) => apiClient.del(`/api/products/${id}`),
  
  // Categories
  categories: (params = {}) => apiClient.get(`/api/categories${toQuery(params)}`),
  createCategory: (payload) => apiClient.post('/api/categories', payload),
  updateCategory: (id, payload) => apiClient.put(`/api/categories/${id}`, payload),
  deleteCategory: (id) => apiClient.del(`/api/categories/${id}`),
  
  // Orders & Customers
  orders: (params = {}) => apiClient.get(`/api/orders/admin/orders${toQuery(params)}`),  
  getOrder: (orderId) => {
    // Try to detect if it's an orderNumber (has "ORD" prefix) or MongoDB _id
    if (orderId?.startsWith('ORD') || (typeof orderId === 'string' && orderId.length > 12 && !orderId.match(/^[a-f0-9]{24}$/i))) {
      // It's likely an orderNumber
      return apiClient.get(`/api/orders/number/${orderId}`);
    }
    // It's a MongoDB _id
    return apiClient.get(`/api/orders/${orderId}`);
  },
  updateOrderStatus: (orderId, payload) => apiClient.patch(`/api/orders/admin/${orderId}/status`, payload),  
  customers: (params = {}) => apiClient.get(`/api/users${toQuery(params)}`),
  
  // Image Upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/api/upload/image', formData);
  },
  uploadMultipleImages: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return apiClient.post('/api/upload/images', formData);
  },

  // Contacts
  getContacts: (params = {}) => apiClient.get(`/api/contact${toQuery(params)}`),
  getContactStats: () => apiClient.get('/api/contact/stats'),
  updateContactStatus: (id, payload) => apiClient.patch(`/api/contact/${id}/status`, payload),
  addAdminNotes: (id, payload) => apiClient.patch(`/api/contact/${id}/notes`, payload),
  deleteContact: (id) => apiClient.del(`/api/contact/${id}`),

  // Videos
  videos: (params = {}) => apiClient.get(`/api/videos${toQuery(params)}`),
  getVideo: (id) => apiClient.get(`/api/videos/${id}`),
  createVideo: (payload) => apiClient.post('/api/videos', payload),
  updateVideo: (id, payload) => apiClient.put(`/api/videos/${id}`, payload),
  deleteVideo: (id) => apiClient.del(`/api/videos/${id}`),
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return apiClient.post('/api/videos/upload', formData);
  },
};

export { toQuery };
