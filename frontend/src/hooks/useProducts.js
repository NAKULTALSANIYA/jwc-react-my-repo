import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productService from '../api/services/product.service';
import * as categoryService from '../api/services/category.service';
import { queryKeys } from '../api/queryClient';

/**
 * Hook to fetch all products with optional filters
 */
export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productService.getProducts(filters),
    select: (data) => data.data, // Extract data from response
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProduct = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productService.getProductById(id),
    select: (data) => data.data,
    enabled: !!id, // Only fetch if ID exists
    ...options,
  });
};

/**
 * Hook to fetch a product by slug
 */
export const useProductBySlug = (slug, options = {}) => {
  return useQuery({
    queryKey: queryKeys.products.bySlug(slug),
    queryFn: () => productService.getProductBySlug(slug),
    select: (data) => data.data,
    enabled: !!slug,
    ...options,
  });
};

/**
 * Hook to fetch featured products
 */
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.featured,
    queryFn: productService.getFeaturedProducts,
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch new arrivals
 */
export const useNewArrivals = () => {
  return useQuery({
    queryKey: queryKeys.products.newArrivals,
    queryFn: productService.getNewArrivals,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search products
 */
export const useSearchProducts = (query, options = {}) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productService.searchProducts(query),
    select: (data) => data.data,
    enabled: !!query && query.length > 2, // Only search if query > 2 chars
    ...options,
  });
};

/**
 * Hook to create a product (admin)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

/**
 * Hook to update a product (admin)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.updateProduct,
    onSuccess: (data, variables) => {
      // Invalidate specific product and list queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.products.detail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

/**
 * Hook to delete a product (admin)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: (data, productId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ 
        queryKey: queryKeys.products.detail(productId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

/**
 * Hook to upload product images (admin)
 */
export const useUploadProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.uploadProductImages,
    onSuccess: (data, variables) => {
      // Invalidate specific product
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.products.detail(variables.id) 
      });
    },
  });
};

// ============================================
// CATEGORY HOOKS
// ============================================

/**
 * Hook to fetch all categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: categoryService.getCategories,
    select: (data) => data.data,
    staleTime: 15 * 60 * 1000, // 15 minutes (categories don't change often)
  });
};

/**
 * Hook to fetch a single category by ID
 */
export const useCategory = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    select: (data) => data.data,
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to fetch category with products
 */
export const useCategoryWithProducts = (id) => {
  return useQuery({
    queryKey: ['categories', 'detail', id, 'products'],
    queryFn: () => categoryService.getCategoryWithProducts(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

/**
 * Hook to create a category (admin)
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};

/**
 * Hook to update a category (admin)
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.updateCategory,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.categories.detail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};

/**
 * Hook to delete a category (admin)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: (data, categoryId) => {
      queryClient.removeQueries({ 
        queryKey: queryKeys.categories.detail(categoryId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};
