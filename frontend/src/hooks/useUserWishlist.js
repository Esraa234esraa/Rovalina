import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../services/shopApi';
import { useAuthStore, useUserStore, useWishlistStore } from '../store';

export const userWishlistKeys = {
  all: ['user-wishlist'],
};

const normalizeWishlist = (wishlist) => {
  const source = wishlist && typeof wishlist === 'object' ? wishlist : { items: [] };

  const mappedItems = Array.isArray(source.items)
    ? source.items.map((item) => {
        const product = item?.product || {};
        return {
          id: item.id,
          productId: item.productId || product.id,
          product,
        };
      })
    : [];

  return {
    ...source,
    items: mappedItems,
  };
};

export const useUserWishlistQuery = () => {
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const guestSignature = useWishlistStore((state) => state.items.map((item) => item.id).join('|'));
  const hasAuthToken = Boolean(token || adminToken);

  return useQuery({
    queryKey: [...userWishlistKeys.all, hasAuthToken ? `auth:${token || adminToken}` : `guest:${guestSignature}`],
    queryFn: async () => {
      if (hasAuthToken) {
        const response = await shopApi.getWishlist();
        return normalizeWishlist(response?.data?.data);
      }

      return normalizeWishlist({
        items: useWishlistStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          product: item,
        })),
      });
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
  });
};

export const useAddToWishlistMutation = () => {
  const queryClient = useQueryClient();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const hasAuthToken = Boolean(token || adminToken);

  return useMutation({
    mutationFn: async ({ productId, product }) => {
      if (hasAuthToken) {
        const response = await shopApi.addToWishlist({ productId });
        return normalizeWishlist(response?.data?.data);
      }

      const wishlistStore = useWishlistStore.getState();
      const productToStore = product || { id: productId };
      wishlistStore.toggleWishlist(productToStore);

      return normalizeWishlist({
        items: useWishlistStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          product: item,
        })),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userWishlistKeys.all });
    },
  });
};

export const useRemoveWishlistItemMutation = () => {
  const queryClient = useQueryClient();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const hasAuthToken = Boolean(token || adminToken);

  return useMutation({
    mutationFn: async ({ itemId, productId }) => {
      if (hasAuthToken) {
        if (itemId) {
          const response = await shopApi.removeWishlistItem(itemId);
          return normalizeWishlist(response?.data?.data);
        }
        const response = await shopApi.removeWishlistProduct(productId);
        return normalizeWishlist(response?.data?.data);
      }

      useWishlistStore.getState().removeFromWishlist(productId || itemId);
      return normalizeWishlist({
        items: useWishlistStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          product: item,
        })),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userWishlistKeys.all });
    },
  });
};

export const useWishlistCount = () => {
  const wishlistQuery = useUserWishlistQuery();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const guestItems = useWishlistStore((state) => state.items);
  const isAuthenticated = Boolean(token || adminToken);
  const items = isAuthenticated
    ? Array.isArray(wishlistQuery.data?.items)
      ? wishlistQuery.data.items
      : []
    : guestItems;
  const count = items.length;

  const hasProduct = (productId) => {
    return items.some((item) => item.productId === productId || item.product?.id === productId);
  };

  return {
    ...wishlistQuery,
    count,
    hasProduct,
  };
};
