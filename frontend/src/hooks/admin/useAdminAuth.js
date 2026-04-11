import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const useAdminLoginMutation = () =>
  useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await adminApi.login(email, password);
      return response.data.data;
    },
  });
