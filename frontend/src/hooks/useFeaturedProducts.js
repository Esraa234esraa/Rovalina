import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const featuredProductsKeys = {
  all: ['featured-products'],
};

export const useFeaturedProductsQuery = () =>
  useQuery({
    queryKey: featuredProductsKeys.all,
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { featured: true, limit: 40 },
      });
      return response?.data?.data?.items || [];
    },
    select: (items) => (Array.isArray(items) ? items : []),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
