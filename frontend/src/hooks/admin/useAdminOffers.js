import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { catalogOffersKeys } from '../useCatalogOffers';

export const adminOffersKeys = {
  all: ['admin-offers'],
};

export const useAdminOffersQuery = () =>
  useQuery({
    queryKey: adminOffersKeys.all,
    queryFn: async () => {
      const response = await adminApi.listOffers();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useAdminCreateOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.createOffer(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOffersKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogOffersKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogOffersKeys.featured });
    },
  });
};

export const useAdminDeleteOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => adminApi.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOffersKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogOffersKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogOffersKeys.featured });
    },
  });
};

export const useAdminUpdateOfferMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await adminApi.updateOffer(id, payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOffersKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogOffersKeys.all });
      queryClient.invalidateQueries({ queryKey: catalogOffersKeys.featured });
    },
  });
};
