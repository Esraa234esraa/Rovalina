import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export default function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onClose,
  isMobile,
  categoryOptions = [],
  brandOptions = [],
  durationOptions = [],
  colorOptions = [],
  maxPrice = 500,
}) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    duration: true,
    color: true,
    price: true,
    stock: true,
    sale: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterToggle = (filterType, value) => {
    const currentFilters = filters[filterType] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((f) => f !== value)
      : [...currentFilters, value];

    onFilterChange(filterType, newFilters);
  };

  const handlePriceChange = (e) => {
    onFilterChange('priceRange', parseInt(e.target.value));
  };

  const handleStockFilter = (e) => {
    onFilterChange('inStockOnly', e.target.checked);
  };

  const handleSaleFilter = (e) => {
    onFilterChange('saleOnly', e.target.checked);
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header for mobile */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            الفلاتر
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>التصنيف</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.category ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.category && (
          <div className="space-y-3 pt-3 pl-3">
            {categoryOptions.map((option) => (
              <label key={option.key} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category?.includes(option.key) || false}
                  onChange={() => handleFilterToggle('category', option.key)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('brand')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>العلامة التجارية</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.brand ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.brand && (
          <div className="space-y-3 pt-3 pl-3">
            {brandOptions.map((option) => (
              <label key={option.key} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brand?.includes(option.key) || false}
                  onChange={() => handleFilterToggle('brand', option.key)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Duration Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('duration')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>المدة</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.duration ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.duration && (
          <div className="space-y-3 pt-3 pl-3">
            {durationOptions.map((option) => (
              <label key={option.key} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.duration?.includes(option.key) || false}
                  onChange={() => handleFilterToggle('duration', option.key)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Color Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>اللون</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.color ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.color && (
          <div className="space-y-3 pt-3 pl-3">
            {colorOptions.map((option) => (
              <label key={option.key} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.color?.includes(option.key) || false}
                  onChange={() => handleFilterToggle('color', option.key)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                  {option.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>السعر</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.price && (
          <div className="pt-3 pl-3 space-y-4">
            <div>
              <input
                type="range"
                min="0"
                max={maxPrice || 500}
                value={filters.priceRange || maxPrice || 500}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span>0 ج.م</span>
                <span>{filters.priceRange || maxPrice || 500} ج.م</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('stock')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>التوفر</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.stock ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.stock && (
          <div className="pt-3 pl-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStockOnly || false}
                onChange={handleStockFilter}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                المتوفر فقط
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Sale Filter */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => toggleSection('sale')}
          className="w-full flex items-center justify-between py-3 px-0 font-semibold text-gray-900 dark:text-white hover:text-primary-600"
        >
          <span>العروض</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              expandedSections.sale ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expandedSections.sale && (
          <div className="pt-3 pl-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.saleOnly || false}
                onChange={handleSaleFilter}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                المنتجات المخفضة فقط
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {(filters.category?.length > 0 ||
        filters.brand?.length > 0 ||
        filters.duration?.length > 0 ||
        filters.color?.length > 0 ||
        filters.inStockOnly ||
        filters.saleOnly ||
        (filters.priceRange && filters.priceRange < (maxPrice || 500))) && (
        <button
          onClick={() => {
            onFilterChange('category', []);
            onFilterChange('brand', []);
            onFilterChange('duration', []);
            onFilterChange('color', []);
            onFilterChange('priceRange', maxPrice || 500);
            onFilterChange('inStockOnly', false);
            onFilterChange('saleOnly', false);
          }}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium text-sm"
        >
          مسح جميع الفلاتر
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-24 h-fit">
        <div className="p-6 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}


