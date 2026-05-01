import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  const visibleProducts = useMemo(() => products.slice(0, 12), [products]);

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
            className={`grid gap-4 md:gap-6 mb-12 grid-cols-2 md:grid-cols-4`}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <MotionDiv key={`skeleton-${index}`} variants={itemVariants} className="h-full">
                <ProductSkeletonCard />
              </MotionDiv>
            ))}
          </MotionDiv>
        ) : (
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4"
            >
              {visibleProducts.map((product, index) => (
                <MotionDiv key={product.id || `featured-${index}`} variants={itemVariants} className="h-full">
                  <Suspense fallback={<ProductSkeletonCard />}>
                    <ProductCard product={product} />
                  </Suspense>
                </MotionDiv>
              ))}
            </motion.div>
          </div>
        )}

        {/* no slider navigation for featured products; grid only */}

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


