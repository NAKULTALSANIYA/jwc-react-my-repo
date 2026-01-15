import { QueryClient } from '@tanstack/react-query';

// Create QueryClient with global configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Disable refetch on window focus
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Global error handler
export const handleQueryError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'An error occurred';
  
  return message;
};

// Query key factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'],
    profile: ['auth', 'profile'],
  },
  
  // Products
  products: {
    all: ['products'],
    list: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
    bySlug: (slug) => ['products', 'slug', slug],
    featured: ['products', 'featured'],
    newArrivals: ['products', 'new-arrivals'],
  },
  
  // Categories
  categories: {
    all: ['categories'],
    list: ['categories', 'list'],
    detail: (id) => ['categories', 'detail', id],
  },
  
  // Cart
  cart: {
    items: ['cart'],
    count: ['cart', 'count'],
  },
  
  // Orders
  orders: {
    all: ['orders'],
    list: ['orders', 'list'],
    detail: (id) => ['orders', 'detail', id],
  },
  
  // Wishlist
  wishlist: {
    all: ['wishlist'],
    items: ['wishlist', 'items'],
  },
  
  // Reviews
  reviews: {
    all: ['reviews'],
    byProduct: (productId) => ['reviews', 'product', productId],
    byUser: ['reviews', 'user'],
  },
  
  // Dashboard (Admin)
  dashboard: {
    overview: ['dashboard', 'overview'],
    stats: ['dashboard', 'stats'],
  },
};
