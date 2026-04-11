import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../services/shopApi';
import { useUserStore } from '../store';

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

  return useQuery({
    queryKey: userWishlistKeys.all,
    queryFn: async () => {
      const response = await shopApi.getWishlist();
      return normalizeWishlist(response?.data?.data);
    },
    enabled: Boolean(token),
    staleTime: 2 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const useAddToWishlistMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId }) => {
      const response = await shopApi.addToWishlist({ productId });
      return normalizeWishlist(response?.data?.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userWishlistKeys.all, data);
    },
  });
};

export const useRemoveWishlistItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, productId }) => {
      if (itemId) {
        const response = await shopApi.removeWishlistItem(itemId);
        return normalizeWishlist(response?.data?.data);
      }
      const response = await shopApi.removeWishlistProduct(productId);
      return normalizeWishlist(response?.data?.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userWishlistKeys.all, data);
    },
  });
};

export const useWishlistCount = () => {
  const wishlistQuery = useUserWishlistQuery();
  const items = Array.isArray(wishlistQuery.data?.items) ? wishlistQuery.data.items : [];
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
