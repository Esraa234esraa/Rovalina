import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Star, Eye, EyeOff, X } from 'lucide-react';
import {
  useAdminCreateTestimonialMutation,
  useAdminDeleteTestimonialMutation,
  useAdminTestimonialsQuery,
  useAdminUpdateTestimonialMutation,
} from '../../hooks/admin/useAdminTestimonials';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const initialForm = {
  name: '',
  email: '',
  quote: '',
  rating: 5,
  isApproved: true,
  isFeatured: false,
};

const getInitials = (value) => {
  const text = String(value || 'عميل').trim();
  const parts = text.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]).join('');
  return initials || 'عم';
};

export default function AdminTestimonials() {
  const toast = useToast();
  const { data: remoteTestimonials = [], isLoading } = useAdminTestimonialsQuery();
  const createTestimonialMutation = useAdminCreateTestimonialMutation();
  const updateTestimonialMutation = useAdminUpdateTestimonialMutation();
  const deleteTestimonialMutation = useAdminDeleteTestimonialMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const testimonials = useMemo(
    () =>
      (Array.isArray(remoteTestimonials) ? remoteTestimonials : []).map((item) => ({
        id: item.id,
        name: item.name || 'عميل',
        email: item.email || '',
        quote: item.quote || '',
        rating: Math.min(Number(item.rating || 0), 5),
        isApproved: Boolean(item.isApproved),
        isFeatured: Boolean(item.isFeatured),
      })),
    [remoteTestimonials]
  );

  const filteredTestimonials = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return testimonials.filter((testimonial) => {
      const matchesSearch =
        !q ||
        testimonial.name.toLowerCase().includes(q) ||
        testimonial.email.toLowerCase().includes(q) ||
        testimonial.quote.toLowerCase().includes(q);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'approved' ? testimonial.isApproved : !testimonial.isApproved);
      const matchesFeatured =
        filterFeatured === 'all' ||
        (filterFeatured === 'featured' ? testimonial.isFeatured : !testimonial.isFeatured);
      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [searchTerm, filterStatus, filterFeatured, testimonials]);

  const isSaving = createTestimonialMutation.isPending || updateTestimonialMutation.isPending;
  const isMutating = isSaving || deleteTestimonialMutation.isPending;

  const stats = useMemo(
    () => ({
      total: testimonials.length,
      approved: testimonials.filter((testimonial) => testimonial.isApproved).length,
      hidden: testimonials.filter((testimonial) => !testimonial.isApproved).length,
      featured: testimonials.filter((testimonial) => testimonial.isFeatured).length,
    }),
    [testimonials]
  );

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedTestimonial(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setIsEditMode(true);
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name === 'عميل' ? '' : testimonial.name,
      email: testimonial.email,
      quote: testimonial.quote,
      rating: testimonial.rating || 5,
      isApproved: testimonial.isApproved,
      isFeatured: testimonial.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isMutating) return;

    const payload = {
      name: String(formData.name || '').trim() || null,
      email: String(formData.email || '').trim() || null,
      quote: String(formData.quote || '').trim(),
      rating: Number(formData.rating),
      isApproved: Boolean(formData.isApproved),
      isFeatured: Boolean(formData.isFeatured),
    };

    if (!payload.quote) {
      toast.error('نص التقييم مطلوب.');
      return;
    }

    if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
      toast.error('التقييم يجب أن يكون من 1 إلى 5.');
      return;
    }

    try {
      if (isEditMode && selectedTestimonial) {
        await updateTestimonialMutation.mutateAsync({ id: selectedTestimonial.id, payload });
        toast.success('تم تحديث التقييم بنجاح.');
      } else {
        await createTestimonialMutation.mutateAsync(payload);
        toast.success('تم إضافة التقييم بنجاح.');
      }

      setIsModalOpen(false);
      setSelectedTestimonial(null);
      setFormData(initialForm);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ التقييم.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteTestimonialMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف التقييم بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف التقييم.'));
    }
  };

  const toggleApproval = async (testimonial) => {
    try {
      await updateTestimonialMutation.mutateAsync({
        id: testimonial.id,
        payload: { isApproved: !testimonial.isApproved },
      });
      toast.success(testimonial.isApproved ? 'تم إخفاء التقييم.' : 'تم إظهار التقييم.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر تحديث حالة الظهور.'));
    }
  };

  const toggleFeatured = async (testimonial) => {
    try {
      await updateTestimonialMutation.mutateAsync({
        id: testimonial.id,
        payload: { isFeatured: !testimonial.isFeatured },
      });
      toast.success(testimonial.isFeatured ? 'تم إلغاء التمييز.' : 'تم تمييز التقييم.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر تحديث التمييز.'));
    }
  };

  const filterButtonClass = (active) =>
    `px-4 py-2 rounded-full text-sm font-medium transition border ${
      active
        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
        : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">إدارة التقييمات والآراء</h1>
            <p className="text-gray-600 dark:text-gray-400">إضافة وتعديل وإخفاء أو إظهار تقييمات العملاء</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isMutating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
          >
            <Plus className="w-5 h-5" />
            إضافة تقييم
          </button>
        </div>
      </div>

      <div className="container-fluid py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي التقييمات</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ظاهرة</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مخفية</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.hidden}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مميزة</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.featured}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو البريد أو التقييم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-start xl:justify-end">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setFilterStatus('all')} className={filterButtonClass(filterStatus === 'all')}>
                جميع التقييمات
              </button>
              <button type="button" onClick={() => setFilterStatus('approved')} className={filterButtonClass(filterStatus === 'approved')}>
                ظاهرة
              </button>
              <button type="button" onClick={() => setFilterStatus('pending')} className={filterButtonClass(filterStatus === 'pending')}>
                مخفية
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setFilterFeatured('all')} className={filterButtonClass(filterFeatured === 'all')}>
                كل التمييزات
              </button>
              <button type="button" onClick={() => setFilterFeatured('featured')} className={filterButtonClass(filterFeatured === 'featured')}>
                مميزة
              </button>
              <button type="button" onClick={() => setFilterFeatured('normal')} className={filterButtonClass(filterFeatured === 'normal')}>
                غير مميزة
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingState text="جاري تحميل التقييمات..." />
          ) : filteredTestimonials.length > 0 ? (
            filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="w-16 h-16 rounded-full flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-500 via-primary-600 to-slate-900 text-white flex items-center justify-center shadow-sm">
                    <span className="text-lg font-bold tracking-wide">{getInitials(testimonial.name)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.email || 'لا يوجد بريد'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {testimonial.rating}/5
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed break-words">
                      “{testimonial.quote}”
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          testimonial.isApproved
                            ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {testimonial.isApproved ? 'ظاهر' : 'مخفي'}
                      </span>
                      {testimonial.isFeatured && (
                        <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                          مميز
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                    <button
                      type="button"
                      onClick={() => openEditModal(testimonial)}
                      disabled={isMutating}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition text-sm disabled:opacity-60"
                    >
                      <Edit className="w-4 h-4" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: testimonial.id, name: testimonial.name })}
                      disabled={isMutating}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition text-sm disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => toggleApproval(testimonial)}
                    disabled={isMutating}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 ${
                      testimonial.isApproved
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {testimonial.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {testimonial.isApproved ? 'إخفاء' : 'إظهار'}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleFeatured(testimonial)}
                    disabled={isMutating}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 ${
                      testimonial.isFeatured
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    {testimonial.isFeatured ? 'إلغاء التمييز' : 'تمييز'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">لا توجد تقييمات مطابقة</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto shadow-xl">
            <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'تعديل التقييم' : 'إضافة تقييم جديد'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التقييم</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1"
                      >
                        <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formData.rating}/5</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نص التقييم</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">ظاهر في الموقع</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">مميز</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-60"
              >
                {isSaving ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'إضافة التقييم'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemType="التقييم"
        itemName={deleteTarget?.name}
        isLoading={deleteTestimonialMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}