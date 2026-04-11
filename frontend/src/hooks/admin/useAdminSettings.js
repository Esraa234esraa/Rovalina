import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminSettingsKeys = {
  all: ['admin-settings'],
};

export const useAdminSettingsQuery = () =>
  useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: async () => {
      const response = await adminApi.getSettings();
      return response.data.data;
    },
  });

export const useAdminUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.updateSettings(payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminSettingsKeys.all }),
  });
};
