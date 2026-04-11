import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const catalogCategoriesKeys = {
  all: ['catalog-categories'],
};

export const useCatalogCategoriesQuery = () =>
  useQuery({
    queryKey: catalogCategoriesKeys.all,
    queryFn: async () => {
      const response = await api.get('/categories');
      return response?.data?.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
