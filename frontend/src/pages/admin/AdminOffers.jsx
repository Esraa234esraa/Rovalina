import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react';
import {
  useAdminCreateOfferMutation,
  useAdminDeleteOfferMutation,
  useAdminOffersQuery,
  useAdminUpdateOfferMutation,
} from '../../hooks/admin/useAdminOffers';
import { useAdminProductsQuery } from '../../hooks/admin/useAdminProducts';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const initialForm = {
  title: '',
  titleEn: '',
  description: '',
  imageUrl: '',
  discount: '',
  code: '',
  startDate: '',
  endDate: '',
  type: 'percentage',
  featured: false,
  active: true,
  applicableProductIds: [],
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const toApiDateTime = (dateValue, endOfDay = false) => {
  const normalized = String(dateValue || '').trim();
  if (!normalized) return '';
  return `${normalized}${endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z'}`;
};

export default function AdminOffers() {
  const toast = useToast();
  const { data: remoteOffers = [], isLoading } = useAdminOffersQuery();
  const { data: productsData = { items: [] } } = useAdminProductsQuery({ limit: 300 });
  const createOfferMutation = useAdminCreateOfferMutation();
  const updateOfferMutation = useAdminUpdateOfferMutation();
  const deleteOfferMutation = useAdminDeleteOfferMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSaving = createOfferMutation.isPending || updateOfferMutation.isPending || isSubmitting;
  const isMutating = isSaving || deleteOfferMutation.isPending;

  const offers = useMemo(
    () =>
      (Array.isArray(remoteOffers) ? remoteOffers : []).map((offer) => ({
        id: offer.id,
        title: offer.title,
        titleEn: offer.titleEn || '',
        description: offer.description || '',
        discount: Number(offer.discount || 0),
        code: offer.code,
        imageUrl: offer.imageUrl || offer.image || '',
        startDate: offer.startDate,
        endDate: offer.endDate,
        featured: Boolean(offer.isFeatured || offer.featured),
        active: Boolean(offer.isActive),
        type: String(offer.type || 'PERCENTAGE').toLowerCase() === 'flat_amount' ? 'flatAmount' : 'percentage',
        applicableProducts: offer.applicableProducts?.length || 0,
        applicableProductIds: Array.isArray(offer.applicableProducts)
          ? offer.applicableProducts.map((item) => item.productId || item.product?.id).filter(Boolean)
          : [],
      })),
    [remoteOffers]
  );

  const productOptions = useMemo(
    () => (Array.isArray(productsData?.items) ? productsData.items : []),
    [productsData]
  );

  const filteredOffers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return offers.filter((offer) => {
      const matchesSearch =
        !q ||
        offer.title.toLowerCase().includes(q) ||
        offer.titleEn.toLowerCase().includes(q) ||
        String(offer.code).toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? offer.active : !offer.active);
      return matchesSearch && matchesStatus;
    });
  }, [offers, searchTerm, filterStatus]);

  const isDuplicateCodeLive = useMemo(() => {
    const code = String(formData.code || '').trim().toUpperCase();
    if (!code) return false;

    return offers.some((offer) => {
      if (isEditMode && selectedOffer && offer.id === selectedOffer.id) return false;
      return String(offer.code || '').trim().toUpperCase() === code;
    });
  }, [formData.code, offers, isEditMode, selectedOffer]);

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedOffer(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleEditClick = (offer) => {
    setIsEditMode(true);
    setSelectedOffer(offer);
    setFormData({
      title: offer.title,
      titleEn: offer.titleEn,
      description: offer.description,
      imageUrl: offer.imageUrl,
      discount: String(offer.discount),
      code: String(offer.code),
      startDate: toDateInputValue(offer.startDate),
      endDate: toDateInputValue(offer.endDate),
      type: offer.type,
      featured: Boolean(offer.featured),
      active: offer.active,
      applicableProductIds: offer.applicableProductIds || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    const offer = offers.find((o) => o.id === id);
    setDeleteTarget({ id, name: offer?.title || '' });
  };

  const validateForm = () => {
    const title = String(formData.title || '').trim();
    const code = String(formData.code || '').trim();
    const normalizedCode = code.toUpperCase();
    const discount = Number(formData.discount);
    const startDate = String(formData.startDate || '').trim();
    const endDate = String(formData.endDate || '').trim();

    if (!title) {
      toast.error('عنوان العرض مطلوب.');
      return false;
    }
    if (!code) {
      toast.error('كود العرض مطلوب.');
      return false;
    }
    const duplicatedCodeOffer = offers.find((offer) => {
      if (isEditMode && selectedOffer && offer.id === selectedOffer.id) return false;
      return String(offer.code || '').trim().toUpperCase() === normalizedCode;
    });
    if (duplicatedCodeOffer) {
      toast.error('كود العرض مستخدم بالفعل، اختاري كود مختلف.');
      return false;
    }
    if (!Number.isFinite(discount) || discount <= 0) {
      toast.error('قيمة الخصم يجب أن تكون رقمًا أكبر من صفر.');
      return false;
    }
    if (!startDate || !endDate) {
      toast.error('تاريخ البداية والنهاية مطلوبان.');
      return false;
    }
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      toast.error('تاريخ النهاية يجب أن يكون بعد أو مساويًا لتاريخ البداية.');
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    title: String(formData.title || '').trim(),
    titleEn: String(formData.titleEn || '').trim() || null,
    description: String(formData.description || '').trim() || null,
    imageUrl: String(formData.imageUrl || '').trim() || null,
    discount: Number(formData.discount),
    code: String(formData.code || '').trim().toUpperCase(),
    startDate: toApiDateTime(formData.startDate, false),
    endDate: toApiDateTime(formData.endDate, true),
    type: formData.type === 'flatAmount' ? 'FLAT_AMOUNT' : 'PERCENTAGE',
    isFeatured: Boolean(formData.featured),
    isActive: Boolean(formData.active),
    applicableProductIds: Array.isArray(formData.applicableProductIds)
      ? [...new Set(formData.applicableProductIds)]
      : [],
  });

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      setFormData((current) => ({
        ...current,
        imageUrl: value,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplicableProductsChange = (event) => {
    const selectedValues = Array.from(event.target.selectedOptions, (option) => option.value);
    setFormData((current) => ({
      ...current,
      applicableProductIds: selectedValues,
    }));
  };

  const handleSave = async () => {
    if (isMutating) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload();

      if (isEditMode && selectedOffer) {
        await updateOfferMutation.mutateAsync({ id: selectedOffer.id, payload });
        toast.success('تم تحديث العرض بنجاح.');
      } else {
        await createOfferMutation.mutateAsync(payload);
        toast.success('تم إنشاء العرض بنجاح.');
      }

      setIsModalOpen(false);
      setFormData(initialForm);
      setSelectedOffer(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ العرض.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteOfferMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف العرض بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف العرض.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">إدارة العروض</h1>
              <p className="text-gray-600 dark:text-gray-400">إدارة وإضافة وتعديل العروض والخصومات</p>
            </div>
            <button
              onClick={handleAddClick}
              disabled={isMutating}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-60"
            >
              <Plus className="w-5 h-5" />
              <span className="font-arabic">إضافة عرض</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن عرض أو كود..."
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
            <option value="all">جميع العروض</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full">
              <LoadingState text="جاري تحميل العروض..." />
            </div>
          ) : filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-24 bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-between px-6">
                  <div className="text-white">
                    <p className="text-3xl font-bold">
                      {offer.discount}
                      {offer.type === 'percentage' ? '%' : ' ج.م'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      offer.active ? 'bg-white/20 text-white' : 'bg-gray-900/20 text-white/90'
                    }`}
                  >
                    {offer.active ? 'نشط الآن' : 'غير نشط'}
                  </span>
                </div>

                <div className="p-4">
                  <p className="font-bold text-gray-900 dark:text-white mb-1">{offer.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{offer.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">الكود</p>
                      <p className="font-mono font-semibold text-gray-900 dark:text-white text-xs tracking-wider">{offer.code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">المنتجات</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{offer.applicableProducts}</p>
                    </div>
                  </div>

                  {offer.featured ? (
                    <span className="mb-3 inline-flex items-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-1 text-xs font-semibold">
                      عرض مميز
                    </span>
                  ) : null}

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleEditClick(offer)}
                      disabled={isMutating}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition text-sm disabled:opacity-60"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteClick(offer.id)}
                      disabled={isMutating}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition text-sm disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(offer.startDate).toLocaleDateString('ar-EG')} إلى {new Date(offer.endDate).toLocaleDateString('ar-EG')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">لا توجد عروض مطابقة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 p-3 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto hide-scrollbar">
          <div className="bg-white dark:bg-dark-card rounded-lg max-w-3xl w-full max-h-[82vh] sm:max-h-[78vh] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'تعديل العرض' : 'إضافة عرض جديد'}</h2>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان العرض (العربية)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان العرض (English)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كود العرض</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                  {isDuplicateCodeLive ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">هذا الكود مستخدم بالفعل.</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع الخصم</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="percentage">نسبة مئوية</option>
                      <option value="flatAmount">مبلغ ثابت</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">قيمة الخصم</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حالة العرض</label>
                  <select
                    value={formData.active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">صورة العرض (URL)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رفع صورة</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاريخ البداية</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.featured)}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    تمييز هذا العرض ليظهر في /offers/featured
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المنتجات المطبقة عليها العرض</label>
                <select
                  multiple
                  value={formData.applicableProductIds}
                  onChange={handleApplicableProductsChange}
                  className="w-full min-h-[140px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {productOptions.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">يمكن اختيار أكثر من منتج عبر الضغط مع Ctrl.</p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isDuplicateCodeLive}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-60"
              >
                {isSaving ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'إضافة العرض'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemType="العرض"
        itemName={deleteTarget?.name}
        isLoading={deleteOfferMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
