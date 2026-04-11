import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/http';

export const engagementKeys = {
  productReviews: (productId) => ['engagement', 'product-reviews', productId],
};

export const useProductReviewsQuery = (productId) =>
  useQuery({
    queryKey: engagementKeys.productReviews(productId),
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/reviews`);
      return Array.isArray(response?.data?.data) ? response.data.data : [];
    },
    enabled: Boolean(productId),
    staleTime: 3 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
  });

export const useCreateProductReviewMutation = (productId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, rating, comment }) => {
      const response = await api.post(`/products/${productId}/reviews`, {
        name,
        rating,
        comment,
      });
      return response?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.productReviews(productId) });
      queryClient.invalidateQueries({ queryKey: ['catalog-products', 'details', productId] });
    },
  });
};

export const useCreateContactMessageMutation = () =>
  useMutation({
    mutationFn: async ({ name, email, phone, message }) => {
      const response = await api.post('/contact/messages', {
        name,
        email,
        phone,
        message,
      });
      return response?.data?.data;
    },
  });

export const useSubscribeNewsletterMutation = () =>
  useMutation({
    mutationFn: async ({ email }) => {
      const response = await api.post('/newsletter/subscribe', { email });
      return response?.data?.data;
    },
  });
