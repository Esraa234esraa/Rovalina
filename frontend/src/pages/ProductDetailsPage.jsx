import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Heart, Star, Minus, Plus, Send, Clock3 } from 'lucide-react';
import { useUserStore } from '../store';
import ProductCard from '../components/ui/ProductCard';
import LoadingState from '../components/ui/LoadingState';
import { useCatalogProductDetailsQuery, useCatalogProductsQuery } from '../hooks/useCatalogProducts';
import { useToast } from '../hooks/useToast';
import { useAddToCartMutation } from '../hooks/useUserCart';
import { useAddToWishlistMutation, useRemoveWishlistItemMutation, useWishlistCount } from '../hooks/useUserWishlist';
import { useCreateProductReviewMutation, useProductReviewsQuery } from '../hooks/useEngagement';

const isCorrupted = (text) => typeof text === 'string' && (/[^\u0600-\u06FF\sa-zA-Z0-9.,:;!()\-_/]/.test(text));

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn } = useUserStore();
  const addToCartMutation = useAddToCartMutation();
  const addToWishlistMutation = useAddToWishlistMutation();
  const removeWishlistItemMutation = useRemoveWishlistItemMutation();
  const createProductReviewMutation = useCreateProductReviewMutation(id);
  const productReviewsQuery = useProductReviewsQuery(id);
  const { data: wishlistData, hasProduct } = useWishlistCount();

  const { data: product, isLoading, isError, error } = useCatalogProductDetailsQuery(id);
  const { data: relatedProductsData } = useCatalogProductsQuery({ categoryId: product?.categoryId, limit: 8 });

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorName, setSelectedColorName] = useState('');
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });

  const liked = hasProduct(id);

  const displayName = useMemo(() => {
    if (!product) return '';
    return isCorrupted(product.name) ? (product.nameEn || 'Lens Product') : product.name;
  }, [product]);

  const displayDescription = useMemo(() => {
    if (!product) return '';
    if (isCorrupted(product.description)) {
      return 'عدسات مريحة بخامات عالية الجودة ومظهر طبيعي يناسب الاستخدام اليومي.';
    }
    return product.description || 'لا يوجد وصف.';
  }, [product]);

  const durationLabel = useMemo(() => {
    if (!product) return null;
    if (typeof product.duration === 'object' && product.duration?.name) return product.duration.name;
    if (typeof product.duration === 'string') return product.duration;
    return null;
  }, [product]);

  const colorVariants = useMemo(() => {
    if (!product) return [];

    const variants = Array.isArray(product.colorVariants)
      ? product.colorVariants
          .map((variant) => {
            const media = Array.isArray(variant?.media) ? variant.media : [];
            const sortedMedia = [...media].sort((a, b) => {
              const aPrimary = a?.isPrimary ? 1 : 0;
              const bPrimary = b?.isPrimary ? 1 : 0;
              if (aPrimary !== bPrimary) return bPrimary - aPrimary;
              return Number(a?.sortOrder || 0) - Number(b?.sortOrder || 0);
            });
            const images = sortedMedia.map((item) => item?.url).filter(Boolean);
            return {
              id: variant?.id || variant?.name,
              name: String(variant?.name || '').trim() || 'لون',
              images: [...new Set(images)],
            };
          })
          .filter((variant) => variant.images.length > 0)
      : [];

    if (variants.length > 0) return variants;

    if (product.image) {
      return [
        {
          id: 'default-color',
          name: product.color || 'اللون الأساسي',
          images: [product.image],
        },
      ];
    }

    return [];
  }, [product]);

  const activeColorName = useMemo(() => {
    const hasSelected = colorVariants.some((variant) => variant.name === selectedColorName);
    if (hasSelected) return selectedColorName;
    return colorVariants[0]?.name || '';
  }, [colorVariants, selectedColorName]);

  const imageGallery = useMemo(() => {
    if (!colorVariants.length) return [];
    const matched = colorVariants.find((variant) => variant.name === activeColorName);
    return matched?.images || colorVariants[0]?.images || [];
  }, [colorVariants, activeColorName]);

  const safeActiveImageIndex = imageGallery.length > 0 ? Math.min(activeImageIndex, imageGallery.length - 1) : 0;

  const relatedProducts = useMemo(() => {
    const items = relatedProductsData?.items || [];
    return items.filter((item) => item.id !== product?.id).slice(0, 4);
  }, [relatedProductsData, product]);

  const reviews = useMemo(() => {
    if (Array.isArray(productReviewsQuery.data)) {
      return productReviewsQuery.data.map((r) => ({
        id: r.id,
        author: r.name || 'مستخدم',
        rating: Number(r.rating || 0),
        date: r.createdAt,
        text: r.comment,
      }));
    }

    if (Array.isArray(product?.reviews)) {
      return product.reviews.map((r) => ({
        id: r.id,
        author: r.name || 'مستخدم',
        rating: Number(r.rating || 0),
        date: r.createdAt,
        text: r.comment,
      }));
    }

    return [];
  }, [product, productReviewsQuery.data]);

  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
      return Number((sum / reviews.length).toFixed(1));
    }
    return Number(product?.rating || 0);
  }, [product?.rating, reviews]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCartMutation.mutate(
      {
        productId: product.id,
        quantity,
        product: {
          ...product,
          selectedColor: activeColorName || null,
          color: activeColorName || product.color,
        },
      },
      {
        onSuccess: () => toast.success('تمت إضافة المنتج إلى السلة.'),
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر إضافة المنتج إلى السلة.');
        },
      }
    );
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (liked) {
      const currentItems = Array.isArray(wishlistData?.items) ? wishlistData.items : [];
      const matchedItem = currentItems.find(
        (item) => item.productId === product.id || item.product?.id === product.id
      );

      removeWishlistItemMutation.mutate(
        { itemId: matchedItem?.id, productId: product.id },
        {
          onSuccess: () => toast.success('تم حذف المنتج من المفضلة.'),
          onError: (error) => {
            toast.error(error?.response?.data?.message || 'تعذر حذف المنتج من المفضلة.');
          },
        }
      );
      return;
    }

    addToWishlistMutation.mutate(
      { productId: product.id, product },
      {
        onSuccess: () => toast.success('تمت إضافة المنتج إلى المفضلة.'),
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر إضافة المنتج إلى المفضلة.');
        },
      }
    );
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!product || !reviewForm.comment.trim()) return;

    if (!isLoggedIn) {
      toast.info('سجلي دخولك أولاً لإرسال تقييم المنتج.');
      navigate('/login');
      return;
    }

    createProductReviewMutation.mutate(
      {
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      },
      {
        onSuccess: () => {
          toast.success('تم إرسال تقييمك بنجاح.');
          setReviewForm({ name: '', rating: 5, comment: '' });
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || 'تعذر إرسال التقييم حالياً.');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-100 dark:bg-dark-bg">
        <div className="container-fluid py-16">
          <LoadingState text="جاري تحميل بيانات المنتج..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background-100 dark:bg-dark-bg flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          حدث خطأ أثناء تحميل المنتج.
          <p className="mt-2 text-sm opacity-80">{error?.message || 'يرجى المحاولة مرة أخرى.'}</p>
          <button onClick={() => navigate('/shop')} className="mt-4 btn btn-primary">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background-100 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink-800 dark:text-secondary-100 mb-4">المنتج غير موجود</h1>
          <button onClick={() => navigate('/shop')} className="btn btn-primary">العودة للمتجر</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-100 dark:bg-dark-bg">
      <div className="container-fluid py-4">
        <nav className="flex gap-2 text-sm text-ink-600 dark:text-secondary-300">
          <Link to="/" className="hover:text-primary-600">الرئيسية</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary-600">المتجر</Link>
          <span>/</span>
          <span className="text-ink-800 dark:text-secondary-100">{displayName}</span>
        </nav>
      </div>

      <div className="container-fluid py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-surface-50 dark:bg-dark-card rounded-xl border border-surface-300 dark:border-primary-900/40 overflow-hidden">
              {imageGallery.length > 0 ? (
                <img
                  src={imageGallery[safeActiveImageIndex] || imageGallery[0]}
                  alt={`${displayName} - ${activeColorName || 'اللون'}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-500">لا توجد صورة</div>
              )}
            </div>

            {imageGallery.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {imageGallery.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition ${
                      activeImageIndex === index ? 'border-primary-600' : 'border-surface-300 dark:border-primary-900/40'
                    }`}
                  >
                    <img src={img} alt={`thumb-${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

          </div>

          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {Number(product.discountPercent || 0) > 0 ? (
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">-{Number(product.discountPercent)}%</span>
              ) : null}
              {product.category?.name ? (
                <span className="px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">{product.category.name}</span>
              ) : null}
              {durationLabel ? (
                <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 inline-flex items-center gap-1">
                  <Clock3 className="w-4 h-4" />
                  {durationLabel}
                </span>
              ) : null}
              {product.stock > 0 ? <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">متوفر</span> : null}
            </div>

            <h1 className="text-3xl font-bold text-ink-800 dark:text-secondary-100 mb-2">{displayName}</h1>
            <p className="text-base text-ink-600 dark:text-secondary-300 mb-4">{product.nameEn}</p>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-ink-600 dark:text-secondary-300">{averageRating.toFixed(1)} ({reviews.length} تقييم)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{Number(product.price || 0)} ج.م</span>
              {product.originalPrice ? <span className="text-lg text-ink-400 line-through">{Number(product.originalPrice)} ج.م</span> : null}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-ink-800 dark:text-secondary-100 mb-2">الوصف</h3>
              <p className="text-ink-600 dark:text-secondary-300">{displayDescription}</p>
              <p className="mt-3 text-sm text-ink-700 dark:text-secondary-200">
                <span className="font-semibold">مدة المنتج:</span> {durationLabel || 'غير محددة'}
              </p>
            </div>

            {colorVariants.length > 0 ? (
              <div className="mb-6 rounded-lg border border-surface-300 dark:border-primary-900/40 p-4 bg-white dark:bg-dark-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-ink-800 dark:text-secondary-100">تبديل اللون</h3>
                  <span className="text-sm text-ink-500 dark:text-secondary-300">{activeColorName || 'غير محدد'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorName(variant.name);
                        setActiveImageIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        activeColorName === variant.name
                          ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'border-surface-300 dark:border-primary-900/40 text-ink-700 dark:text-secondary-200 hover:border-primary-500'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-ink-800 dark:text-secondary-100">الكمية:</span>
                <div className="flex items-center gap-2 bg-surface-200 dark:bg-dark-surface rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-surface-300 dark:hover:bg-dark-card"><Minus className="w-4 h-4" /></button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-surface-300 dark:hover:bg-dark-card"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="flex-1 btn btn-primary">إضافة إلى السلة</button>
                <button
                  onClick={handleWishlistToggle}
                  className={`py-3 px-4 rounded-lg border-2 transition ${liked ? 'border-red-600 bg-red-50' : 'border-surface-300 hover:border-red-600'}`}
                >
                  <Heart className={`w-6 h-6 ${liked ? 'fill-red-600 text-red-600' : 'text-ink-600'}`} />
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <a href="https://wa.me/201001234567" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-green-700 font-semibold hover:text-green-800">
                <Send className="w-5 h-5" />
                اسألي عبر WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold text-ink-800 dark:text-secondary-100 mb-6">تقييمات المنتج</h2>
            <div className="space-y-4">
              {productReviewsQuery.isLoading ? (
                <LoadingState text="جاري تحميل تقييمات المنتج..." />
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-surface-50 dark:bg-dark-card rounded-lg p-6 border border-surface-300 dark:border-primary-900/40">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-ink-800 dark:text-secondary-100">{review.author}</p>
                        <p className="text-sm text-ink-500 dark:text-secondary-300">{new Date(review.date).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-ink-700 dark:text-secondary-200">{review.text}</p>
                  </div>
                ))
              ) : (
                <div className="bg-surface-50 dark:bg-dark-card rounded-lg p-6 border border-surface-300 dark:border-primary-900/40 text-ink-600 dark:text-secondary-300">
                  لا توجد تقييمات لهذا المنتج حتى الآن. كوني أول من يضيف تقييمًا.
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface-50 dark:bg-dark-card rounded-lg p-6 border border-surface-300 dark:border-primary-900/40 h-fit">
            <h3 className="text-xl font-bold text-ink-800 dark:text-secondary-100 mb-4">اكتبي تقييمك للمنتج</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="الاسم (اختياري)"
                value={reviewForm.name}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
                className="input w-full"
              />
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                className="input w-full"
              >
                <option value={5}>5 نجوم</option>
                <option value={4}>4 نجوم</option>
                <option value={3}>3 نجوم</option>
                <option value={2}>2 نجوم</option>
                <option value={1}>1 نجمة</option>
              </select>
              <textarea
                rows={4}
                required
                placeholder="اكتبي رأيك في المنتج"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                className="input w-full"
              />
              <button type="submit" disabled={createProductReviewMutation.isPending} className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                {createProductReviewMutation.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </form>
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-ink-800 dark:text-secondary-100 mb-6">منتجات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
