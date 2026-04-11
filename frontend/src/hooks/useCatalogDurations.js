import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const catalogDurationsKeys = {
  all: ['catalog-durations'],
};

export const useCatalogDurationsQuery = () =>
  useQuery({
    queryKey: catalogDurationsKeys.all,
    queryFn: async () => {
      const response = await api.get('/durations');
      return response?.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useCatalogDurations = useCatalogDurationsQuery;
