import { useQuery } from '@tanstack/react-query';
import api from '../services/http';

const normalizeOffer = (offer) => ({
  id: offer?.id,
  title: offer?.title || '',
  titleEn: offer?.titleEn || '',
  description: offer?.description || '',
  code: offer?.code || '',
  type: String(offer?.type || 'PERCENTAGE').toUpperCase(),
  discount: Number(offer?.discount || 0),
  isFeatured: Boolean(offer?.isFeatured || offer?.featured),
  isActive: Boolean(offer?.isActive ?? true),
  imageUrl: offer?.imageUrl || offer?.image || '',
  startDate: offer?.startDate || null,
  endDate: offer?.endDate || null,
  applicableProducts: Array.isArray(offer?.applicableProducts) ? offer.applicableProducts : [],
});

export const catalogOffersKeys = {
  all: ['catalog-offers'],
  featured: ['catalog-offers', 'featured'],
};

export const useCatalogOffersQuery = () =>
  useQuery({
    queryKey: catalogOffersKeys.all,
    queryFn: async () => {
      const response = await api.get('/offers');
      return response?.data || [];
    },
    select: (data) => {
      const payload = data?.data ?? data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.offers)
        ? payload.offers
        : [];

      return items.map((offer, index) => {
        const normalized = normalizeOffer(offer);
        return {
          ...normalized,
          id: normalized.id || `offer-${index}`,
        };
      });
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

export const useFeaturedOffersQuery = () =>
  useQuery({
    queryKey: catalogOffersKeys.featured,
    queryFn: async () => {
      const response = await api.get('/offers/featured');
      return response?.data || [];
    },
    select: (data) => {
      const payload = data?.data ?? data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.offers)
        ? payload.offers
        : [];

      return items.map((offer, index) => {
        const normalized = normalizeOffer(offer);
        return {
          ...normalized,
          id: normalized.id || `featured-offer-${index}`,
        };
      });
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

export const useCatalogOffers = useCatalogOffersQuery;
