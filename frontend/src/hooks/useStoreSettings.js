import { useQuery } from '@tanstack/react-query';
import { shopApi } from '../services/shopApi';

export const storeSettingsKeys = {
  all: ['store-settings'],
};

const normalizeSettings = (settings) => {
  const source = settings && typeof settings === 'object' ? settings : {};
  const walletNumber =
    source.walletNumber ||
    source.walletPhone ||
    source.walletAccount ||
    source.wallet ||
    '';
  const instapayNumber =
    source.instapayNumber ||
    source.instaPayNumber ||
    source.instapayPhone ||
    source.instapayAccount ||
    source.instapay ||
    '';
  const shippingRates = Array.isArray(source.shippingRates)
    ? Array.from(
        source.shippingRates.reduce((acc, rate) => {
          const governorate = String(rate?.governorate || rate?.name || '').trim();
          if (!governorate) return acc;

          acc.set(governorate, {
            governorate,
            fee: Number(rate?.fee ?? rate?.shippingFee ?? rate?.price ?? 0),
          });

          return acc;
        }, new Map()).values()
      )
    : [];

  return {
    ...source,
    enableShipping: Boolean(source.enableShipping ?? true),
    enableCOD: Boolean(source.enableCOD ?? true),
    enableInstapay: Boolean(source.enableInstapay ?? instapayNumber),
    enableWallet: Boolean(source.enableWallet ?? walletNumber),
    enablePaymob: Boolean(source.enablePaymob ?? false),
    enableTax: Boolean(source.enableTax ?? true),
    shippingFee: Number(source.shippingFee || 0),
    freeShippingMinimum: Number(source.freeShippingMinimum || 0),
    taxRate: Number(source.taxRate || 0),
    deliveryDays: Number(source.deliveryDays || 0),
    walletNumber: String(walletNumber || '').trim(),
    instapayNumber: String(instapayNumber || '').trim(),
    shippingRates,
  };
};

export const useStoreSettingsQuery = () =>
  useQuery({
    queryKey: storeSettingsKeys.all,
    queryFn: async () => {
      const response = await shopApi.getSettings();
      return normalizeSettings(response?.data?.data);
    },
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
