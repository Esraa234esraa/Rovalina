import { useNavigate } from 'react-router-dom';
import CartEmptyState from '../components/cart/CartEmptyState';
import CartItemCard from '../components/cart/CartItemCard';
import CartSummaryCard from '../components/cart/CartSummaryCard';
import LoadingState from '../components/ui/LoadingState';
import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
  useUserCartQuery,
} from '../hooks/useUserCart';
import { useStoreSettingsQuery } from '../hooks/useStoreSettings';
import { useToast } from '../hooks/useToast';

export default function CartPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cart, isLoading } = useUserCartQuery();
  const { data: storeSettings } = useStoreSettingsQuery();
  const updateQuantityMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const subtotal = Number(cart?.subtotal || 0);
  const enableShipping = Boolean(storeSettings?.enableShipping);
  const enableFreeShipping = Boolean(storeSettings?.enableFreeShipping);
  const freeShippingMinimum = Number(storeSettings?.freeShippingMinimum || 0);
  const shippingFee = Number(storeSettings?.shippingFee || 0);
  let shipping = 0;
  if (enableShipping) {
    if (enableFreeShipping && subtotal >= freeShippingMinimum) {
      shipping = 0;
    } else {
      shipping = shippingFee;
    }
  }
  const total = subtotal + shipping;

  if (isLoading) {
    return <LoadingState text="جاري تحميل السلة..." className="py-24" />;
  }

  if (!items.length) {
    return <CartEmptyState onShop={() => navigate('/shop')} />;
  }

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onDecrease={() =>
                updateQuantityMutation.mutate(
                  { itemId: item.id, quantity: Math.max(1, item.quantity - 1) },
                  {
                    onError: (error) => {
                      toast.error(error?.response?.data?.message || 'تعذر تحديث كمية المنتج.');
                    },
                  }
                )
              }
              onIncrease={() =>
                updateQuantityMutation.mutate(
                  { itemId: item.id, quantity: item.quantity + 1 },
                  {
                    onError: (error) => {
                      toast.error(error?.response?.data?.message || 'تعذر تحديث كمية المنتج.');
                    },
                  }
                )
              }
              onRemove={() =>
                removeItemMutation.mutate(item.id, {
                  onSuccess: () => toast.success('تم حذف المنتج من السلة.'),
                  onError: (error) => {
                    toast.error(error?.response?.data?.message || 'تعذر حذف المنتج من السلة.');
                  },
                })
              }
            />
          ))}
        </div>

        <CartSummaryCard
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          enableFreeShipping={enableFreeShipping}
          onCheckout={() => navigate('/checkout')}
        />
      </div>
    </div>
  );
}
