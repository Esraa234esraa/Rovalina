import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, EyeOff, X } from 'lucide-react';
import { useAdminBrandsQuery } from '../../hooks/admin/useAdminBrands';
import { useAdminCategoriesQuery } from '../../hooks/admin/useAdminCategories';
import { useAdminDurationsQuery } from '../../hooks/admin/useAdminDurations';
import {
  useAdminDeleteProductMutation,
  useAdminProductsQuery,
  useAdminCreateProductMutation,
  useAdminUpdateProductMutation,
  useAdminProductDetailsQuery,
  useAdminProductReviewsQuery,
  useAdminUpdateProductReviewMutation,
  useAdminDeleteProductReviewMutation,
} from '../../hooks/admin/useAdminProducts';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { imageService, PRODUCT_IMAGE_FALLBACK } from '../../services/imageService';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const MINT_INPUT_CLASS =
  'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-mint dark:focus:ring-mint-dark focus:border-mint';

const MINT_INPUT_SM_CLASS =
  'flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-mint dark:focus:ring-mint-dark focus:border-mint';

export default function AdminProducts() {
  const { data: apiProducts = { items: [], meta: { total: 0, page: 1, limit: 100, pages: 0 } }, isLoading: isProductsLoading } = useAdminProductsQuery({ limit: 100 });
  const { data: categories = [] } = useAdminCategoriesQuery();
  const { data: brands = [] } = useAdminBrandsQuery();
  const { data: durations = [] } = useAdminDurationsQuery();
  const createProductMutation = useAdminCreateProductMutation();
  const updateProductMutation = useAdminUpdateProductMutation();
  const deleteProductMutation = useAdminDeleteProductMutation();
  const toast = useToast();
  const isSaving = createProductMutation.isPending || updateProductMutation.isPending;
  const isMutating = isSaving || deleteProductMutation.isPending;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsProductId, setDetailsProductId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    nameEn: '',
    name: '',
    price: '',
    originalPrice: '',
    categoryId: '',
    durationId: '',
    stock: '',
    sku: '',
    brandId: '',
    status: 'active',
    featured: false,
    image: '',
    colors: [],
  });
  const [newColor, setNewColor] = useState({ name: '', images: [] });
  const {
    data: productDetails,
    isLoading: isProductDetailsLoading,
    isError: isProductDetailsError,
  } = useAdminProductDetailsQuery(detailsProductId, isDetailsOpen);
  const {
    data: productReviews = [],
    isLoading: isProductReviewsLoading,
    isError: isProductReviewsError,
  } = useAdminProductReviewsQuery(detailsProductId, isDetailsOpen);
  const updateProductReviewMutation = useAdminUpdateProductReviewMutation();
  const deleteProductReviewMutation = useAdminDeleteProductReviewMutation();

  const products = useMemo(
    () =>
      (apiProducts.items || []).map((product) => ({
        id: product.id,
        slug: product.slug || '',
        nameEn: product.nameEn || '',
        name: product.name,
        price: Number(product.price || 0),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : '',
        discountPercent:
          Number(product.discountPercent || 0) > 0
            ? Number(product.discountPercent || 0)
            : product.originalPrice && Number(product.originalPrice) > Number(product.price || 0)
            ? Math.round(((Number(product.originalPrice) - Number(product.price || 0)) / Number(product.originalPrice)) * 100)
            : 0,
        categoryId: product.categoryId || '',
        category: product.category?.name || '',
        stock: product.stock || 0,
        sku: product.sku,
        brandId: product.brandId || '',
        durationId: product.durationId || '',
        supplier: product.brand?.name || '',
        status: product.status === 'ACTIVE' ? 'active' : 'inactive',
        featured: Boolean(product.featured),
        image: imageService.resolveProductImage(product),
        colors: imageService.normalizeProductColors(product),
      })),
    [apiProducts.items]
  );

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchesSearch =
      p.name.includes(searchTerm) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.includes(searchTerm);
    const matchesStatus =
      filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  }), [products, searchTerm, filterStatus]);

  const liveSlug = useMemo(() => {
    const productName = String(formData.name || '').trim();
    const productNameEn = String(formData.nameEn || '').trim();
    const generated = productNameEn
      ? productNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : productName.toLowerCase().replace(/[^\u0600-\u06FFa-z0-9]+/g, '-');
    return generated.replace(/^-+|-+$/g, '');
  }, [formData.name, formData.nameEn]);

  const isDuplicateSkuLive = useMemo(() => {
    const normalizedSku = String(formData.sku || '').trim().toLowerCase();
    if (!normalizedSku) return false;
    return products.some((p) => {
      if (isEditMode && selectedProduct && p.id === selectedProduct.id) return false;
      return String(p.sku || '').trim().toLowerCase() === normalizedSku;
    });
  }, [formData.sku, products, isEditMode, selectedProduct]);

  const isDuplicateSlugLive = useMemo(() => {
    if (!liveSlug) return false;
    return products.some((p) => {
      if (isEditMode && selectedProduct && p.id === selectedProduct.id) return false;
      return String(p.slug || '').trim().toLowerCase() === liveSlug;
    });
  }, [liveSlug, products, isEditMode, selectedProduct]);

  const parsedCurrentPrice = Number(formData.price || 0);
  const parsedOriginalPrice = Number(formData.originalPrice || 0);
  const hasDiscount = parsedOriginalPrice > 0 && parsedOriginalPrice > parsedCurrentPrice && parsedCurrentPrice > 0;
  const computedDiscountPercent = hasDiscount
    ? Math.round(((parsedOriginalPrice - parsedCurrentPrice) / parsedOriginalPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount ? parsedOriginalPrice - parsedCurrentPrice : 0;

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    setFormData({
      nameEn: '',
      name: '',
      price: '',
      originalPrice: '',
      categoryId: '',
      durationId: '',
      stock: '',
      sku: '',
      brandId: '',
      status: 'active',
      featured: false,
      image: '',
      colors: [],
    });
    setNewColor({ name: '', images: [] });
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormData({
      nameEn: product.nameEn,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      categoryId: product.categoryId,
      durationId: product.durationId || '',
      stock: product.stock,
      sku: product.sku,
      brandId: product.brandId,
      status: product.status,
      featured: product.featured || false,
      image: product.image || '',
      colors: product.colors || [],
    });
    setNewColor({ name: '', images: [] });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    const product = products.find((p) => p.id === id);
    setDeleteTarget({ id, name: product?.name || '' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProductMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف المنتج بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف المنتج.'));
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const draftColorName = String(newColor?.name || '').trim();
    const draftColorImages = Array.isArray(newColor?.images)
      ? newColor.images.map((img) => String(img || '').trim()).filter(Boolean)
      : [];
    const colorsForSave = [
      ...formData.colors,
      ...(draftColorName && draftColorImages.length > 0
        ? [{ name: draftColorName, images: draftColorImages }]
        : []),
    ];

    const productName = String(formData.name || '').trim();
    const productNameEn = String(formData.nameEn || '').trim();
    const productSku = String(formData.sku || '').trim();

    if (!productName) {
      toast.error('اسم المنتج بالعربية مطلوب.');
      return;
    }
    if (!productSku) {
      toast.error('رمز المنتج SKU مطلوب.');
      return;
    }
    if (!formData.categoryId) {
      toast.error('اختيار الفئة مطلوب.');
      return;
    }

    const currentPrice = Number(formData.price);
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      toast.error('السعر الحالي يجب أن يكون أكبر من صفر.');
      return;
    }

    const originalPriceValue = formData.originalPrice ? Number(formData.originalPrice) : null;
    if (originalPriceValue !== null && (!Number.isFinite(originalPriceValue) || originalPriceValue <= 0)) {
      toast.error('السعر الأصلي يجب أن يكون رقمًا صحيحًا أكبر من صفر.');
      return;
    }

    if (originalPriceValue !== null && originalPriceValue <= currentPrice) {
      toast.error('السعر الأصلي لازم يكون أكبر من السعر الحالي عشان يتحسب خصم.');
      return;
    }

    const normalizedSku = productSku.toLowerCase();
    const generatedSlug =
      productNameEn
        ? productNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : productName.toLowerCase().replace(/[^\u0600-\u06FFa-z0-9]+/g, '-');
    const normalizedSlug = generatedSlug.replace(/^-+|-+$/g, '');

    const conflictingProduct = products.find((p) => {
      if (isEditMode && selectedProduct && p.id === selectedProduct.id) return false;
      return String(p.sku || '').trim().toLowerCase() === normalizedSku;
    });
    if (conflictingProduct) {
      toast.error('رمز المنتج SKU مستخدم بالفعل، اختاري رمز مختلف.');
      return;
    }

    const conflictingSlugProduct = products.find((p) => {
      if (isEditMode && selectedProduct && p.id === selectedProduct.id) return false;
      return String(p.slug || '').trim().toLowerCase() === normalizedSlug;
    });
    if (conflictingSlugProduct) {
      toast.error('Slug الناتج من الاسم مستخدم بالفعل، غيري الاسم أو الاسم الإنجليزي.');
      return;
    }

    const normalizedColorNames = colorsForSave
      .map((color) => String(color?.name || '').trim().toLowerCase())
      .filter(Boolean);
    if (new Set(normalizedColorNames).size !== normalizedColorNames.length) {
      toast.error('يوجد ألوان مكررة. رجاء تعديل أسماء الألوان قبل الحفظ.');
      return;
    }

    const mainImage =
      formData.image ||
      imageService.extractPrimaryImageFromColors(colorsForSave) ||
      selectedProduct?.image ||
      PRODUCT_IMAGE_FALLBACK;

    const payload = {
      name: productName,
      nameEn: productNameEn,
      slug: normalizedSlug,
      price: currentPrice,
      originalPrice: originalPriceValue,
      discountPercent:
        originalPriceValue && originalPriceValue > currentPrice
          ? Math.round(((originalPriceValue - currentPrice) / originalPriceValue) * 100)
          : null,
      categoryId: formData.categoryId,
      durationId: formData.durationId || null,
      brandId: formData.brandId || null,
      stock: Number(formData.stock),
      sku: productSku,
      status: formData.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      image: mainImage,
      featured: Boolean(formData.featured),
      colors: colorsForSave,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && selectedProduct) {
        await updateProductMutation.mutateAsync({ id: selectedProduct.id, payload });
        toast.success('تم تعديل المنتج بنجاح.');
      } else {
        await createProductMutation.mutateAsync(payload);
        toast.success('تم إضافة المنتج بنجاح.');
      }
      if (draftColorName && draftColorImages.length > 0) {
        toast.info('تم ضم اللون الجديد تلقائيًا أثناء الحفظ.');
      }
      setNewColor({ name: '', images: [] });
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ بيانات المنتج.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
      : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300';
  };

  const handleAddColor = () => {
    if (newColor.name.trim()) {
      const normalizedNewName = newColor.name.trim().toLowerCase();
      const hasDuplicate = formData.colors.some(
        (color) => String(color?.name || '').trim().toLowerCase() === normalizedNewName
      );

      if (hasDuplicate) {
        toast.error('اسم اللون مكرر. اختاري اسم لون مختلف.');
        return;
      }

      setFormData((current) => ({
        ...current,
        colors: [...current.colors, { ...newColor, name: newColor.name.trim() }],
      }));
      setNewColor({ name: '', images: [] });
      toast.success('تمت إضافة اللون ويمكنك إدخال لون جديد الآن.');
    }
  };

  const handleAddImageToColor = (index, imageUrl) => {
    if (imageUrl.trim()) {
      setFormData((current) => {
        const updatedColors = [...current.colors];
        updatedColors[index] = {
          ...updatedColors[index],
          images: [...(updatedColors[index]?.images || []), imageUrl],
        };
        return { ...current, colors: updatedColors };
      });
    }
  };

  const handleRemoveColor = (index) => {
    setFormData((current) => ({
      ...current,
      colors: current.colors.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveColorImage = (colorIndex, imageIndex) => {
    setFormData((current) => {
      const updatedColors = [...current.colors];
      updatedColors[colorIndex] = {
        ...updatedColors[colorIndex],
        images: (updatedColors[colorIndex]?.images || []).filter((_, i) => i !== imageIndex),
      };
      return { ...current, colors: updatedColors };
    });
  };

  const handleAddImageToNewColor = (imageUrl) => {
    if (imageUrl.trim()) {
      setNewColor({
        ...newColor,
        images: [...newColor.images, imageUrl],
      });
    }
  };

  const handleRemoveNewColorImage = (index) => {
    setNewColor({
      ...newColor,
      images: newColor.images.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = async (file, colorIndex = null) => {
    if (!file) return;
    const imageData = await imageService.fileToDataUrl(file);
    if (colorIndex !== null) {
      handleAddImageToColor(colorIndex, imageData);
      return;
    }
    handleAddImageToNewColor(imageData);
  };

  const handleMainImageUpload = async (file) => {
    if (!file) return;
    const imageData = await imageService.fileToDataUrl(file);
    setFormData((current) => ({ ...current, image: imageData }));
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? 'نشط' : 'غير نشط';
  };

  const detailsColors = useMemo(
    () => imageService.normalizeProductColors(productDetails),
    [productDetails]
  );

  const detailsMainImage = useMemo(
    () => imageService.resolveProductImage(productDetails),
    [productDetails]
  );

  const openDetailsModal = (productId) => {
    setDetailsProductId(productId);
    setIsDetailsOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setDetailsProductId(null);
  };

  const handleToggleReviewApproval = async (review) => {
    if (!review?.id) return;

    try {
      await updateProductReviewMutation.mutateAsync({
        id: review.id,
        payload: { isApproved: !review.isApproved },
      });
      toast.success(review.isApproved ? 'تم إخفاء التقييم.' : 'تم إظهار التقييم.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر تحديث حالة التقييم.'));
    }
  };

  const handleDeleteReview = async (review) => {
    if (!review?.id || !detailsProductId) return;

    try {
      await deleteProductReviewMutation.mutateAsync({ id: review.id, productId: detailsProductId });
      toast.success('تم حذف التقييم بنجاح.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف التقييم.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                إدارة المنتجات
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                إدارة وإضافة وتعديل المنتجات
              </p>
            </div>
            <button
              onClick={handleAddClick}
              disabled={isMutating}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-arabic">إضافة منتج</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-8">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    المخزون
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isProductsLoading ? (
                  <tr>
                    <td colSpan="7" className="py-0">
                      <LoadingState text="جاري تحميل المنتجات..." />
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.nameEn}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {product.nameEn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        <div>
                          <p>{product.price} ج.م</p>
                          {product.originalPrice ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
                              {product.originalPrice} ج.م
                            </p>
                          ) : null}
                          {product.discountPercent > 0 ? (
                            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-mint/30 text-ink-700 dark:text-mint">
                              خصم {product.discountPercent}%
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 20 ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' : product.stock > 0 ? 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {product.category}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusLabel(product.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailsModal(product.id)}
                            disabled={isMutating}
                            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-600 dark:text-purple-400 rounded transition"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            disabled={isMutating}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            disabled={isMutating}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                      لا توجد منتجات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-5xl h-[94vh] overflow-y-auto">
            <div className="sticky top-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="md:col-span-2 xl:col-span-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">الصورة الرئيسية</p>
                  <div className="flex flex-wrap items-start gap-4">
                    <img
                      src={formData.image || imageService.extractPrimaryImageFromColors(formData.colors) || PRODUCT_IMAGE_FALLBACK}
                      alt={formData.name || 'product'}
                      className="w-24 h-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex-1 min-w-[220px] space-y-2">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="رابط الصورة الرئيسية..."
                        className={MINT_INPUT_CLASS}
                      />
                      <label className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-mint/20 dark:bg-mint-dark/30 border border-mint dark:border-mint-dark rounded cursor-pointer hover:bg-mint/30 dark:hover:bg-mint-dark/40 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleMainImageUpload(e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-ink-700 dark:text-mint font-medium">رفع صورة رئيسية</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم المنتج (العربية)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم المنتج (English)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameEn: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  />
                  {liveSlug ? (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Slug المقترح: {liveSlug}</p>
                  ) : null}
                  {isDuplicateSlugLive ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">هذا الـ slug مستخدم بالفعل.</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر الحالي
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">ده السعر اللي العميل بيدفعه فعليًا.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر الأصلي
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">اكتبيه لو المنتج عليه خصم. لازم يكون أكبر من السعر الحالي.</p>
                </div>
                <div className="md:col-span-2 xl:col-span-3 rounded-lg border border-mint/50 bg-mint/10 dark:bg-mint-dark/20 px-4 py-3">
                  <p className="text-sm font-semibold text-ink-800 dark:text-mint mb-1">ملخص التسعير والخصم</p>
                  {hasDiscount ? (
                    <p className="text-sm text-ink-700 dark:text-secondary-200">
                      خصم تلقائي: {computedDiscountPercent}%
                      {' '}| التوفير: {Number(savingsAmount.toFixed(2))} ج.م
                    </p>
                  ) : (
                    <p className="text-sm text-ink-700 dark:text-secondary-200">
                      لو فيه خصم: خلي السعر الحالي أقل من السعر الأصلي، والنسبة هتتحسب تلقائيًا.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الفئة
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  >
                    <option value="">اختر الفئة</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المخزون
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  />
                  {isDuplicateSkuLive ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">هذا الـ SKU مستخدم بالفعل.</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    النوع (مدة صلاحية العدسات)
                  </label>
                  <select
                    value={formData.durationId}
                    onChange={(e) =>
                      setFormData({ ...formData, durationId: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  >
                    <option value="">اختر النوع</option>
                    {durations.map((duration) => (
                      <option key={duration.id} value={duration.id}>
                        {duration.name} {duration.icon ? `(${duration.icon})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المورد
                  </label>
                  <select
                    value={formData.brandId}
                    onChange={(e) =>
                      setFormData({ ...formData, brandId: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  >
                    <option value="">اختر المورد</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحالة
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className={MINT_INPUT_CLASS}
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData({ ...formData, featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-mint text-mint-dark focus:ring-mint cursor-pointer"
                  />
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    نشره كمنتج مميز
                  </label>
                </div>
              </div>

              {/* Colors Section */}
              <div className="mt-6 sm:mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ألوان العدسات والصور
                </h3>

                {/* Existing Colors */}
                {formData.colors.length > 0 && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      الألوان المضافة ({formData.colors.length})
                    </h4>
                    {formData.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {color.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {color.images.length} صورة
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveColor(colorIndex)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Color Images */}
                        {color.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {color.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={image}
                                  alt={`Color ${color.name} - Image ${imgIndex + 1}`}
                                  className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  onClick={() =>
                                    handleRemoveColorImage(colorIndex, imgIndex)
                                  }
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Image Input for Color */}
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="أضف رابط صورة لهذا اللون..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddImageToColor(colorIndex, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className={MINT_INPUT_SM_CLASS}
                            />
                            <button
                              onClick={(e) => {
                                const input =
                                  e.target.previousElementSibling;
                                if (input.value) {
                                  handleAddImageToColor(colorIndex, input.value);
                                  input.value = '';
                                }
                              }}
                              className="px-3 py-2 bg-mint-dark hover:bg-mint text-white text-sm rounded transition"
                            >
                              إضافة رابط
                            </button>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 text-sm bg-mint/20 dark:bg-mint-dark/30 border border-mint dark:border-mint-dark rounded cursor-pointer hover:bg-mint/30 dark:hover:bg-mint-dark/40 transition">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleFileUpload(e.target.files[0], colorIndex);
                                  e.target.value = '';
                                }
                              }}
                              className="hidden"
                            />
                            <span className="text-ink-700 dark:text-mint font-medium">
                              📁 رفع صورة
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Color */}
                <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    إضافة لون جديد
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        اسم اللون
                      </label>
                      <input
                        type="text"
                        value={newColor.name}
                        onChange={(e) =>
                          setNewColor({ ...newColor, name: e.target.value })
                        }
                        placeholder="مثال: أزرق فاتح"
                        className={MINT_INPUT_SM_CLASS}
                      />
                    </div>

                    {/* New Color Images Preview */}
                    {newColor.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newColor.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={image}
                              alt={`New color - Image ${imgIndex + 1}`}
                              className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                            />
                            <button
                              onClick={() =>
                                handleRemoveNewColorImage(imgIndex)
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Image to New Color */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="أضف رابط صورة..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddImageToNewColor(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className={MINT_INPUT_SM_CLASS}
                        />
                        
                        <button
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            if (input.value) {
                              handleAddImageToNewColor(input.value);
                              input.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-mint-dark hover:bg-mint text-white text-sm rounded transition"
                        >
                          إضافة رابط
                        </button>
                      </div>
                      <label className="flex items-center gap-2 px-3 py-2 text-sm bg-mint/20 dark:bg-mint-dark/30 border border-mint dark:border-mint-dark rounded cursor-pointer hover:bg-mint/30 dark:hover:bg-mint-dark/40 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                        />
                        <span className="text-ink-700 dark:text-mint font-medium">
                          📁 رفع صورة
                        </span>
                      </label>
                    </div>

                    {/* Add Color Button */}
                    <button
                      onClick={handleAddColor}
                      disabled={!newColor.name.trim() || newColor.images.length === 0}
                      className="w-full mt-3 px-4 py-2 bg-mint-dark hover:bg-mint disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة اللون</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving || isSubmitting}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isSubmitting || isDuplicateSkuLive || isDuplicateSlugLive}
                className="w-full sm:w-auto px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                {isSaving || isSubmitting ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل المنتج</h2>
              <button
                onClick={closeDetailsModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-6">
              {isProductDetailsLoading && (
                <div className="py-10 text-center text-gray-600 dark:text-gray-400">جارٍ تحميل التفاصيل...</div>
              )}

              {isProductDetailsError && (
                <div className="py-10 text-center text-red-600 dark:text-red-400">تعذر تحميل تفاصيل المنتج.</div>
              )}

              {!isProductDetailsLoading && !isProductDetailsError && productDetails && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <img
                        src={detailsMainImage || PRODUCT_IMAGE_FALLBACK}
                        alt={productDetails.name || 'product'}
                        className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الاسم</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.name || '-'}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الاسم بالإنجليزية</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.nameEn || '-'}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SKU</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.sku || '-'}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الحالة</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.status || '-'}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">السعر</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{Number(productDetails.price || 0)} ج.م</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">المخزون</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.stock ?? 0}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الفئة</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.category?.name || '-'}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">المدة</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.duration?.name || '-'}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">العلامة التجارية</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{productDetails.brand?.name || '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">الألوان وصور كل لون</h3>

                    {detailsColors.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">لا توجد ألوان مضافة لهذا المنتج.</p>
                    ) : (
                      <div className="space-y-4">
                        {detailsColors.map((color, colorIndex) => (
                          <div
                            key={`${color.name}-${colorIndex}`}
                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
                          >
                            <p className="font-medium text-gray-900 dark:text-white mb-3">{color.name || `لون ${colorIndex + 1}`}</p>
                            {color.images.length === 0 ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400">لا توجد صور لهذا اللون.</p>
                            ) : (
                              <div className="flex flex-wrap gap-3">
                                {color.images.map((image, imageIndex) => (
                                  <img
                                    key={`${colorIndex}-${imageIndex}`}
                                    src={image}
                                    alt={`${color.name || 'color'}-${imageIndex + 1}`}
                                    className="w-24 h-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تقييمات المنتج</h3>

                    {isProductReviewsLoading ? (
                      <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل التقييمات...</p>
                    ) : isProductReviewsError ? (
                      <p className="text-red-600 dark:text-red-400">تعذر تحميل تقييمات المنتج.</p>
                    ) : productReviews.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-400">لا توجد تقييمات لهذا المنتج.</p>
                    ) : (
                      <div className="space-y-3">
                        {productReviews.map((review) => (
                          <div
                            key={review.id}
                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{review.name || review.user?.name || 'مستخدم'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {review.user?.email || 'بدون بريد'} - {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    review.isApproved
                                      ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                                      : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                                  }`}
                                >
                                  {review.isApproved ? 'ظاهر' : 'مخفي'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                                  {Number(review.rating || 0)}/5
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleReviewApproval(review)}
                                disabled={updateProductReviewMutation.isPending || deleteProductReviewMutation.isPending}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 disabled:opacity-60"
                              >
                                {review.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {review.isApproved ? 'إخفاء' : 'إظهار'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(review)}
                                disabled={updateProductReviewMutation.isPending || deleteProductReviewMutation.isPending}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 disabled:opacity-60"
                              >
                                <Trash2 className="w-4 h-4" /> حذف
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemType="المنتج"
        itemName={deleteTarget?.name}
        isLoading={deleteProductMutation.isPending || isSubmitting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

