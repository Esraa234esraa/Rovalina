import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../services/shopApi';
import { useUserStore } from '../store';

export const userCartKeys = {
  all: ['user-cart'],
  total: ['user-cart-total'],
};

const normalizeCart = (cart) => {
  const source = cart && typeof cart === 'object' ? cart : { items: [] };
  const mappedItems = Array.isArray(source.items)
    ? source.items.map((item) => {
        const product = item?.product || {};
        const price = Number(product.price || 0);
        return {
          id: item.id,
          productId: item.productId || product.id,
          quantity: Number(item.quantity || 1),
          product,
          name: product.name || 'منتج',
          image: product.image || '',
          price,
          stock: Number(product.stock || 0),
        };
      })
    : [];

  const subtotal = mappedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    ...source,
    items: mappedItems,
    subtotal,
  };
};

export const useUserCartQuery = () => {
  const token = useUserStore((state) => state.token);

  return useQuery({
    queryKey: userCartKeys.all,
    queryFn: async () => {
      const response = await shopApi.getCart();
      return normalizeCart(response?.data?.data);
    },
    enabled: Boolean(token),
    staleTime: 2 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

export const useCartTotalsQuery = () => {
  const token = useUserStore((state) => state.token);

  return useQuery({
    queryKey: userCartKeys.total,
    queryFn: async () => {
      try {
        const response = await shopApi.calculateOrderTotal();
        return response?.data?.data || null;
      } catch (error) {
        if (error?.response?.status === 400) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(token),
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }) => {
      const response = await shopApi.addToCart({ productId, quantity });
      return normalizeCart(response?.data?.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userCartKeys.all, data);
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const response = await shopApi.updateCartItem(itemId, { quantity });
      return normalizeCart(response?.data?.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userCartKeys.all, data);
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      const response = await shopApi.removeCartItem(itemId);
      return normalizeCart(response?.data?.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userCartKeys.all, data);
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
    },
  });
};

export const useCartCount = () => {
  const cartQuery = useUserCartQuery();
  const items = Array.isArray(cartQuery.data?.items) ? cartQuery.data.items : [];
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return {
    ...cartQuery,
    count,
  };
};
