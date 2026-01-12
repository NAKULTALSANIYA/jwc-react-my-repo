// Default to local backend when env is missing to avoid /undefined in dev
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://jwc-react.onrender.com').replace(/\/$/, '');

const buildUrl = (path = '') => {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }
  if (!path) return API_BASE_URL;
  return path.startsWith('/') ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
};

async function request(path, { method = 'GET', body, token, headers } = {}) {
  const authToken = token || localStorage.getItem('token') || '';
  
  // Check if body is FormData
  const isFormData = body instanceof FormData;
  
  const fetchHeaders = {
    ...(headers || {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  
  // Only add Content-Type if not FormData (browser will set it with boundary for FormData)
  if (!isFormData && !headers?.['Content-Type']) {
    fetchHeaders['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(buildUrl(path), {
    method,
    headers: fetchHeaders,
    credentials: 'include',
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  const data = await response.json().catch(() => null);
  // If the backend says the session is invalid, clear local state and send the user to login.
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    const message = data?.message || 'Session expired. Please log in again.';
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.data;
    throw error;
  }

  if (!response.ok || data?.success === false) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.data;
    throw error;
  }

  return data?.data ?? data ?? null;
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  del: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};

export { API_BASE_URL, request as rawRequest };
