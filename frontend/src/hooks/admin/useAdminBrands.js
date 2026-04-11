import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminBrandsKeys = {
  all: ['admin-brands'],
};

export const useAdminBrandsQuery = () =>
  useQuery({
    queryKey: adminBrandsKeys.all,
    queryFn: async () => {
      const response = await adminApi.listBrands();
      return response.data.data;
    },
  });

export const useAdminCreateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createBrand(payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBrandsKeys.all }),
  });
};

export const useAdminDeleteBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => adminApi.deleteBrand(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBrandsKeys.all }),
  });
};

export const useAdminUpdateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateBrand(id, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBrandsKeys.all }),
  });
};
