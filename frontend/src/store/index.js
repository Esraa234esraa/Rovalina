import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, { ...product, quantity }],
          };
        });
      },
      
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'rovalina-cart',
    }
  )
);

// Theme Store
export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleDarkMode: () =>
        set((state) => ({
          isDark: !state.isDark,
        })),
      setDarkMode: (isDark) =>
        set({
          isDark,
        }),
    }),
    {
      name: 'rovalina-theme',
    }
  )
);

// Auth Store (Admin)
export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminEmail: null,
      adminProfile: null,
      token: null,
      login: (admin, authToken = null) =>
        set({
          isAuthenticated: true,
          adminEmail: typeof admin === 'string' ? admin : admin?.email ?? null,
          adminProfile: typeof admin === 'object' ? admin : null,
          token: authToken || admin?.token || null,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          adminEmail: null,
          adminProfile: null,
          token: null,
        }),
    }),
    {
      name: 'rovalina-auth',
    }
  )
);

// Wishlist Store
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          if (exists) {
            return {
              items: state.items.filter((item) => item.id !== product.id),
            };
          }
          return {
            items: [...state.items, product],
          };
        });
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((item) => item.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'rovalina-wishlist',
    }
  )
);

// User Auth Store (Customer)
export const useUserStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      token: null,

      loginUser: ({ name, email, role, id }, userToken = null) =>
        set({
          isLoggedIn: true,
          user: { name, email, role: role || 'CUSTOMER', id: id || null },
          token: userToken,
        }),

      logoutUser: () =>
        set({
          isLoggedIn: false,
          user: null,
          token: null,
        }),
    }),
    {
      name: 'rovalina-user-auth',
    }
  )
);

// Reviews Store
export const useReviewStore = create(
  persist(
    (set) => ({
      productReviews: [],
      siteReviews: [],

      addProductReview: ({ productId, name, rating, comment }) =>
        set((state) => ({
          productReviews: [
            {
              id: Date.now(),
              productId,
              name: name?.trim() || 'عميل',
              rating,
              comment: comment?.trim() || '',
              date: new Date().toISOString(),
            },
            ...state.productReviews,
          ],
        })),

      addSiteReview: ({ name, rating, comment }) =>
        set((state) => ({
          siteReviews: [
            {
              id: Date.now(),
              name: name?.trim() || 'عميل',
              rating,
              quote: comment?.trim() || '',
              date: new Date().toISOString(),
            },
            ...state.siteReviews,
          ],
        })),
    }),
    {
      name: 'rovalina-reviews',
    }
  )
);

