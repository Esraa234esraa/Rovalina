import { create } from 'zustand';

const DEFAULT_DURATION = 3500;

export const useToastStore = create((set) => ({
  toasts: [],
  pushToast: ({ type = 'info', message, duration = DEFAULT_DURATION }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, duration }],
    }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearToasts: () => set({ toasts: [] }),
}));
