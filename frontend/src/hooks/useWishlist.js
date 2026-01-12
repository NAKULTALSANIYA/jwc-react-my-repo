import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as wishlistService from '../api/services/wishlist.service';
import { queryKeys } from '../api/queryClient';

// Get user's wishlist
export const useWishlist = () => {
  return useQuery({
    queryKey: queryKeys.wishlist.items,
    queryFn: async () => {
      const res = await wishlistService.getWishlist();
      return res.data?.wishlist || res.data?.items || [];
    },
  });
};

// Add item to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
  });
};

// Remove item from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.items });
    },
  });
};

// Check if product is in wishlist
export const useIsInWishlist = (productId) => {
  return useQuery({
    queryKey: ['wishlist', 'check', productId],
    queryFn: () => wishlistService.isInWishlist(productId),
    enabled: !!productId,
  });
};
