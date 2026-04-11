import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { instagramGalleryKeys } from '../useInstagramGallery';

export const adminInstagramGalleryKeys = {
  all: ['admin-instagram-gallery'],
};

export const useAdminInstagramGalleryQuery = () =>
  useQuery({
    queryKey: adminInstagramGalleryKeys.all,
    queryFn: async () => {
      const response = await adminApi.listInstagramGalleryItems();
      return Array.isArray(response?.data?.data) ? response.data.data : [];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

export const useAdminCreateInstagramGalleryItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createInstagramGalleryItem(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInstagramGalleryKeys.all });
      queryClient.invalidateQueries({ queryKey: instagramGalleryKeys.all });
    },
  });
};

export const useAdminUpdateInstagramGalleryItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateInstagramGalleryItem(id, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInstagramGalleryKeys.all });
      queryClient.invalidateQueries({ queryKey: instagramGalleryKeys.all });
    },
  });
};

export const useAdminDeleteInstagramGalleryItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => adminApi.deleteInstagramGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminInstagramGalleryKeys.all });
      queryClient.invalidateQueries({ queryKey: instagramGalleryKeys.all });
    },
  });
};
