import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';

export const adminSettingsKeys = {
  all: ['admin-settings'],
};

export const useAdminSettingsQuery = () =>
  useQuery({
    queryKey: adminSettingsKeys.all,
    queryFn: async () => {
      const response = await adminApi.getSettings();
      const settings = response.data.data || {};
      const ratesSource = Array.isArray(settings.shippingRates) ? settings.shippingRates : [];
      const shippingRatesMap = new Map();

      ratesSource.forEach((rate) => {
        const governorate = String(rate?.governorate || rate?.name || '').trim();
        if (!governorate) return;
        shippingRatesMap.set(governorate, {
          governorate,
          fee: Number(rate?.fee ?? rate?.shippingFee ?? rate?.price ?? 0),
        });
      });

      const shippingRates = Array.from(shippingRatesMap.values());

      return {
        ...settings,
        enableFreeShipping: Boolean(settings.enableFreeShipping ?? false),
        shippingRates,
      };
    },
  });

export const useAdminUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const response = await adminApi.updateSettings(payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsKeys.all });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
  });
};
