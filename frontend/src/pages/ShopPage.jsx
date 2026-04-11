import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sliders, ChevronDown } from 'lucide-react';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/ui/ProductCard';
import LoadingState from '../components/ui/LoadingState';
import { useCatalogProductsQuery } from '../hooks/useCatalogProducts';
import { useCatalogCategoriesQuery } from '../hooks/useCatalogCategories';
import { useCatalogDurationsQuery } from '../hooks/useCatalogDurations';
import { useCatalogBrandsQuery } from '../hooks/useCatalogBrands';

const DEFAULT_PRICE = 500;

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    duration: [],
    color: [],
    priceRange: DEFAULT_PRICE,
    inStockOnly: false,
    saleOnly: false,
  });

  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const productsQuery = useCatalogProductsQuery({
    status: 'ACTIVE',
    limit: 200,
  });
  const categoriesQuery = useCatalogCategoriesQuery();
  const brandsQuery = useCatalogBrandsQuery();
  const durationsQuery = useCatalogDurationsQuery();

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
  }, [searchParams]);

  const maxPrice = useMemo(() => {
    const products = Array.isArray(productsQuery.data?.items) ? productsQuery.data.items : [];
    const ceiling = products.reduce((max, item) => Math.max(max, Number(item.price || 0)), 0);
    return Math.max(DEFAULT_PRICE, Math.ceil(ceiling || DEFAULT_PRICE));
  }, [productsQuery.data?.items]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.priceRange >= maxPrice) return prev;
      return {
        ...prev,
        priceRange: maxPrice,
      };
    });
  }, [maxPrice]);

  const categoryOptions = useMemo(() => {
    const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
    return categories.map((category) => ({
      key: category.slug || category.id,
      name: category.name,
      nameEn: category.nameEn,
    }));
  }, [categoriesQuery.data]);

  const brandOptions = useMemo(() => {
    const brands = Array.isArray(brandsQuery.data) ? brandsQuery.data : [];
    return brands.map((brand) => ({
      key: brand.id,
      name: brand.name,
    }));
  }, [brandsQuery.data]);

  const durationOptions = useMemo(() => {
    const durations = Array.isArray(durationsQuery.data) ? durationsQuery.data : [];
    return durations.map((duration) => ({
      key: duration.id,
      name: duration.name,
      nameEn: duration.nameEn,
    }));
  }, [durationsQuery.data]);

  const colorOptions = useMemo(() => {
    const products = Array.isArray(productsQuery.data?.items) ? productsQuery.data.items : [];
    const uniqueNames = new Set();
    products.forEach((product) => {
      (product.colorVariants || []).forEach((variant) => {
        if (variant?.name) uniqueNames.add(variant.name);
      });
    });
    return Array.from(uniqueNames).map((name) => ({ key: name, name }));
  }, [productsQuery.data?.items]);

  const filteredProducts = useMemo(() => {
    let products = Array.isArray(productsQuery.data?.items) ? productsQuery.data.items : [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(
        (p) =>
          (p.name || '').includes(searchTerm) ||
          (p.nameEn || '').toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term)
      );
    }

    if (filters.category?.length) {
      products = products.filter((p) => filters.category.includes(p.category?.slug || p.category?.id));
    }

    if (filters.brand?.length) {
      products = products.filter((p) => filters.brand.includes(p.brand?.id));
    }

    if (filters.duration?.length) {
      products = products.filter((p) => filters.duration.includes(p.duration?.id));
    }

    if (filters.color?.length) {
      products = products.filter((p) =>
        (p.colorVariants || []).some((variant) => filters.color.includes(variant?.name))
      );
    }

    if (filters.priceRange) {
      products = products.filter((p) => Number(p.price || 0) <= filters.priceRange);
    }

    if (filters.inStockOnly) {
      products = products.filter((p) => Number(p.stock || 0) > 0);
    }

    if (filters.saleOnly) {
      products = products.filter(
        (p) => Number(p.discountPercent || 0) > 0 || Number(p.originalPrice || 0) > Number(p.price || 0)
      );
    }

    const sorted = [...products];
    switch (sortBy) {
      case 'latest':
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'best-selling':
        sorted.sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0));
        break;
      case 'price-low':
        sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [filters, sortBy, searchTerm, productsQuery.data?.items]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      brand: [],
      duration: [],
      color: [],
      priceRange: maxPrice,
      inStockOnly: false,
      saleOnly: false,
    });
    setSearchTerm('');
  };

  const activeFilterCount = [
    ...(filters.category || []),
    ...(filters.brand || []),
    ...(filters.duration || []),
    ...(filters.color || []),
    ...(filters.inStockOnly ? ['inStock'] : []),
    ...(filters.saleOnly ? ['sale'] : []),
    ...(filters.priceRange && filters.priceRange < maxPrice ? ['price'] : []),
  ].length;

  const hasLoading = productsQuery.isLoading;
  const hasError = productsQuery.isError;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <h1 className="text-4xl font-bold text-[#6B4A45] dark:text-[#6B4A45] mb-2">تسوقي من متجرنا</h1>
          <p className="text-gray-600 dark:text-gray-400">اختاري من مجموعة واسعة من العدسات الملونة والشفافة بأفضل الأسعار</p>
        </div>
      </div>

      <div className="container-fluid py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              isMobile={false}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              durationOptions={durationOptions}
              colorOptions={colorOptions}
              maxPrice={maxPrice}
            />
          </div>

          <div className="md:col-span-3">
            <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="ابحثي عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />

                <div className="relative group">
                  <button className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <span>
                      {sortBy === 'latest'
                        ? 'الأحدث'
                        : sortBy === 'best-selling'
                        ? 'الأكثر مبيعا'
                        : sortBy === 'price-low'
                        ? 'السعر: من الأقل للأعلى'
                        : sortBy === 'price-high'
                        ? 'السعر: من الأعلى للأقل'
                        : 'الأعلى تقييما'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </button>

                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {[
                      { value: 'latest', label: 'الأحدث' },
                      { value: 'best-selling', label: 'الأكثر مبيعا' },
                      { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
                      { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
                      { value: 'rating', label: 'الأعلى تقييما' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`w-full text-right px-4 py-3 transition ${
                          sortBy === option.value
                            ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(true)}
                className="md:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium"
              >
                <Sliders className="w-5 h-5" />
                الفلاتر {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>

            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">تم العثور على {filteredProducts.length} منتج</div>

            {hasLoading ? <LoadingState text="جاري تحميل المنتجات..." className="py-10" /> : null}
            {hasError ? (
              <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                تعذر تحميل المنتجات حالياً، حاولي مرة أخرى بعد قليل.
              </div>
            ) : null}

            {!hasLoading && !hasError && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : null}

            {!hasLoading && !hasError && filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">لم يتم العثور على منتجات</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">جربي تعديل الفلاتر أو البحث الخاص بك</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showFilters && (
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
          isMobile={true}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          durationOptions={durationOptions}
          colorOptions={colorOptions}
          maxPrice={maxPrice}
        />
      )}
    </div>
  );
}

