import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

export const instagramGalleryKeys = {
  all: ['instagram-gallery'],
};

export const useInstagramGalleryQuery = () =>
  useQuery({
    queryKey: instagramGalleryKeys.all,
    queryFn: async () => {
      const response = await api.get('/instagram/gallery');
      return Array.isArray(response?.data?.data) ? response.data.data : [];
    },
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
