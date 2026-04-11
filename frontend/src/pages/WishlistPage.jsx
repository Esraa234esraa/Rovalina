import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import { useUserStore } from '../store';
import LoadingState from '../components/ui/LoadingState';
import { useToast } from '../hooks/useToast';
import { useAddToCartMutation } from '../hooks/useUserCart';
import {
  useRemoveWishlistItemMutation,
  useUserWishlistQuery,
} from '../hooks/useUserWishlist';

export default function WishlistPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn } = useUserStore();
  const { data: wishlist, isLoading } = useUserWishlistQuery();
  const removeWishlistItemMutation = useRemoveWishlistItemMutation();
  const addToCartMutation = useAddToCartMutation();

  const items = Array.isArray(wishlist?.items) ? wishlist.items : [];

  const clearWishlist = () => {
    items.forEach((item) => {
      removeWishlistItemMutation.mutate({ itemId: item.id });
    });
    toast.success('تم مسح قائمة المفضلة.');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
        <div className="container-fluid py-16">
          <div className="text-center py-20">
            <Heart className="w-24 h-24 mx-auto text-secondary-500 mb-6" />
            <h1 className="text-4xl font-bold text-ink-800 dark:text-secondary-100 mb-4">
              سجلي دخولك أولاً
            </h1>
            <p className="text-ink-600 dark:text-secondary-300 mb-8">
              لعرض وإدارة المنتجات المفضلة
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-ink-900 rounded-lg transition font-semibold"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState text="جاري تحميل المفضلة..." className="py-24" />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
        <div className="container-fluid py-16">
          <div className="text-center py-20">
            <Heart className="w-24 h-24 mx-auto text-secondary-500 mb-6" />
            <h1 className="text-4xl font-bold text-ink-800 dark:text-secondary-100 mb-4">
              المفضلة فارغة
            </h1>
            <p className="text-ink-600 dark:text-secondary-300 mb-8">
              لم تضيفي أي منتجات للمفضلة حتى الآن
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-ink-900 rounded-lg transition font-semibold"
            >
              تصفحي المنتجات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="bg-surface-100 dark:bg-dark-card border-b border-surface-300 dark:border-primary-900/40">
        <div className="container-fluid py-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-ink-800 dark:text-secondary-100">قائمتي المفضلة</h1>
            <p className="text-ink-600 dark:text-secondary-300 mt-2">{items.length} منتجات محفوظة</p>
          </div>
          <button
            onClick={clearWishlist}
            className="px-4 py-2 bg-secondary-200 hover:bg-secondary-300 text-ink-700 rounded-lg transition font-semibold"
          >
            مسح الكل
          </button>
        </div>
      </div>

      <div className="container-fluid py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {items.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>

        <div className="bg-surface-50 dark:bg-dark-card rounded-xl border border-surface-300 dark:border-primary-900/40 p-6">
          <h2 className="text-xl font-bold text-ink-800 dark:text-secondary-100 mb-4">إجراءات سريعة</h2>
          <div className="flex flex-wrap gap-3">
            {items.map((item) => (
              <div key={`actions-${item.id}`} className="flex items-center gap-2 bg-background-100 dark:bg-dark-surface rounded-lg px-3 py-2">
                <span className="text-sm text-ink-700 dark:text-secondary-200">{(!(/[A-Za-z]/.test(item.product?.name || '') || /[\^"\?]/.test(item.product?.name || ''))) ? item.product?.name : (item.product?.nameEn || 'Lens Product')}</span>
                <button
                  onClick={() =>
                    addToCartMutation.mutate(
                      { productId: item.productId, quantity: 1 },
                      {
                        onSuccess: () => toast.success('تمت إضافة المنتج إلى السلة.'),
                        onError: (error) => {
                          toast.error(error?.response?.data?.message || 'تعذر إضافة المنتج إلى السلة.');
                        },
                      }
                    )
                  }
                  className="p-1.5 bg-primary-500 hover:bg-primary-600 text-ink-900 rounded-md transition"
                  title="إضافة إلى السلة"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    removeWishlistItemMutation.mutate(
                      { itemId: item.id, productId: item.productId },
                      {
                        onSuccess: () => toast.success('تم حذف المنتج من المفضلة.'),
                        onError: (error) => {
                          toast.error(error?.response?.data?.message || 'تعذر حذف المنتج من المفضلة.');
                        },
                      }
                    )
                  }
                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition"
                  title="إزالة من المفضلة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


