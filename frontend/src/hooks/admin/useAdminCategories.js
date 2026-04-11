import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminCategoriesKeys = {
  all: ['admin-categories'],
};

export const useAdminCategoriesQuery = () =>
  useQuery({
    queryKey: adminCategoriesKeys.all,
    queryFn: async () => {
      const response = await adminApi.listCategories();
      return response.data.data;
    },
  });

export const useAdminCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createCategory(payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
  });
};

export const useAdminDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => adminApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
  });
};

export const useAdminUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateCategory(id, payload);
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
  });
};
