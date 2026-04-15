import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import emailjs from '@emailjs/browser';
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
      const serviceId = String(import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim();
      const templateId = String(import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim();
      const publicKey = String(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim();

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration is missing.');
      }

      const templateParams = {
        from_name: String(name || '').trim(),
        from_email: String(email || '').trim(),
        reply_to: String(email || '').trim(),
        phone: String(phone || '').trim() || '-',
        message: String(message || '').trim(),
      };

      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey,
      });

      return { sent: true };
    },
  });

export const useSubscribeNewsletterMutation = () =>
  useMutation({
    mutationFn: async ({ email }) => {
      const response = await api.post('/newsletter/subscribe', { email });
      return response?.data?.data;
    },
  });
