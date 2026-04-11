import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store';
import CheckoutEmptyState from '../components/checkout/CheckoutEmptyState';
import CheckoutForm from '../components/checkout/CheckoutForm';
import CheckoutSummaryCard from '../components/checkout/CheckoutSummaryCard';
import { useToast } from '../hooks/useToast';
import { shopApi } from '../services/shopApi';
import { useCartTotalsQuery, useUserCartQuery, userCartKeys } from '../hooks/useUserCart';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { isLoggedIn } = useUserStore();
  const { data: cart } = useUserCartQuery();
  const totalsQuery = useCartTotalsQuery();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    payment: 'cod',
  });

  const createOrderMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await shopApi.createOrderFromCart(payload);
      return response?.data?.data;
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'تعذر إنشاء الطلب حالياً.');
    },
  });

  const items = Array.isArray(cart?.items) ? cart.items : [];

  if (!isLoggedIn) {
    return <CheckoutEmptyState onShop={() => navigate('/login')} />;
  }

  if (!items.length) {
    return <CheckoutEmptyState onShop={() => navigate('/shop')} />;
  }

  const subtotal = Number(totalsQuery.data?.subtotal || cart?.subtotal || 0);
  const shipping = Number(totalsQuery.data?.shippingFee || (subtotal >= 500 ? 0 : 50));
  const total = Number(totalsQuery.data?.total || subtotal + shipping);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.city || !form.address) return;
    setLoading(true);

    try {
      const order = await createOrderMutation.mutateAsync({
        paymentMethod: form.payment === 'instapay' ? 'INSTAPAY' : 'COD',
        customerName: form.fullName,
        customerPhone: form.phone,
        city: form.city,
        addressLine: form.address,
      });

      queryClient.invalidateQueries({ queryKey: userCartKeys.all });
      queryClient.invalidateQueries({ queryKey: userCartKeys.total });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });

      const orderNumber = order?.orderNumber || order?.id;

      if (form.payment === 'instapay') {
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
      navigate(`/order-success/${orderNumber}`);
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
        <CheckoutForm form={form} setForm={setForm} onSubmit={submit} loading={loading} />

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
