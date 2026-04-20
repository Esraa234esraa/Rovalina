import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import LoadingState from '../components/ui/LoadingState';
import { useCatalogBrandsQuery } from '../hooks/useCatalogBrands';
import { useCatalogProductsQuery } from '../hooks/useCatalogProducts';

const BRAND_FALLBACK =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80';

export default function BrandProductsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const brandsQuery = useCatalogBrandsQuery();
  const productsQuery = useCatalogProductsQuery({
    status: 'ACTIVE',
    limit: 300,
  });

  const brands = useMemo(() => {
    const list = Array.isArray(brandsQuery.data) ? brandsQuery.data : [];
    return list.filter((brand) => brand?.name);
  }, [brandsQuery.data]);

  const selectedBrand = useMemo(() => brands.find((brand) => brand.slug === slug) || null, [brands, slug]);

  useEffect(() => {
    if (brandsQuery.isLoading) return;
    if (brands.length === 0) return;
    if (!slug || !selectedBrand) {
      navigate(`/brands/${brands[0].slug}`, { replace: true });
    }
  }, [slug, selectedBrand, brands, brandsQuery.isLoading, navigate]);

  const allProducts = Array.isArray(productsQuery.data?.items) ? productsQuery.data.items : [];
  const products = selectedBrand?.id
    ? allProducts.filter((product) => product?.brandId === selectedBrand.id)
    : [];

  const isLoading = brandsQuery.isLoading || productsQuery.isLoading;
  const hasError = brandsQuery.isError || productsQuery.isError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-2">عدسات حسب العلامة التجارية</h1>
            <p className="text-gray-600 dark:text-gray-400">اختاري أي ماركة من نفس الصفحة لعرض منتجاتها فوراً.</p>
          </div>
          <Link
            to="/brands"
            className="inline-flex items-center rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 font-medium"
          >
            كل الماركات
          </Link>
        </div>
      </div>

      <div className="container-fluid py-8 space-y-8">
        <section className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 min-w-max pb-2">
            {brands.map((brand) => {
              const isActive = brand.id === selectedBrand?.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => navigate(`/brands/${brand.slug}`)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    isActive
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-500'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  <img
                    src={brand.logoUrl || BRAND_FALLBACK}
                    alt={brand.name}
                    className="h-10 w-10 rounded-lg object-contain bg-surface-200 dark:bg-dark-card p-1"
                    loading="lazy"
                  />
                  <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{brand.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {selectedBrand ? (
          <section className="relative overflow-hidden rounded-2xl border border-surface-300 dark:border-primary-900/40 bg-surface-50 dark:bg-dark-surface">
            <img
              src={selectedBrand.logoUrl || BRAND_FALLBACK}
              alt={selectedBrand.name}
              className="h-[260px] md:h-[320px] w-full object-contain bg-surface-200 dark:bg-dark-card p-2"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="absolute inset-x-4 bottom-6 text-center">
              <h2 className="text-white text-3xl md:text-4xl font-black tracking-wider drop-shadow-lg">{selectedBrand.name}</h2>
            </div>
          </section>
        ) : null}

        {isLoading ? <LoadingState text="جاري تحميل المنتجات..." className="py-10" /> : null}

        {hasError ? (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            تعذر تحميل البيانات حالياً، حاولي مرة أخرى بعد قليل.
          </div>
        ) : null}

        {!isLoading && !hasError ? (
          <section>
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">تم العثور على {products.length} منتج</div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لا توجد منتجات لهذه العلامة حالياً</h3>
                <p className="text-gray-600 dark:text-gray-400">اختاري ماركة أخرى من الأعلى.</p>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
