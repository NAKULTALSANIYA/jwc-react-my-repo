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

  // Careers
  getCareers: (params = {}) => apiClient.get(`/api/careers${toQuery(params)}`),
  getCareerStats: () => apiClient.get('/api/careers/stats'),
  approveCareer: (id, payload) => apiClient.patch(`/api/careers/${id}/approve`, payload),
  rejectCareer: (id, payload) => apiClient.patch(`/api/careers/${id}/reject`, payload),

  // Videos
  videos: (params = {}) => apiClient.get(`/api/videos${toQuery(params)}`),
  getVideo: (id) => apiClient.get(`/api/videos/${id}`),
  createVideo: (payload) => apiClient.post('/api/videos', payload),
  updateVideo: (id, payload) => apiClient.put(`/api/videos/${id}`, payload),
  deleteVideo: (id) => apiClient.del(`/api/videos/${id}`),
  uploadVideo: (file, onProgress = null) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded / e.total) * 100);
            onProgress(percentage);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data || response);
          } catch (e) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      const token = localStorage.getItem('token');
      xhr.open('POST', '/api/videos/upload');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  },

  // Hero Images
  getHeroes: (params = {}) => apiClient.get(`/api/heroes${toQuery(params)}`),
  getHero: (position) => apiClient.get(`/api/heroes/${position}`),
  createHero: (payload) => apiClient.post('/api/heroes', payload),
  updateHero: (position, payload) => apiClient.put(`/api/heroes/${position}`, payload),
  deleteHero: (position) => apiClient.del(`/api/heroes/${position}`),
  updateHeroStatus: (position, isActive) => apiClient.patch(`/api/heroes/${position}/status`, { isActive }),
};

export { toQuery };
