import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useFeaturedProductsQuery } from '../../hooks/useFeaturedProducts';

const MotionDiv = motion.div;
const ProductCard = lazy(() => import('../ui/ProductCard'));
const FEATURED_PRODUCT_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const ProductSkeletonCard = () => (
  <div className="card-hover overflow-hidden rounded-2xl bg-white dark:bg-dark-card animate-pulse">
    <div className="h-64 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    </div>
  </div>
);

export default function FeaturedProducts() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(3);
  const {
    data: remoteProducts = [],
    isLoading,
    isFetching,
    isError,
  } = useFeaturedProductsQuery();

  const products = useMemo(() => {
    const source = Array.isArray(remoteProducts)
      ? remoteProducts
      : Array.isArray(remoteProducts?.items)
      ? remoteProducts.items
      : [];

    return source.map((product, index) => {
      const variantImage = Array.isArray(product?.colorVariants)
        ? product.colorVariants
            .flatMap((variant) => (Array.isArray(variant?.media) ? variant.media : []))
            .map((media) => media?.url)
            .find(Boolean)
        : null;

      return {
        ...product,
        id: product?.id || `featured-${index}`,
        image: product?.image || product?.imageUrl || variantImage || FEATURED_PRODUCT_IMAGE_FALLBACK,
        discount: Number(product?.discountPercent || product?.discount || 0),
        oldPrice: product?.oldPrice || product?.originalPrice || null,
        color:
          product?.color ||
          (Array.isArray(product?.colorVariants) ? product.colorVariants.map((v) => v?.name).filter(Boolean).join('، ') : ''),
      };
    });
  }, [remoteProducts]);

  const hasRemoteData = Array.isArray(remoteProducts) && remoteProducts.length > 0;
  const visibleProducts = useMemo(() => products.slice(0, 6), [products]);

  useEffect(() => {
    const detectCardsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 768) return 2;
      return 4;
    };

    const applyCardsPerSlide = () => {
      setCardsPerSlide(detectCardsPerSlide());
    };

    applyCardsPerSlide();
    window.addEventListener('resize', applyCardsPerSlide);

    return () => {
      window.removeEventListener('resize', applyCardsPerSlide);
    };
  }, []);

  const productSlides = useMemo(() => {
    const result = [];
    for (let i = 0; i < visibleProducts.length; i += cardsPerSlide) {
      result.push(visibleProducts.slice(i, i + cardsPerSlide));
    }
    return result;
  }, [visibleProducts, cardsPerSlide]);

  const hasMultipleSlides = productSlides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides) return undefined;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % productSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [hasMultipleSlides, productSlides.length]);

  useEffect(() => {
    setActiveSlide(0);
  }, [productSlides.length]);

  const nextSlide = () => {
    if (!hasMultipleSlides) return;
    setActiveSlide((prev) => (prev + 1) % productSlides.length);
  };

  const prevSlide = () => {
    if (!hasMultipleSlides) return;
    setActiveSlide((prev) => (prev - 1 + productSlides.length) % productSlides.length);
  };

  const getSlideLabel = (slideProducts = [], index) => {
    const firstProductName = String(slideProducts?.[0]?.name || slideProducts?.[0]?.nameEn || '').trim();
    if (firstProductName) return firstProductName;
    return `مجموعة ${index + 1}`;
  };

  const handleDragEnd = (_event, info) => {
    if (!hasMultipleSlides) return;

    if (info?.offset?.x <= -60) {
      nextSlide();
      return;
    }

    if (info?.offset?.x >= 60) {
      prevSlide();
    }
  };

  return (
    <section className="section bg-white dark:bg-dark-card">
      <div className="container-fluid">
        {/* Section header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-4">
            منتجاتنا المميزة
          </h2>
          <p className="font-arabic text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            اختاري من أفضل مجموعتنا من عدسات العيون الطبية والشفافة
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-400 to-mint dark:to-mint-dark mx-auto mt-6 rounded-full"></div>
        </MotionDiv>

        {/* Products grid */}
        {isFetching && hasRemoteData ? (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4 font-arabic">
            يتم تحديث المنتجات المميزة في الخلفية...
          </p>
        ) : null}

        {isLoading && !hasRemoteData ? (
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid gap-4 md:gap-6 mb-12 ${cardsPerSlide === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}
          >
            {Array.from({ length: cardsPerSlide }).map((_, index) => (
              <MotionDiv key={`skeleton-${index}`} variants={itemVariants} className="h-full">
                <ProductSkeletonCard />
              </MotionDiv>
            ))}
          </MotionDiv>
        ) : (
          <div className="relative mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={`slide-${activeSlide}`}
                initial={{ opacity: 0, x: 70, rotateY: -7 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -70, rotateY: 7 }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
                drag={hasMultipleSlides ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={handleDragEnd}
                className={`grid gap-4 md:gap-6 ${cardsPerSlide === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}
              >
                {(productSlides[activeSlide] || []).map((product, index) => (
                  <MotionDiv key={product.id || `featured-slide-${activeSlide}-${index}`} variants={itemVariants} className="h-full">
                    <Suspense fallback={<ProductSkeletonCard />}>
                      <ProductCard product={product} />
                    </Suspense>
                  </MotionDiv>
                ))}
              </motion.div>
            </AnimatePresence>

            {hasMultipleSlides ? (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute top-1/2 -translate-y-1/2 -right-2 md:-right-3 p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 border border-surface-300 dark:border-gray-700 shadow text-ink-700 dark:text-secondary-100"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute top-1/2 -translate-y-1/2 -left-2 md:-left-3 p-2 rounded-full bg-white/90 dark:bg-dark-surface/90 border border-surface-300 dark:border-gray-700 shadow text-ink-700 dark:text-secondary-100"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </>
            ) : null}
          </div>
        )}

        {hasMultipleSlides ? (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {productSlides.map((slide, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-all ${
                  index === activeSlide
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                }`}
                aria-label={`شريحة ${index + 1}`}
              >
                {getSlideLabel(slide, index)}
              </button>
            ))}
          </div>
        ) : null}

        {isError && !hasRemoteData ? (
          <p className="text-center text-sm text-amber-700 dark:text-amber-300 font-arabic mb-8">
            تعذر تحميل المنتجات المميزة من الخادم حالياً.
          </p>
        ) : null}

        {!isLoading && !isError && visibleProducts.length === 0 ? (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-arabic mb-8">
            لا توجد منتجات مميزة متاحة حالياً.
          </p>
        ) : null}

        {/* CTA Button */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center"
        >
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span className="font-arabic">شاهدي جميع المنتجات</span>
          </Link>
        </MotionDiv>
      </div>
    </section>
  );
}


