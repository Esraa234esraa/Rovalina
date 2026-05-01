import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useCatalogBrandsQuery } from '../../hooks/useCatalogBrands';

const BRAND_FALLBACK =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80';

export default function ShopByBrandSection() {
  const { data: brands = [] } = useCatalogBrandsQuery();
  const displayBrands = useMemo(() => (Array.isArray(brands) ? brands.filter((brand) => brand?.name) : []), [brands]);

  if (displayBrands.length === 0) return null;

  return (
    <section className="section bg-white dark:bg-dark-card">
      <div className="container-fluid">
        <Motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h2 className="font-arabic text-4xl md:text-5xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-2">
              تسوّقي حسب الماركة
            </h2>
            <p className="font-arabic text-gray-600 dark:text-gray-400 text-lg">
              اختاري علامتك المفضلة وشوفي كل العدسات الخاصة بها
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/brands"
              className="inline-flex items-center rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 font-medium"
            >
              كل العلامات التجارية
            </Link>
          </div>
        </Motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
          {displayBrands.map((brand) => (
            <Link key={brand.id} to={`/brands/${brand.slug}`} className="group relative">
              <article className="relative overflow-hidden rounded-2xl border border-surface-300 dark:border-primary-900/40 bg-surface-50 dark:bg-dark-surface">
                <img
                  src={brand.logoUrl || BRAND_FALLBACK}
                  alt={brand.name}
                  className="h-48 md:h-56 lg:h-64 w-full object-contain bg-surface-200 dark:bg-dark-card p-2 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-x-4 bottom-5 text-center">
                  <h3 className="text-white font-black tracking-wider text-xl md:text-2xl drop-shadow-lg">
                    {brand.name}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
