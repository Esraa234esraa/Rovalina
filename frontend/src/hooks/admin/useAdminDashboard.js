import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminDashboardKeys = {
  all: ['admin-dashboard'],
};

export const useAdminDashboardQuery = (params = {}) =>
  useQuery({
    queryKey: [...adminDashboardKeys.all, params],
    queryFn: async () => {
      const response = await adminApi.getDashboardOverview(params);
      return response.data.data;
    },
  });
