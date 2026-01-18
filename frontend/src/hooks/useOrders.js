import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orderService from '../api/services/order.service';
import { queryKeys } from '../api/queryClient';

/**
 * Hook to fetch user's orders
 */
export const useOrders = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.list,
    queryFn: () => orderService.getOrders(params),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single order by ID
 */
export const useOrder = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => orderService.getOrderById(id),
    select: (data) => data.data,
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to create an order (checkout)
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: () => {
      // Clear cart after successful order
      queryClient.setQueryData(queryKeys.cart.items, { items: [] });
      
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

/**
 * Hook to update order status (admin)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.updateOrderStatus,
    onSuccess: (data, variables) => {
      // Invalidate specific order and list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.orders.detail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: (data, orderId) => {
      // Invalidate specific order and list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.orders.detail(orderId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
};

/**
 * Hook to fetch all orders (admin)
 */
export const useAllOrders = (params = {}) => {
  return useQuery({
    queryKey: ['orders', 'admin', 'all', params],
    queryFn: () => orderService.getAllOrders(params),
    select: (data) => data.data,
  });
};

/**
 * Hook to track an order
 */
export const useTrackOrder = (id) => {
  return useQuery({
    queryKey: ['orders', 'track', id],
    queryFn: () => orderService.trackOrder(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};
