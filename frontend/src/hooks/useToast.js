import { useToastStore } from '../store/toastStore';

export const useToast = () => {
  const pushToast = useToastStore((state) => state.pushToast);

  return {
    success: (message, duration) => pushToast({ type: 'success', message, duration }),
    error: (message, duration) => pushToast({ type: 'error', message, duration }),
    info: (message, duration) => pushToast({ type: 'info', message, duration }),
  };
};
