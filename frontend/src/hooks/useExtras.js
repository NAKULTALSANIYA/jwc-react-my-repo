import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as wishlistService from '../api/services/wishlist.service';
import * as reviewService from '../api/services/review.service';
import * as dashboardService from '../api/services/dashboard.service';
import { queryKeys } from '../api/queryClient';
import { tokenManager } from '../api/axios';

// ============================================
// WISHLIST HOOKS
// ============================================

/**
 * Hook to fetch user's wishlist
 * Returns empty wishlist for unauthenticated users
 */
export const useWishlist = () => {
  const hasToken = !!tokenManager.getAccessToken();
  
  return useQuery({
    queryKey: queryKeys.wishlist.items,
    queryFn: wishlistService.getWishlist,
    select: (data) => data.data?.wishlist || data.data || { items: [] },
    staleTime: 5 * 60 * 1000,
    enabled: hasToken, // Only fetch if user is authenticated
    initialData: { items: [] }, // Default empty wishlist for unauthenticated users
  });
};

/**
 * Hook to add item to wishlist with optimistic update
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, variantId }) => {
      if (!productId || !variantId) {
        throw new Error('productId and variantId are required');
      }
      return wishlistService.addToWishlist(productId, variantId);
    },
    onMutate: async ({ productId, variantId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.items });
      const previousWishlist = queryClient.getQueryData(queryKeys.wishlist.items);

      // Optimistically add to wishlist
      queryClient.setQueryData(queryKeys.wishlist.items, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: [...(old.items || []), { product: { _id: productId }, variantId }],
        };
      });

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(queryKeys.wishlist.items, context.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
  });
};

/**
 * Hook to remove item from wishlist with optimistic update
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.removeFromWishlist,
    onMutate: async (variantId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.wishlist.items });
      const previousWishlist = queryClient.getQueryData(queryKeys.wishlist.items);

      // Optimistically remove from wishlist
      queryClient.setQueryData(queryKeys.wishlist.items, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items?.filter((item) => item.variantId !== variantId) || [],
        };
      });

      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(queryKeys.wishlist.items, context.previousWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
  });
};

/**
 * Hook to toggle wishlist (add/remove)
 * Handles unauthenticated users gracefully
 */
export const useToggleWishlist = () => {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: wishlist } = useWishlist();

  const toggleWishlist = (productId, variantId) => {
    if (!productId || !variantId) return;
    
    // Check if user is authenticated
    const hasToken = !!tokenManager.getAccessToken();
    if (!hasToken) {
      // Redirect to login page for unauthenticated users
      window.location.href = '/login';
      return;
    }
    
    const items = wishlist?.items || [];
    const isInWishlist = items.some(
      (item) => {
        const matchProduct = (item?.product?._id === productId || item?._id === productId);
        const matchVariant = item?.variantId === variantId;
        return matchProduct && matchVariant;
      }
    );

    if (isInWishlist) {
      removeFromWishlist.mutate(variantId);
    } else {
      addToWishlist.mutate({ productId, variantId });
    }
  };

  return {
    toggleWishlist,
    isLoading: addToWishlist.isPending || removeFromWishlist.isPending,
  };
};

/**
 * Hook to clear wishlist
 */
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: wishlistService.clearWishlist,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.wishlist.items, { items: [] });
    },
  });
};

// ============================================
// REVIEW HOOKS
// ============================================

/**
 * Hook to fetch reviews for a product
 */
export const useProductReviews = (productId, params = {}) => {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId),
    queryFn: () => reviewService.getProductReviews(productId, params),
    select: (data) => data.data,
    enabled: !!productId,
  });
};

/**
 * Hook to fetch user's reviews
 */
export const useUserReviews = () => {
  return useQuery({
    queryKey: queryKeys.reviews.byUser,
    queryFn: reviewService.getUserReviews,
    select: (data) => data.data,
  });
};

/**
 * Hook to create a review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: (data, variables) => {
      // Invalidate product reviews
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(variables.productId),
      });
      // Invalidate user reviews
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byUser });
      // Invalidate product to update rating
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.productId),
      });
    },
  });
};

/**
 * Hook to update a review
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byUser });
    },
  });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byUser });
    },
  });
};

// ============================================
// DASHBOARD HOOKS (Admin)
// ============================================

/**
 * Hook to fetch dashboard overview
 */
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getDashboardOverview,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch dashboard stats
 */
export const useDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.stats, params],
    queryFn: () => dashboardService.getDashboardStats(params),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch revenue analytics
 */
export const useRevenueAnalytics = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'revenue', params],
    queryFn: () => dashboardService.getRevenueAnalytics(params),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch top products
 */
export const useTopProducts = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'top-products', params],
    queryFn: () => dashboardService.getTopProducts(params),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch recent orders
 */
export const useRecentOrders = (params = {}) => {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders', params],
    queryFn: () => dashboardService.getRecentOrders(params),
    select: (data) => data.data,
  });
};
