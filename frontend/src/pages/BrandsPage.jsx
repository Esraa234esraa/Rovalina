import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import LoadingState from '../components/ui/LoadingState';
import { useCatalogBrandsQuery } from '../hooks/useCatalogBrands';

const BRAND_FALLBACK =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80';

export default function BrandsPage() {
  const brandsQuery = useCatalogBrandsQuery();

  const brands = useMemo(() => {
    const list = Array.isArray(brandsQuery.data) ? brandsQuery.data : [];
    return list.filter((brand) => brand?.name);
  }, [brandsQuery.data]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <h1 className="text-4xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-2">تسوّقي حسب العلامة التجارية</h1>
          <p className="text-gray-600 dark:text-gray-400">اختاري الماركة اللي بتحبيها وادخلي على كل العدسات الخاصة بها مباشرة.</p>
        </div>
      </div>

      <div className="container-fluid py-10">
        {brandsQuery.isLoading ? <LoadingState text="جاري تحميل العلامات التجارية..." className="py-10" /> : null}

        {brandsQuery.isError ? (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            تعذر تحميل العلامات التجارية حالياً، حاولي مرة أخرى بعد قليل.
          </div>
        ) : null}

        {!brandsQuery.isLoading && !brandsQuery.isError && brands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {brands.map((brand) => (
              <Link key={brand.id} to={`/brands/${brand.slug}`} className="group relative block">
                <article className="relative overflow-hidden rounded-2xl border border-surface-300 dark:border-primary-900/40 bg-surface-50 dark:bg-dark-surface">
                  <img
                    src={brand.logoUrl || BRAND_FALLBACK}
                    alt={brand.name}
                    className="h-[220px] md:h-[260px] w-full object-contain bg-surface-200 dark:bg-dark-card p-2 transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 text-center">
                    <h2 className="text-white font-black tracking-wider text-lg md:text-xl drop-shadow-lg">{brand.name}</h2>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : null}

        {!brandsQuery.isLoading && !brandsQuery.isError && brands.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا توجد علامات تجارية متاحة حالياً</h3>
            <p className="text-gray-600 dark:text-gray-400">أضيفي علامات تجارية من لوحة التحكم لتظهر هنا.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
