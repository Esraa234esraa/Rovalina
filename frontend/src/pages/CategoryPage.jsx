import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import LoadingState from '../components/ui/LoadingState';
import { useCatalogCategoriesQuery } from '../hooks/useCatalogCategories';
import { useCatalogProductsQuery } from '../hooks/useCatalogProducts';

export default function CategoryPage() {
  const { slug } = useParams();
  const [search, setSearch] = useState('');
  const categoriesQuery = useCatalogCategoriesQuery();
  const productsQuery = useCatalogProductsQuery({
    category: slug,
    status: 'ACTIVE',
    limit: 200,
  });

  const category = useMemo(() => {
    const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
    return categories.find((item) => item.slug === slug);
  }, [categoriesQuery.data, slug]);

  const products = useMemo(() => {
    const list = Array.isArray(productsQuery.data?.items) ? productsQuery.data.items : [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.nameEn || '').toLowerCase().includes(q));
  }, [productsQuery.data?.items, search]);

  if (categoriesQuery.isLoading || productsQuery.isLoading) {
    return <LoadingState text="جاري تحميل بيانات التصنيف..." className="py-24" />;
  }

  if (categoriesQuery.isError || productsQuery.isError) {
    return (
      <div className="container-fluid py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-700">تعذر تحميل بيانات التصنيف حالياً</h1>
        <Link to="/shop" className="btn-primary">العودة للمتجر</Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-fluid py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">التصنيف غير موجود</h1>
        <Link to="/shop" className="btn-primary">العودة للمتجر</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-10">
        <h1 className="text-4xl font-bold text-ink-800 dark:text-secondary-100 mb-2">{category.name}</h1>
        <p className="text-ink-500 dark:text-secondary-300 mb-6">{category.nameEn}</p>

        <input
          className="input mb-6"
          placeholder="ابحث داخل التصنيف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {products.length === 0 ? (
          <div className="card p-8 text-center">لا توجد منتجات.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
