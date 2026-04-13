import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../services/shopApi';
import { useAuthStore, useCartStore, useUserStore } from '../store';

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
  const adminToken = useAuthStore((state) => state.token);
  const guestSignature = useCartStore((state) => state.items.map((item) => `${item.id}:${item.quantity}`).join('|'));
  const hasAuthToken = Boolean(token || adminToken);

  return useQuery({
    queryKey: [...userCartKeys.all, hasAuthToken ? `auth:${token || adminToken}` : `guest:${guestSignature}`],
    queryFn: async () => {
      if (hasAuthToken) {
        const response = await shopApi.getCart();
        return normalizeCart(response?.data?.data);
      }

      return normalizeCart({
        items: useCartStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          quantity: item.quantity,
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

export const useCartTotalsQuery = () => {
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const hasAuthToken = Boolean(token || adminToken);

  return useQuery({
    queryKey: [...userCartKeys.total, hasAuthToken ? `auth:${token || adminToken}` : 'guest'],
    queryFn: async () => {
      if (!hasAuthToken) {
        const items = useCartStore.getState().items;
        const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
        return {
          subtotal,
          shippingFee: 0,
          taxAmount: 0,
          discountAmount: 0,
          total: subtotal,
          currency: 'EGP',
        };
      }

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
    enabled: true,
    staleTime: 60 * 1000,
    retry: 1,
  });
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const hasAuthToken = Boolean(token || adminToken);

  return useMutation({
    mutationFn: async ({ productId, quantity = 1, product }) => {
      if (hasAuthToken) {
        const response = await shopApi.addToCart({ productId, quantity });
        return normalizeCart(response?.data?.data);
      }

      const cartStore = useCartStore.getState();
      const productToStore = product || { id: productId, productId, quantity, price: 0 };
      cartStore.addToCart(productToStore, quantity);

      return normalizeCart({
        items: useCartStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          quantity: item.quantity,
          product: item,
        })),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userCartKeys.all });
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const hasAuthToken = Boolean(token || adminToken);

  return useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      if (hasAuthToken) {
        const response = await shopApi.updateCartItem(itemId, { quantity });
        return normalizeCart(response?.data?.data);
      }

      useCartStore.getState().updateQuantity(itemId, quantity);
      return normalizeCart({
        items: useCartStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          quantity: item.quantity,
          product: item,
        })),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userCartKeys.all });
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const hasAuthToken = Boolean(token || adminToken);

  return useMutation({
    mutationFn: async (itemId) => {
      if (hasAuthToken) {
        const response = await shopApi.removeCartItem(itemId);
        return normalizeCart(response?.data?.data);
      }

      useCartStore.getState().removeFromCart(itemId);
      return normalizeCart({
        items: useCartStore.getState().items.map((item) => ({
          id: item.id,
          productId: item.id,
          quantity: item.quantity,
          product: item,
        })),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userCartKeys.all });
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
    },
  });
};

export const useCartCount = () => {
  const cartQuery = useUserCartQuery();
  const token = useUserStore((state) => state.token);
  const adminToken = useAuthStore((state) => state.token);
  const guestItems = useCartStore((state) => state.items);
  const isAuthenticated = Boolean(token || adminToken);
  const items = isAuthenticated
    ? Array.isArray(cartQuery.data?.items)
      ? cartQuery.data.items
      : []
    : guestItems;
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return {
    ...cartQuery,
    count,
  };
};
