import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminOrdersKeys = {
  all: ['admin-orders'],
};

export const useAdminOrdersQuery = (params = {}) =>
  useQuery({
    queryKey: [...adminOrdersKeys.all, params],
    queryFn: async () => {
      const response = await adminApi.listOrders(params);
      return response.data.data;
    },
  });

export const useAdminUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await adminApi.updateOrderStatus(id, { status });
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all }),
  });
};
