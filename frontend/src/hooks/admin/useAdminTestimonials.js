import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { engagementTestimonialsKeys } from '../useEngagementTestimonials';

export const adminTestimonialsKeys = {
  all: ['admin-testimonials'],
};

export const useAdminTestimonialsQuery = () =>
  useQuery({
    queryKey: adminTestimonialsKeys.all,
    queryFn: async () => {
      const response = await adminApi.listTestimonials();
      return response.data.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 15 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

export const useAdminCreateTestimonialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createTestimonial(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTestimonialsKeys.all });
      queryClient.invalidateQueries({ queryKey: engagementTestimonialsKeys.all });
    },
  });
};

export const useAdminDeleteTestimonialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => adminApi.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTestimonialsKeys.all });
      queryClient.invalidateQueries({ queryKey: engagementTestimonialsKeys.all });
    },
  });
};

export const useAdminUpdateTestimonialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateTestimonial(id, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminTestimonialsKeys.all });
      queryClient.invalidateQueries({ queryKey: engagementTestimonialsKeys.all });
    },
  });
};
