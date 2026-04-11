import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const catalogProductsKeys = {
  all: ['catalog-products'],
  list: (params) => ['catalog-products', 'list', params],
  details: (id) => ['catalog-products', 'details', id],
};

export const useCatalogProductsQuery = (params = {}) =>
  useQuery({
    queryKey: catalogProductsKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/products', { params });
      return response?.data?.data || { items: [], meta: {} };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useCatalogProductDetailsQuery = (id) =>
  useQuery({
    queryKey: catalogProductsKeys.details(id),
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response?.data?.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
  });
