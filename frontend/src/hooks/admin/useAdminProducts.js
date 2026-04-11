import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { featuredProductsKeys } from '../useFeaturedProducts';
import { catalogProductsKeys } from '../useCatalogProducts';
import { engagementKeys } from '../useEngagement';

export const adminProductsKeys = {
  all: ['admin-products'],
  details: (id) => ['admin-product-details', id],
  reviews: (productId) => ['admin-product-reviews', productId],
};

export const useAdminProductsQuery = (params = {}) =>
  useQuery({
    queryKey: [...adminProductsKeys.all, params],
    queryFn: async () => {
      const response = await adminApi.listProducts(params);
      return response.data.data;
    },
  });

export const useAdminProductDetailsQuery = (id, enabled = true) =>
  useQuery({
    queryKey: adminProductsKeys.details(id),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const response = await adminApi.getProductById(id);
      return response.data.data;
    },
  });

export const useAdminProductReviewsQuery = (productId, enabled = true) =>
  useQuery({
    queryKey: adminProductsKeys.reviews(productId),
    enabled: Boolean(productId) && enabled,
    queryFn: async () => {
      const response = await adminApi.listProductReviews(productId);
      return Array.isArray(response?.data?.data) ? response.data.data : [];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

export const useAdminCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createProduct(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: featuredProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogProductsKeys.all });
    },
  });
};

export const useAdminUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateProduct(id, payload);
      return response.data.data;
    },
    onSuccess: (updatedProduct, variables) => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: featuredProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogProductsKeys.all });

      const detailsId = variables?.id || updatedProduct?.id;
      if (detailsId) {
        queryClient.invalidateQueries({ queryKey: catalogProductsKeys.details(detailsId) });
        if (updatedProduct) {
          queryClient.setQueryData(catalogProductsKeys.details(detailsId), updatedProduct);
        }
      }
    },
  });
};

export const useAdminDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await adminApi.deleteProduct(id);
      return response.data;
    },
    onSuccess: (_result, deletedId) => {
      queryClient.invalidateQueries({ queryKey: adminProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: featuredProductsKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogProductsKeys.all });
      if (deletedId) {
        queryClient.removeQueries({ queryKey: catalogProductsKeys.details(deletedId) });
      }
    },
  });
};

export const useAdminUpdateProductReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateProductReview(id, payload);
      return response.data.data;
    },
    onSuccess: (updatedReview) => {
      const productId = updatedReview?.productId;
      if (productId) {
        queryClient.invalidateQueries({ queryKey: adminProductsKeys.reviews(productId) });
        queryClient.invalidateQueries({ queryKey: catalogProductsKeys.details(productId) });
        queryClient.invalidateQueries({ queryKey: engagementKeys.productReviews(productId) });
      }
    },
  });
};

export const useAdminDeleteProductReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }) => {
      await adminApi.deleteProductReview(id);
      return { id, productId };
    },
    onSuccess: ({ productId }) => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: adminProductsKeys.reviews(productId) });
        queryClient.invalidateQueries({ queryKey: catalogProductsKeys.details(productId) });
        queryClient.invalidateQueries({ queryKey: engagementKeys.productReviews(productId) });
      }
    },
  });
};
