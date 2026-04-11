import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const catalogFAQsKeys = {
  all: ['catalog-faqs'],
  byCategory: (category) => ['catalog-faqs', 'category', category],
};

export const useCatalogFAQsQuery = () =>
  useQuery({
    queryKey: catalogFAQsKeys.all,
    queryFn: async () => {
      const response = await api.get('/faqs');
      return response?.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useCatalogFAQsByCategory = (category) =>
  useQuery({
    queryKey: catalogFAQsKeys.byCategory(category),
    queryFn: async () => {
      const response = await api.get(`/faqs/${encodeURIComponent(category)}`);
      return response?.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!category,
  });

export const useCatalogFAQs = useCatalogFAQsQuery;
