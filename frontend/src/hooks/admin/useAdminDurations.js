import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/http';

export const adminDurationsKeys = {
  all: ['admin-durations'],
  details: (id) => ['admin-duration-details', id],
};

export const useAdminDurationsQuery = () =>
  useQuery({
    queryKey: adminDurationsKeys.all,
    queryFn: async () => {
      const response = await api.get('/admin/durations');
      return response.data.data;
    },
  });

export const useAdminDurationDetailsQuery = (id, enabled = true) =>
  useQuery({
    queryKey: adminDurationsKeys.details(id),
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      const response = await api.get(`/admin/durations/${id}`);
      return response.data.data;
    },
  });

export const useAdminCreateDurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/admin/durations', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDurationsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['catalog-durations'] });
    },
  });
};

export const useAdminUpdateDurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await api.patch(`/admin/durations/${id}`, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDurationsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['catalog-durations'] });
    },
  });
};

export const useAdminDeleteDurationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/admin/durations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDurationsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['catalog-durations'] });
    },
  });
};
