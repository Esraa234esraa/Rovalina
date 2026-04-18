import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useCartStore, useUserStore } from '../store';
import CheckoutEmptyState from '../components/checkout/CheckoutEmptyState';
import CheckoutForm from '../components/checkout/CheckoutForm';
import CheckoutSummaryCard from '../components/checkout/CheckoutSummaryCard';
import { useToast } from '../hooks/useToast';
import { shopApi } from '../services/shopApi';
import { useUserCartQuery, userCartKeys } from '../hooks/useUserCart';
import { useStoreSettingsQuery } from '../hooks/useStoreSettings';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const isCustomerLoggedIn = useUserStore((state) => state.isLoggedIn);
  const isAdminLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const isLoggedIn = isCustomerLoggedIn || isAdminLoggedIn;
  const guestCartItems = useCartStore((state) => state.items);
  const { data: cart } = useUserCartQuery();
  const { data: storeSettings } = useStoreSettingsQuery();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    governorate: '',
    address: '',
    payment: 'cod',
    paymentProofImage: '',
    paymentProofName: '',
  });

  const shippingRates = useMemo(
    () => (Array.isArray(storeSettings?.shippingRates) ? storeSettings.shippingRates : []),
    [storeSettings]
  );

  const items = useMemo(() => {
    if (isLoggedIn) {
      return Array.isArray(cart?.items) ? cart.items : [];
    }

    if (Array.isArray(cart?.items) && cart.items.length) {
      return cart.items;
    }

    return guestCartItems.map((item) => ({
      id: item.id,
      productId: item.id,
      quantity: Number(item.quantity || 1),
      name: item.name || item.title || 'منتج',
      image: item.image || '',
      price: Number(item.price || 0),
      product: item,
    }));
  }, [cart?.items, guestCartItems, isLoggedIn]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );

  const shipping = useMemo(() => {
    if (!storeSettings?.enableShipping) return 0;
    if (subtotal >= Number(storeSettings?.freeShippingMinimum || 0)) return 0;

    const normalizedGovernorate = String(form.governorate || '').trim().toLowerCase();
    const matchedRate = shippingRates.find(
      (rate) => String(rate?.governorate || '').trim().toLowerCase() === normalizedGovernorate
    );

    if (matchedRate) {
      return Number(matchedRate.fee || 0);
    }

    return Number(storeSettings?.shippingFee || 0);
  }, [form.governorate, shippingRates, storeSettings, subtotal]);

  const tax = useMemo(
    () => (storeSettings?.enableTax ? Number(((subtotal + shipping) * Number(storeSettings?.taxRate || 0)) / 100) : 0),
    [shipping, storeSettings, subtotal]
  );

  const total = useMemo(() => subtotal + shipping + tax, [shipping, subtotal, tax]);

  const paymentRequiresProof = form.payment === 'instapay' || form.payment === 'wallet';
  const walletAccount = String(storeSettings?.walletNumber || '').trim();
  const instapayAccount = String(storeSettings?.instapayNumber || '').trim();

  const availablePaymentOptions = useMemo(() => {
    const options = [];

    if (storeSettings?.enableCOD) {
      options.push({
        value: 'cod',
        label: 'الدفع عند الاستلام',
        description: 'ادفعي نقدًا عند وصول الطلب إليكِ.',
      });
    }

    if (storeSettings?.enableInstapay) {
      options.push({
        value: 'instapay',
        label: 'InstaPay',
        description: instapayAccount ? `رقم Instapay: ${instapayAccount}` : '',
      });
    }

    if (storeSettings?.enableWallet) {
      options.push({
        value: 'wallet',
        label: 'المحفظة الإلكترونية',
        description: walletAccount ? `رقم المحفظة: ${walletAccount}` : '',
      });
    }

    if (storeSettings?.enablePaymob) {
      options.push({
        value: 'paymob',
        label: 'الدفع الإلكتروني (Paymob)',
        description: 'سيتم تحويلك إلى بوابة الدفع الآمنة بعد تأكيد الطلب.',
      });
    }

    return options;
  }, [instapayAccount, storeSettings?.enableCOD, storeSettings?.enableInstapay, storeSettings?.enableWallet, storeSettings?.enablePaymob, walletAccount]);

  const paymentDetails = useMemo(
    () => ({
      cod: {
        note: 'سيتم دفع قيمة الطلب عند استلامه.',
      },
      instapay: {
        account: instapayAccount,
      },
      wallet: {
        account: walletAccount,
      },
      paymob: {
        note: 'بعد تأكيد الطلب سيتم تحويلك إلى بوابة Paymob.',
      },
    }),
    [instapayAccount, walletAccount]
  );

  const availableGovernorates = useMemo(() => {
    const unique = new Set(
      shippingRates
        .map((rate) => String(rate?.governorate || '').trim())
        .filter(Boolean)
    );
    return Array.from(unique);
  }, [shippingRates]);

  const selectedGovernorateRate = useMemo(() => {
    const normalizedGovernorate = String(form.governorate || '').trim().toLowerCase();
    const matchedRate = shippingRates.find(
      (rate) => String(rate?.governorate || '').trim().toLowerCase() === normalizedGovernorate
    );

    if (matchedRate) {
      return Number(matchedRate.fee || 0);
    }

    return Number(storeSettings?.shippingFee || 0);
  }, [form.governorate, shippingRates, storeSettings?.shippingFee]);

  useEffect(() => {
    if (!availablePaymentOptions.length) return;
    const isCurrentValid = availablePaymentOptions.some((option) => option.value === form.payment);
    if (!isCurrentValid) {
      setForm((current) => ({ ...current, payment: availablePaymentOptions[0].value }));
    }
  }, [availablePaymentOptions, form.payment]);

  useEffect(() => {
    if (!availableGovernorates.length) return;

    setForm((current) => {
      if (current.governorate && availableGovernorates.includes(current.governorate)) {
        return current;
      }

      return {
        ...current,
        governorate: availableGovernorates[0],
      };
    });
  }, [availableGovernorates]);

  const createOrderMutation = useMutation({
    mutationFn: async (payload) => {
      const response = isLoggedIn
        ? await shopApi.createOrderFromCart(payload)
        : await shopApi.createOrder(payload);
      return response?.data?.data;
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'تعذر إنشاء الطلب حالياً.');
    },
  });

  if (!items.length) {
    return <CheckoutEmptyState onShop={() => navigate('/shop')} />;
  }

  const validateCheckoutForm = () => {
    const fullName = String(form.fullName || '').trim();
    const phone = String(form.phone || '').trim();
    const email = String(form.email || '').trim();
    const governorate = String(form.governorate || '').trim();
    const city = String(form.city || '').trim();
    const address = String(form.address || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');

    if (!availablePaymentOptions.length) {
      toast.error('لا توجد وسيلة دفع مفعلة حالياً.');
      return false;
    }

    if (!fullName) {
      toast.error('الاسم الكامل مطلوب.');
      return false;
    }

    if (fullName.length < 3) {
      toast.error('الاسم الكامل يجب أن يكون 3 أحرف على الأقل.');
      return false;
    }

    if (!phone) {
      toast.error('رقم الهاتف مطلوب.');
      return false;
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error('رقم الهاتف غير صحيح.');
      return false;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('صيغة البريد الإلكتروني غير صحيحة.');
        return false;
      }
    }

    if (!governorate) {
      toast.error('اختاري المحافظة.');
      return false;
    }

    if (!city) {
      toast.error('اكتبي المدينة.');
      return false;
    }

    if (!address) {
      toast.error('العنوان بالتفصيل مطلوب.');
      return false;
    }

    if (address.length < 10) {
      toast.error('العنوان بالتفصيل قصير جدًا.');
      return false;
    }

    if (!availablePaymentOptions.some((option) => option.value === form.payment)) {
      toast.error('اختاري وسيلة دفع صحيحة.');
      return false;
    }

    if (!isLoggedIn) {
      if (!Array.isArray(items) || items.length === 0) {
        toast.error('السلة فارغة. أضيفي منتجات أولاً.');
        return false;
      }

      const invalidItem = items.find(
        (item) => !(item.productId || item.id) || Number(item.quantity || 0) <= 0
      );
      if (invalidItem) {
        toast.error('تعذر إكمال الطلب: يوجد منتج غير صالح في السلة.');
        return false;
      }
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!availableGovernorates.length) {
      toast.error('لا يمكن إكمال الطلب حالياً: لا توجد محافظات مفعلة في إعدادات الشحن.');
      return;
    }

    if (!validateCheckoutForm()) {
      return;
    }

    if (paymentRequiresProof && !paymentDetails[form.payment]?.account) {
      toast.error('رقم التحويل غير متاح من إعدادات الأدمن حالياً.');
      return;
    }

    if (paymentRequiresProof && !form.paymentProofImage) {
      toast.error('أرفقي صورة التحويل قبل تأكيد الطلب.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = isLoggedIn
        ? {
            paymentMethod:
              form.payment === 'instapay'
                ? 'INSTAPAY'
                : form.payment === 'wallet'
                  ? 'WALLET'
                  : form.payment === 'paymob'
                    ? 'CARD'
                    : 'COD',
            customerName: form.fullName,
            customerEmail: form.email,
            customerPhone: form.phone,
            city: form.city,
            governorate: form.governorate,
            postalCode: '',
            addressLine: form.address,
            notes: '',
            paymentProofImage: form.paymentProofImage || null,
          }
        : {
            items: items.map((item) => ({
              productId: item.productId || item.id,
              quantity: Number(item.quantity || 1),
              selectedColor: item.selectedColor || null,
            })),
            paymentMethod:
              form.payment === 'instapay'
                ? 'INSTAPAY'
                : form.payment === 'wallet'
                  ? 'WALLET'
                  : form.payment === 'paymob'
                    ? 'CARD'
                    : 'COD',
            customerName: form.fullName,
            customerEmail: form.email,
            customerPhone: form.phone,
            city: form.city,
            governorate: form.governorate,
            postalCode: '',
            addressLine: form.address,
            notes: '',
            shippingFee: shipping,
            taxAmount: tax,
            discountAmount: 0,
            paymentProofImage: form.paymentProofImage || null,
          };

      const order = await createOrderMutation.mutateAsync({
        ...orderPayload,
      });

      if (!isLoggedIn) {
        useCartStore.getState().clearCart();
      }

      queryClient.invalidateQueries({ queryKey: userCartKeys.all });
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });

      const orderNumber = order?.orderNumber || order?.id;

      if (form.payment === 'paymob' && storeSettings?.enablePaymob) {
        const paymentResponse = await shopApi.createPayment({ orderId: order?.id });
        const iframeUrl = paymentResponse?.data?.data?.iframeUrl;

        if (!iframeUrl) {
          throw new Error('تعذر إنشاء رابط الدفع الإلكتروني.');
        }

        toast.success('تم إنشاء الطلب. جاري تحويلك إلى بوابة الدفع...');
        window.location.assign(iframeUrl);
        return;
      }

      toast.success('تم إنشاء الطلب بنجاح.');
      navigate(`/order-success/${orderNumber}`, {
        state: {
          paymentMethod: form.payment,
          paymentLabel: availablePaymentOptions.find((option) => option.value === form.payment)?.label || 'الدفع عند الاستلام',
          paymentDetails: paymentDetails[form.payment] || null,
        },
      });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'تعذر إكمال عملية الدفع حالياً.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CheckoutForm
          form={form}
          setForm={setForm}
          onSubmit={submit}
          loading={loading}
          paymentOptions={availablePaymentOptions}
          paymentDetails={paymentDetails}
          paymentRequiresProof={paymentRequiresProof}
          governorates={availableGovernorates}
          selectedGovernorateRate={selectedGovernorateRate}
          appliedShippingFee={shipping}
          shippingEnabled={Boolean(storeSettings?.enableShipping)}
          isFreeShippingApplied={shipping === 0 && subtotal >= Number(storeSettings?.freeShippingMinimum || 0)}
          onPaymentProofChange={(fileData) =>
            setForm((current) => ({
              ...current,
              paymentProofImage: fileData.image,
              paymentProofName: fileData.name,
            }))
          }
        />

        <CheckoutSummaryCard
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
        />
      </div>
    </div>
  );
}
