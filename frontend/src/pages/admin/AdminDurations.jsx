import { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Search, Eye, X } from 'lucide-react';
import {
  useAdminDurationsQuery,
  useAdminCreateDurationMutation,
  useAdminUpdateDurationMutation,
  useAdminDeleteDurationMutation,
  useAdminDurationDetailsQuery,
} from '../../hooks/admin/useAdminDurations';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

export default function AdminDurations() {
  const { data: rows = [], isLoading } = useAdminDurationsQuery();
  const createMutation = useAdminCreateDurationMutation();
  const updateMutation = useAdminUpdateDurationMutation();
  const deleteMutation = useAdminDeleteDurationMutation();
  const toast = useToast();
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [detailsDurationId, setDetailsDurationId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    slug: '',
    icon: '',
  });

  const durations = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const {
    data: durationDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useAdminDurationDetailsQuery(detailsDurationId, Boolean(detailsDurationId));

  const filteredDurations = useMemo(() => {
    if (!searchTerm.trim()) return durations;
    return durations.filter((d) =>
      d.name.includes(searchTerm) ||
      (d.nameEn || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, durations]);

  const liveSlug = useMemo(() => {
    const name = String(formData.nameEn || formData.name || '').trim();
    const generated = name
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9]+/g, '-');
    return generated.replace(/^-+|-+$/g, '');
  }, [formData.nameEn, formData.name]);

  const isDuplicateSlugLive = useMemo(() => {
    if (!liveSlug) return false;
    return durations.some((d) => {
      if (isEditMode && selectedDuration && d.id === selectedDuration.id) return false;
      return String(d.slug || '').trim().toLowerCase() === liveSlug;
    });
  }, [liveSlug, durations, isEditMode, selectedDuration]);

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedDuration(null);
    setFormData({ name: '', nameEn: '', slug: '', icon: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (duration) => {
    setIsEditMode(true);
    setSelectedDuration(duration);
    setFormData({
      name: duration.name,
      nameEn: duration.nameEn || '',
      slug: duration.slug || '',
      icon: duration.icon || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    const duration = durations.find((d) => d.id === id);
    setDeleteTarget({ id, name: duration?.name || '' });
  };

  const handleViewClick = (duration) => {
    setDetailsDurationId(duration.id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف المدة بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف المدة.'));
    }
  };

  const handleSave = async () => {
    const name = String(formData.name || '').trim();
    if (!name) {
      toast.error('اسم المدة مطلوب.');
      return;
    }

    const normalizedSlug = liveSlug;

    const conflicting = durations.find((d) => {
      if (isEditMode && selectedDuration && d.id === selectedDuration.id) return false;
      return String(d.slug || '').trim().toLowerCase() === normalizedSlug;
    });
    if (conflicting) {
      toast.error('Slug المدة مستخدم بالفعل، غيري الاسم أو الاسم الإنجليزي.');
      return;
    }

    const payload = {
      name,
      nameEn: String(formData.nameEn || '').trim(),
      slug: normalizedSlug,
      icon: String(formData.icon || '').trim(),
    };

    try {
      if (isEditMode && selectedDuration) {
        await updateMutation.mutateAsync({ id: selectedDuration.id, payload });
        toast.success('تم تعديل المدة بنجاح.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('تم إضافة المدة بنجاح.');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ المدة.'));
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
                إدارة المدد
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                إدارة وإضافة وتعديل المدد (يومي، أسبوعي، شهري، سنوي)
              </p>
            </div>
            <button
              onClick={handleAddClick}
              disabled={isMutating}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-arabic">إضافة مدة</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Durations Table */}
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    اسم المدة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    English Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    أيقونة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-0">
                      <LoadingState text="جاري تحميل المدد..." />
                    </td>
                  </tr>
                ) : filteredDurations.length > 0 ? (
                  filteredDurations.map((duration) => (
                    <tr
                      key={duration.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {duration.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {duration.nameEn || '-'}
                      </td>
                      <td className="px-6 py-4 text-2xl">
                        {duration.icon || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewClick(duration)}
                            className="p-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(duration)}
                            disabled={isMutating}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(duration.id)}
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
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                      لا توجد مدد مطابقة
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'تعديل المدة' : 'إضافة مدة جديدة'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم المدة (العربية)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  English Name
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, nameEn: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {liveSlug ? (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Slug المقترح: {liveSlug}
                  </p>
                ) : null}
                {isDuplicateSlugLive ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    هذا الـ slug مستخدم بالفعل.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  أيقونة (Emoji أو رابط صورة)
                </label>
                <input
                  type="text"
                  placeholder="مثال: 📅 أو https://..."
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isMutating}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isMutating || isDuplicateSlugLive}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                {isMutating ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديلات' : 'إضافة المدة'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemType="المدة"
        itemName={deleteTarget?.name}
        isLoading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {detailsDurationId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل المدة</h2>
                {durationDetails ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {durationDetails.name} {durationDetails.nameEn ? `(${durationDetails.nameEn})` : ''}
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => setDetailsDurationId(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {isDetailsLoading ? (
                <LoadingState text="جاري تحميل تفاصيل المدة..." />
              ) : isDetailsError ? (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
                  تعذر تحميل تفاصيل المدة.
                </div>
              ) : durationDetails ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">اسم المدة</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{durationDetails.name}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">English Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{durationDetails.nameEn || '-'}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Slug</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{durationDetails.slug}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">عدد المنتجات</p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-1">{Array.isArray(durationDetails.products) ? durationDetails.products.length : 0}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">المنتج</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">السعر</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">المخزون</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">الفئة</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">العلامة</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.isArray(durationDetails.products) && durationDetails.products.length > 0 ? (
                          durationDetails.products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Number(product.price || 0)} ج.م</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{product.stock}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{product.category?.name || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{product.brand?.name || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{product.status || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                              لا توجد منتجات مرتبطة بهذه المدة.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
