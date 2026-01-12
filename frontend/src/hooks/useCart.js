import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cartService from '../api/services/cart.service';
import { queryKeys } from '../api/queryClient';
import { tokenManager } from '../api/axios';

// Cart persistence helpers
const CART_STORAGE_KEY = 'jwc_cart_data';

export const getCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to read cart from storage:', error);
    return null;
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Failed to save cart to storage:', error);
  }
};

const clearCartFromStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear cart from storage:', error);
  }
};

/**
 * Hook to fetch user's cart
 */
export const useCart = () => {
  const isAuthenticated = !!tokenManager.getAccessToken();
  
  return useQuery({
    queryKey: queryKeys.cart.items,
    queryFn: cartService.getCart,
    // Normalise API response shape to always return the cart object
    select: (data) => {
      const normalizedData = data?.data?.cart || data?.data?.data?.cart || data?.cart || data;
      // Persist to storage on successful fetch
      if (normalizedData?.items) {
        saveCartToStorage(normalizedData);
      }
      return normalizedData;
    },
    // Use stored cart as fallback while stale
    placeholderData: () => getCartFromStorage() || undefined,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    // Keep trying in background but don't fail visually
    retry: (failureCount, error) => {
      // Don't retry on 401 (user not authenticated)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Only enable if user is authenticated
    enabled: isAuthenticated,
  });
};

/**
 * Hook to get cart item count
 */
export const useCartCount = () => {
  const { data: cart } = useCart();
  
  // Calculate total items in cart
  const count = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  return count;
};

/**
 * Hook to add item to cart
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = !!tokenManager.getAccessToken();

  return useMutation({
    mutationFn: async (newItem) => {
      if (!isAuthenticated) {
        const baseCart = getCartFromStorage() || { items: [] };
        const items = Array.isArray(baseCart.items) ? baseCart.items : [];

        const existingItemIndex = items.findIndex(
          (item) =>
            item.product?._id === newItem.productId &&
            item.size === newItem.size &&
            item.color === newItem.color &&
            (item.variantId === newItem.variantId || item.variantId?.toString?.() === newItem.variantId)
        );

        const updatedCart = existingItemIndex !== -1
          ? {
              ...baseCart,
              items: items.map((item, idx) =>
                idx === existingItemIndex
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            }
          : {
              ...baseCart,
              items: [
                ...items,
                {
                  product: newItem.productData || { _id: newItem.productId },
                  variantId: newItem.variantId,
                  quantity: newItem.quantity,
                  size: newItem.size,
                  color: newItem.color,
                  price: newItem.price,
                  finalPrice: newItem.price,
                  discountPrice: 0,
                },
              ],
            };

        saveCartToStorage(updatedCart);
        // Update query cache to reflect storage
        queryClient.setQueryData(queryKeys.cart.items, updatedCart);
        return { data: { cart: updatedCart } };
      }

      return cartService.addToCart(newItem);
    },
    onMutate: async (newItem) => {
      // Skip optimistic update for unauthenticated users - mutationFn already handles it
      if (!isAuthenticated) {
        return { previousCart: null };
      }

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(queryKeys.cart.items);

      // Optimistically update cart for authenticated users
      queryClient.setQueryData(queryKeys.cart.items, (old) => {
        const baseCart = old ?? { items: [] };
        const items = Array.isArray(baseCart.items) ? baseCart.items : [];

        const existingItemIndex = items.findIndex(
          (item) => 
            item.product._id === newItem.productId && 
            item.size === newItem.size && 
            item.color === newItem.color
        );

        const updatedCart = existingItemIndex !== -1
          ? {
              ...baseCart,
              items: items.map((item, idx) =>
                idx === existingItemIndex
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            }
          : {
              ...baseCart,
              items: [
                ...items,
                {
                  product: newItem.productData || { _id: newItem.productId },
                  variantId: newItem.variantId,
                  quantity: newItem.quantity,
                  size: newItem.size,
                  color: newItem.color,
                  price: newItem.price,
                  finalPrice: newItem.price,
                  discountPrice: 0,
                },
              ],
            };

        // Persist optimistic update immediately
        saveCartToStorage(updatedCart);
        return updatedCart;
      });

      return { previousCart: previousCart ?? null };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.items, context.previousCart);
        saveCartToStorage(context.previousCart);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.items });
      }
    },
    onSettled: () => {
      // Refetch after mutation when authenticated, otherwise ensure cache matches storage
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.items });
      } else {
        queryClient.setQueryData(queryKeys.cart.items, getCartFromStorage() || { items: [] });
      }
    },
  });
};

/**
 * Hook to update cart item quantity with optimistic updates
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = !!tokenManager.getAccessToken();

  return useMutation({
    mutationFn: async (updatedItem) => {
      const variantId = updatedItem.variantId;
      const productId = updatedItem.productId;
      const size = updatedItem.size;
      const color = updatedItem.color;

      if (!isAuthenticated) {
        const baseCart = getCartFromStorage() || { items: [] };
        const items = Array.isArray(baseCart.items) ? baseCart.items : [];

        const updatedCart = {
          ...baseCart,
          items: items.map((item) => {
            if (item.variantId?.toString?.() === updatedItem.variantId || item.variantId === updatedItem.variantId) {
              return { ...item, quantity: updatedItem.quantity };
            }
            if (!item.variantId && productId && item.product?._id === productId && item.size === size && item.color === color) {
              return { ...item, quantity: updatedItem.quantity };
            }
            return item;
          }),
        };

        saveCartToStorage(updatedCart);
        return { data: { cart: updatedCart } };
      }

      return cartService.updateCartItem(updatedItem);
    },
    onMutate: async (updatedItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(queryKeys.cart.items);

      // Optimistically update
      queryClient.setQueryData(queryKeys.cart.items, (old) => {
        const baseCart = old ?? { items: [] };
        const items = Array.isArray(baseCart.items) ? baseCart.items : [];

        const updatedCart = {
          ...baseCart,
          items: items.map((item) => {
            // Match by variantId (unique identifier for cart items)
            if (item.variantId?.toString?.() === updatedItem.variantId || item.variantId === updatedItem.variantId) {
              return { ...item, quantity: updatedItem.quantity };
            }
            if (!item.variantId && updatedItem.productId && item.product?._id === updatedItem.productId && item.size === updatedItem.size && item.color === updatedItem.color) {
              return { ...item, quantity: updatedItem.quantity };
            }
            return item;
          }),
        };

        // Persist optimistic update immediately
        saveCartToStorage(updatedCart);
        return updatedCart;
      });

      return { previousCart };
    },
    onError: (err, updatedItem, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.cart.items, context.previousCart);
      saveCartToStorage(context.previousCart);
    },
    onSettled: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.items });
      } else {
        queryClient.setQueryData(queryKeys.cart.items, getCartFromStorage() || { items: [] });
      }
    },
  });
};

/**
 * Hook to remove item from cart
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = !!tokenManager.getAccessToken();

  return useMutation({
    mutationFn: async (payload) => {
      const variantId = typeof payload === 'string' ? payload : payload?.variantId;
      const productId = typeof payload === 'object' ? payload?.productId : undefined;
      const size = typeof payload === 'object' ? payload?.size : undefined;
      const color = typeof payload === 'object' ? payload?.color : undefined;

      if (!isAuthenticated) {
        const baseCart = getCartFromStorage() || { items: [] };
        const items = Array.isArray(baseCart.items) ? baseCart.items : [];

        const updatedCart = {
          ...baseCart,
          items: items.filter((item) => {
            const matchesVariant = item.variantId?.toString?.() === variantId || item.variantId === variantId;
            const matchesFallback = !item.variantId && productId && item.product?._id === productId && item.size === size && item.color === color;
            return !matchesVariant && !matchesFallback;
          }),
        };

        saveCartToStorage(updatedCart);
        return { data: { cart: updatedCart } };
      }

      return cartService.removeFromCart(variantId);
    },
    onMutate: async (payload) => {
      const variantId = typeof payload === 'string' ? payload : payload?.variantId;
      const productId = typeof payload === 'object' ? payload?.productId : undefined;
      const size = typeof payload === 'object' ? payload?.size : undefined;
      const color = typeof payload === 'object' ? payload?.color : undefined;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(queryKeys.cart.items);

      // Optimistically update
      queryClient.setQueryData(queryKeys.cart.items, (old) => {
        const baseCart = old ?? { items: [] };
        const items = Array.isArray(baseCart.items) ? baseCart.items : [];

        const updatedCart = {
          ...baseCart,
          items: items.filter((item) => {
            const matchesVariant = item.variantId?.toString?.() === variantId || item.variantId === variantId;
            const matchesFallback = !item.variantId && productId && item.product?._id === productId && item.size === size && item.color === color;
            return !matchesVariant && !matchesFallback;
          }),
        };

        // Persist optimistic update immediately
        saveCartToStorage(updatedCart);
        return updatedCart;
      });

      return { previousCart };
    },
    onError: (err, variantId, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.cart.items, context.previousCart);
      saveCartToStorage(context.previousCart);
    },
    onSettled: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.items });
      } else {
        queryClient.setQueryData(queryKeys.cart.items, getCartFromStorage() || { items: [] });
      }
    },
  });
};

/**
 * Hook to clear entire cart
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = !!tokenManager.getAccessToken();

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        const emptyCart = { items: [] };
        saveCartToStorage(emptyCart);
        return { data: { cart: emptyCart } };
      }

      return cartService.clearCart();
    },
    onSuccess: () => {
      // Clear cart cache and storage
      queryClient.setQueryData(queryKeys.cart.items, { items: [] });
      clearCartFromStorage();
    },
  });
};

/**
 * Hook to calculate cart totals
 */
export const useCartTotals = () => {
  const { data: cart } = useCart();

  const subtotal = cart?.items?.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  ) || 0;

  const discount = cart?.discount || 0;
  const shipping = cart?.shipping || 0;
  const tax = cart?.tax || 0;
  const total = subtotal - discount + shipping + tax;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount: cart?.items?.length || 0,
  };
};