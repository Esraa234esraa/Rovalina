import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminFAQsKeys = {
  all: ['admin-faqs'],
};

export const useAdminFAQsQuery = () =>
  useQuery({
    queryKey: adminFAQsKeys.all,
    queryFn: async () => {
      const response = await adminApi.listFAQs();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useAdminCreateFAQMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createFAQ(payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminFAQsKeys.all }),
  });
};

export const useAdminDeleteFAQMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => adminApi.deleteFAQ(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminFAQsKeys.all }),
  });
};

export const useAdminUpdateFAQMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateFAQ(id, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminFAQsKeys.all }),
  });
};
