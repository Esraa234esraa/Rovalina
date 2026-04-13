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
      const shippingRates = Array.isArray(settings.shippingRates)
        ? settings.shippingRates
            .map((rate) => ({
              governorate: String(rate?.governorate || rate?.name || '').trim(),
              city: String(rate?.city || rate?.center || rate?.district || '').trim(),
              fee: Number(rate?.fee ?? rate?.shippingFee ?? rate?.price ?? 0),
            }))
            .filter((rate) => rate.governorate && rate.city)
        : [];

      return {
        ...settings,
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
