// Prefer env; otherwise fall back to current origin to avoid hardcoded hosts
const API_BASE_URL = (() => {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`.replace(/\/$/, '');
  }
  return '';
})();

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
  
  if (!response.ok || data?.success === false) {
    // Backend sends 'error' field, fallback to 'message'
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.data;
    
    // Only auto-logout on 401 if:
    // 1. User has a valid token (session exists)
    // 2. The request is NOT for public endpoints like login
    const isPublicEndpoint = path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/forgot-password');
    const hasValidToken = localStorage.getItem('token');
    
    if (response.status === 401 && hasValidToken && !isPublicEndpoint) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    }
    
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
