import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../lib/constants';
import { useCatalogCategoriesQuery } from '../../hooks/useCatalogCategories';

const MotionDiv = motion.div;
const fallbackIcons = ['👁️', '✨', '📅', '🧴', '💧', '🛍️'];

const CategorySkeletonCard = () => (
  <div className="card overflow-hidden h-full bg-white dark:bg-dark-card animate-pulse">
    <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mx-auto" />
    </div>
  </div>
);

export default function CategoriesSection() {
  const { data: remoteCategories = [], isLoading, isError } = useCatalogCategoriesQuery();

  const categories = useMemo(() => {
    if (!Array.isArray(remoteCategories) || remoteCategories.length === 0) {
      return CATEGORIES;
    }

    return remoteCategories.map((category, index) => ({
      id: category.id,
      slug: category.slug,
      name: category.name || 'قسم',
      nameEn: category.nameEn || '',
      icon: category.icon || fallbackIcons[index % fallbackIcons.length],
    }));
  }, [remoteCategories]);

  const hasRemoteData = Array.isArray(remoteCategories) && remoteCategories.length > 0;

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
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="section bg-gradient-to-b from-pale-pink/50 dark:from-dark-surface/50 to-transparent">
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
            تسوقي حسب الفئة
          </h2>
          <p className="font-arabic text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            اختاري من تشكيلتنا الواسعة من الفئات المختلفة
          </p>
        </MotionDiv>

        {/* Categories grid */}
        <MotionDiv
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {isLoading && !hasRemoteData
            ? Array.from({ length: 5 }).map((_, index) => (
                <MotionDiv key={`skeleton-${index}`} variants={itemVariants}>
                  <CategorySkeletonCard />
                </MotionDiv>
              ))
            : categories.map((category) => (
            <MotionDiv key={category.id} variants={itemVariants}>
              <Link to={`/category/${category.slug}`}>
                <div className="card group cursor-pointer overflow-hidden h-full bg-white dark:bg-dark-card">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-rose-100 dark:from-primary-900/30 dark:to-rose-900/30 flex items-center justify-center overflow-hidden relative">
                    {/* Gradient background circle */}
                    <MotionDiv
                      className="absolute inset-0 bg-gradient-to-br from-primary-200/0 to-rose-400/0 group-hover:from-primary-200/20 group-hover:to-rose-400/20 transition duration-300"
                    />

                    {/* Icon */}
                    <MotionDiv
                      className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10"
                      whileHover={{ rotate: 10 }}
                    >
                      {category.icon}
                    </MotionDiv>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-arabic font-bold text-gray-900 dark:text-white mb-1 text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {category.nameEn}
                    </p>

                    {/* Arrow indicator */}
                    <MotionDiv
                      className="mt-3 flex justify-center"
                      initial={{ opacity: 0, x: -5 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">←</span>
                    </MotionDiv>
                  </div>
                </div>
              </Link>
            </MotionDiv>
              ))}
        </MotionDiv>

        {isError && !hasRemoteData ? (
          <p className="mt-4 text-center text-sm text-amber-700 dark:text-amber-300 font-arabic">
            تعذر تحميل الأقسام من الخادم، تم عرض البيانات الاحتياطية.
          </p>
        ) : null}
      </div>
    </section>
  );
}


