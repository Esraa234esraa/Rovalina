import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const catalogBrandsKeys = {
  all: ['catalog-brands'],
};

export const useCatalogBrandsQuery = () =>
  useQuery({
    queryKey: catalogBrandsKeys.all,
    queryFn: async () => {
      const response = await api.get('/brands');
      return Array.isArray(response?.data?.data) ? response.data.data : [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
