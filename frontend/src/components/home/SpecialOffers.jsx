import React, { useEffect, useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCatalogOffersQuery, useFeaturedOffersQuery } from '../../hooks/useCatalogOffers';

const FALLBACK_OFFER_IMAGE =
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop';

const MotionDiv = m.div;

export default function SpecialOffers() {
  const safeText = (ar, en) => (/^[^"?]+$/.test(ar || '') ? ar : (en || 'Offer'));
  const getOfferProducts = (offer) => {
    if (!Array.isArray(offer?.applicableProducts)) return [];

    return offer.applicableProducts
      .map((item) => {
        const product = item?.product || item;
        const name = product?.name || product?.nameEn || null;
        const id = product?.id || item?.productId || null;
        if (!name && !id) return null;
        return {
          id,
          name: name || `منتج #${id}`,
        };
      })
      .filter(Boolean);
  };

  const { data: featuredOffers = [] } = useFeaturedOffersQuery();
  const { data: allOffers = [], isLoading: isAllOffersLoading, isFetching: isAllOffersFetching } = useCatalogOffersQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  const sourceOffers = featuredOffers.length > 0 ? featuredOffers : allOffers;
  const normalizedOffers = useMemo(
    () =>
      sourceOffers.map((offer) => ({
        ...offer,
        image: offer.imageUrl || offer.image || FALLBACK_OFFER_IMAGE,
        products: getOfferProducts(offer),
        discountLabel:
          String(offer.type || '').toUpperCase() === 'FLAT_AMOUNT'
            ? `${Number(offer.discount || 0)} ج.م`
            : `${Number(offer.discount || 0)}%`,
      })),
    [sourceOffers]
  );

  const hasMultipleOffers = normalizedOffers.length > 1;

  useEffect(() => {
    if (!hasMultipleOffers) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % normalizedOffers.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [hasMultipleOffers, normalizedOffers.length]);

  const safeIndex = normalizedOffers.length > 0 ? activeIndex % normalizedOffers.length : 0;
  const activeOffer = normalizedOffers[safeIndex] || null;

  const goNext = () => {
    if (!hasMultipleOffers) return;
    setActiveIndex((prev) => (prev + 1) % normalizedOffers.length);
  };

  const goPrev = () => {
    if (!hasMultipleOffers) return;
    setActiveIndex((prev) => (prev - 1 + normalizedOffers.length) % normalizedOffers.length);
  };

  return (
    <section className="section relative bg-gradient-to-b from-pale-pink/50 dark:from-dark-surface/50 to-transparent overflow-hidden">
      {/* Decorative elements */}
      <MotionDiv
        className="absolute top-20 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-primary-200/20 to-rose-200/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <MotionDiv
        className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-gradient-to-br from-rose-200/20 to-primary-200/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="container-fluid relative z-10">
        {/* Section header */}
        <MotionDiv
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <MotionDiv
            className="flex items-center justify-center gap-2 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-6 h-6 text-primary-500" />
            <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45]">
              العروض الخاصة
            </h2>
            <Sparkles className="w-6 h-6 text-primary-500" />
          </MotionDiv>
          <p className="font-arabic text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            اكتشفي عروضنا المحدودة والحصرية
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-400 to-mint dark:to-mint-dark mx-auto mt-6 rounded-full"></div>
        </MotionDiv>

        {activeOffer ? (
          <MotionDiv
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <MotionDiv
                key={activeOffer.id}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <Link to="/offers">
                  <MotionDiv
                    whileHover={{ scale: 1.01 }}
                    className="relative overflow-hidden rounded-3xl h-80 md:h-96 group cursor-pointer bg-gradient-to-br from-[#8a5a55] via-[#6b4a45] to-[#3d2a27]"
                  >
                    <img
                      src={activeOffer.image}
                      alt={safeText(activeOffer.title, activeOffer.titleEn)}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/25 dark:from-black/85" />

                    <div className="absolute inset-0 flex flex-col justify-center pr-6 md:pr-12 text-white">
                      <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-6 h-6" />
                        <span className="font-arabic text-sm font-bold">عرض حصري</span>
                      </div>
                      <h3 className="font-arabic text-3xl md:text-4xl font-bold mb-2 leading-tight">
                        {safeText(activeOffer.title, activeOffer.titleEn)}
                      </h3>
                      <p className="font-arabic text-lg mb-6 opacity-90">
                        {safeText(activeOffer.description, activeOffer.titleEn)}
                      </p>
                      <div className="mb-4">
                        <p className="font-arabic text-sm opacity-90 mb-2">المنتجات داخل العرض</p>
                        {activeOffer.products.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2 max-w-2xl">
                            {activeOffer.products.slice(0, 3).map((product) => (
                              <span
                                key={`${activeOffer.id}-${product.id || product.name}`}
                                className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs md:text-sm"
                              >
                                {product.name}
                              </span>
                            ))}
                            {activeOffer.products.length > 3 ? (
                              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs md:text-sm">
                                +{activeOffer.products.length - 3} منتجات
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <p className="font-arabic text-sm opacity-80">العرض متاح على منتجات مختارة داخل صفحة العروض.</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-primary-400 to-rose-400 px-6 py-3 rounded-full font-bold text-white">
                          {activeOffer.discountLabel}
                        </div>
                        <span className="font-arabic text-sm">الكود: {activeOffer.code}</span>
                      </div>
                    </div>

                    <MotionDiv
                      className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-3"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="w-6 h-6 text-white" />
                    </MotionDiv>
                  </MotionDiv>
                </Link>
              </MotionDiv>

              {hasMultipleOffers ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute top-1/2 -translate-y-1/2 right-3 md:right-4 p-2 rounded-full bg-black/45 hover:bg-black/60 text-white transition"
                    aria-label="السابق"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute top-1/2 -translate-y-1/2 left-3 md:left-4 p-2 rounded-full bg-black/45 hover:bg-black/60 text-white transition"
                    aria-label="التالي"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              ) : null}
            </div>

            {hasMultipleOffers ? (
              <div className="flex justify-center gap-2 mt-5">
                {normalizedOffers.map((offer, index) => (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === safeIndex ? 'w-8 bg-primary-600' : 'w-2.5 bg-primary-300/70'
                    }`}
                    aria-label={`عرض ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </MotionDiv>
        ) : isAllOffersLoading || isAllOffersFetching ? (
          <MotionDiv className="mb-8">
            <div className="rounded-3xl h-80 md:h-96 bg-surface-100 dark:bg-dark-surface animate-pulse border border-surface-300 dark:border-gray-700" />
          </MotionDiv>
        ) : (
          <MotionDiv
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="rounded-2xl border border-surface-300 dark:border-gray-700 bg-white/80 dark:bg-dark-card p-8 text-center">
              <p className="font-arabic text-lg text-ink-700 dark:text-secondary-200 mb-2">لا توجد عروض متاحة حالياً.</p>
              <p className="font-arabic text-sm text-ink-500 dark:text-secondary-300">تصفحي المنتجات واكتشفي أحدث الإضافات لحين نزول عروض جديدة.</p>
            </div>
          </MotionDiv>
        )}

        {/* View all offers button */}
        <MotionDiv
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Link to="/offers" className="btn btn-primary btn-lg">
            <Sparkles className="w-5 h-5" />
            <span className="font-arabic">شاهدي جميع العروض</span>
          </Link>
        </MotionDiv>
      </div>
    </section>
  );
}


