import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/http';

export const engagementTestimonialsKeys = {
  all: ['engagement-testimonials'],
};

const TESTIMONIALS_CACHE_KEY = 'engagement-testimonials-cache-v1';

const normalizeTestimonial = (item) => ({
  ...item,
  rating: Number(item?.rating || 0),
});

const readTestimonialsCache = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(TESTIMONIALS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTestimonial) : [];
  } catch {
    return [];
  }
};

const writeTestimonialsCache = (items) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(TESTIMONIALS_CACHE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage write errors to avoid blocking UI updates.
  }
};

export const useEngagementTestimonialsQuery = () =>
  useQuery({
    queryKey: engagementTestimonialsKeys.all,
    queryFn: async () => {
      const response = await api.get('/testimonials');
      const payload = response?.data?.data;
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];
      const normalized = items
        .map(normalizeTestimonial)
        .map((item, index) => ({
          ...item,
          id: item?.id || `testimonial-${index}`,
        }));
      writeTestimonialsCache(normalized);
      return normalized;
    },
    initialData: readTestimonialsCache,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 10 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    placeholderData: (previousData) => previousData,
  });

export const useCreateSiteReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, quote, rating }) => {
      const response = await api.post('/site-reviews', {
        name,
        email,
        quote,
        rating,
      });
      return normalizeTestimonial(response?.data?.data || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engagementTestimonialsKeys.all });
    },
  });
};
