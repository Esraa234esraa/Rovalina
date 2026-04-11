import { Suspense, lazy, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import LoadingState from '../components/ui/LoadingState';
import { useFeaturedProductsQuery } from '../hooks/useFeaturedProducts';
import { useCatalogOffersQuery, useFeaturedOffersQuery } from '../hooks/useCatalogOffers';

const ProductCard = lazy(() => import('../components/ui/ProductCard'));

const FALLBACK_OFFER_IMAGE = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop';

const safeText = (ar, en, fallback = 'Offer') => {
  const value = String(ar || '').trim();
  if (value && /^[^"?]+$/.test(value)) return value;
  return String(en || fallback);
};

const getOfferProducts = (offer) => {
  const list = Array.isArray(offer?.applicableProducts) ? offer.applicableProducts : [];
  return list
    .map((item) => {
      const product = item?.product || item;
      const id = product?.id || item?.productId || null;
      const name = product?.name || product?.nameEn || (id ? `منتج #${id}` : null);
      if (!name) return null;
      return { id, name };
    })
    .filter(Boolean);
};

export default function OffersPage() {
  const navigate = useNavigate();
  const {
    data: allOffers = [],
    isLoading: isOffersLoading,
    isFetching: isOffersFetching,
    isError: isOffersError,
    error: offersError,
  } = useCatalogOffersQuery();
  const {
    data: featuredOffers = [],
    isLoading: isFeaturedOffersLoading,
    isError: isFeaturedOffersError,
    error: featuredOffersError,
  } = useFeaturedOffersQuery();
  const {
    data: featuredProducts = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useFeaturedProductsQuery();

  const displayOffers = useMemo(() => {
    const source = Array.isArray(featuredOffers) && featuredOffers.length > 0 ? featuredOffers : allOffers;
    return (Array.isArray(source) ? source : []).slice(0, 4);
  }, [allOffers, featuredOffers]);

  const offersLoadError = useMemo(
    () => offersError || featuredOffersError,
    [offersError, featuredOffersError]
  );

  const discountedProducts = useMemo(() => {
    return (Array.isArray(featuredProducts) ? featuredProducts : []).filter((p) => Number(p.discountPercent || p.discount || 0) > 0);
  }, [featuredProducts]);

  const discountTiers = useMemo(() => {
    const offers = Array.isArray(allOffers) ? allOffers : [];
    if (!offers.length) {
      return [
        { discount: '10%', condition: 'على أول طلب' },
        { discount: '20%', condition: 'عند شراء منتجين' },
        { discount: '30%', condition: 'على المنتجات المحددة' },
        { discount: '50%', condition: 'عروض محدودة الوقت' },
      ];
    }

    return offers
      .slice()
      .sort((a, b) => Number(b.discount || 0) - Number(a.discount || 0))
      .slice(0, 4)
      .map((offer) => ({
        discount: `${Number(offer.discount || 0)}${String(offer.type || '').toUpperCase() === 'FLAT_AMOUNT' ? ' ج.م' : '%'}`,
        condition: safeText(offer.title, offer.titleEn, 'عرض خاص'),
      }));
  }, [allOffers]);

  if (isOffersLoading || isFeaturedOffersLoading) {
    return (
      <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
        <div className="container-fluid py-16">
          <LoadingState text="جاري تحميل العروض..." />
        </div>
      </div>
    );
  }

  if (isOffersError || isFeaturedOffersError) {
    return (
      <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
        <div className="container-fluid py-16">
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            حدث خطأ أثناء تحميل العروض.
            <p className="mt-2 text-sm opacity-80">{offersLoadError?.message || 'يرجى المحاولة مرة أخرى.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 dark:from-primary-700 dark:via-secondary-700 dark:to-primary-700 text-ink-900 dark:text-secondary-100">
        <div className="container-fluid py-16">
          <h1 className="text-5xl font-bold mb-4">عروضنا المميزة</h1>
          <p className="text-lg text-ink-800 dark:text-secondary-200">اكتشفي أجمل التخفيضات والعروض الخاصة</p>
        </div>
      </div>

      <div className="container-fluid py-12">
        {isOffersFetching ? (
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">يتم تحديث العروض في الخلفية...</div>
        ) : null}

        <div className="mb-16">
          {displayOffers.length === 0 ? (
            <div className="rounded-2xl border border-surface-300 dark:border-primary-900/40 p-10 text-center text-ink-600 dark:text-secondary-300 bg-white/70 dark:bg-dark-card/60">
              لا توجد عروض متاحة الآن.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayOffers.map((offer) => {
                const offerProducts = getOfferProducts(offer);

                return (
                  <div
                    key={offer.id}
                    className={`relative rounded-2xl overflow-hidden group cursor-pointer transition transform hover:scale-[1.02] ${
                      offer.isFeatured ? 'lg:col-span-2' : ''
                    }`}
                    onClick={() => navigate('/shop')}
                  >
                  <img
                    src={offer.imageUrl || offer.image || FALLBACK_OFFER_IMAGE}
                    alt={safeText(offer.title, offer.titleEn)}
                    className="w-full h-96 object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="text-white">
                      <div className="inline-block mb-4 px-4 py-2 bg-primary-500 rounded-full text-ink-900">
                        <p className="font-bold text-lg">
                          {Number(offer.discount || 0)}
                          {String(offer.type || '').toUpperCase() === 'FLAT_AMOUNT' ? ' ج.م' : '%'}
                        </p>
                      </div>
                      <h3 className="text-3xl font-bold mb-2">{safeText(offer.title, offer.titleEn)}</h3>
                      {offer.titleEn ? <p className="text-secondary-100 mb-4">{offer.titleEn}</p> : null}
                      <p className="text-white/80 mb-4">{safeText(offer.description, offer.titleEn, 'عرض حصري لفترة محدودة')}</p>

                      <div className="mb-4 rounded-xl bg-white/15 backdrop-blur p-3">
                        <p className="text-sm text-white/80 mb-2">المنتجات داخل العرض</p>
                        {offerProducts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {offerProducts
                              .slice(0, 4)
                              .map((product) => (
                                <Link
                                  key={`${offer.id}-${product.id || product.name}`}
                                  to={product.id ? `/product/${product.id}` : '/shop'}
                                  onClick={(event) => event.stopPropagation()}
                                  className="px-3 py-1 rounded-full bg-white/25 hover:bg-white/35 text-white text-xs md:text-sm transition"
                                >
                                  {product.name}
                                </Link>
                              ))}
                            {offerProducts.length > 4 ? (
                              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs md:text-sm">
                                +{offerProducts.length - 4} أكثر
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-sm text-white/75">سيتم تطبيق الخصم على منتجات مختارة داخل المتجر.</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-2 bg-white/20 backdrop-blur rounded-lg">
                          <p className="text-sm text-white/70">كود الخصم</p>
                          <p className="font-bold text-white">{offer.code}</p>
                        </div>
                        <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-ink-900 rounded-lg font-semibold transition">
                          تسوقي الآن
                        </button>
                      </div>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-ink-800 dark:text-secondary-100 mb-8">مستويات الخصم</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {discountTiers.map((tier, index) => (
              <div
                key={`${tier.condition}-${index}`}
                className="bg-surface-50 dark:bg-dark-card rounded-xl p-6 border-2 border-secondary-300 dark:border-primary-800 text-center hover:shadow-lg transition"
              >
                <p className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">{tier.discount}</p>
                <p className="text-ink-600 dark:text-secondary-300 font-medium">{tier.condition}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <h2 className="text-3xl font-bold text-ink-800 dark:text-secondary-100">منتجات مخفضة ({discountedProducts.length})</h2>
          </div>
        </div>

        {isProductsLoading ? (
          <LoadingState text="جاري تحميل المنتجات المخفضة..." />
        ) : isProductsError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            حدث خطأ أثناء تحميل المنتجات.
            <p className="mt-2 text-sm opacity-80">{productsError?.message || 'يرجى المحاولة مرة أخرى.'}</p>
          </div>
        ) : discountedProducts.length === 0 ? (
          <div className="rounded-2xl border border-surface-300 dark:border-primary-900/40 p-10 text-center text-ink-600 dark:text-secondary-300 bg-white/70 dark:bg-dark-card/60">
            لا توجد منتجات مخفضة حاليًا.
          </div>
        ) : (
          <Suspense fallback={<LoadingState text="جاري تجهيز بطاقات المنتجات..." />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}
