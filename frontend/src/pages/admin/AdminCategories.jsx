import { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import {
  useAdminCategoriesQuery,
  useAdminCreateCategoryMutation,
  useAdminUpdateCategoryMutation,
  useAdminDeleteCategoryMutation,
} from '../../hooks/admin/useAdminCategories';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const initialForm = {
  name: '',
  nameEn: '',
  icon: '',
};

export default function AdminCategories() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const { data: rows = [], isLoading } = useAdminCategoriesQuery();
  const createCategoryMutation = useAdminCreateCategoryMutation();
  const updateCategoryMutation = useAdminUpdateCategoryMutation();
  const deleteCategoryMutation = useAdminDeleteCategoryMutation();
  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isMutating = isSaving || deleteCategoryMutation.isPending;

  const categories = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.nameEn?.toLowerCase().includes(q)
    );
  }, [search, categories]);

  const duplicateNameLive = useMemo(() => {
    const name = String(formData.name || '').trim().toLowerCase();
    if (!name) return false;

    return categories.some((category) => {
      if (isEditMode && selectedCategory && category.id === selectedCategory.id) return false;
      return String(category.name || '').trim().toLowerCase() === name;
    });
  }, [formData.name, categories, isEditMode, selectedCategory]);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      nameEn: category.nameEn || '',
      icon: category.icon || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isMutating) return;

    const payload = {
      name: formData.name.trim(),
      nameEn: formData.nameEn.trim() || null,
      icon: formData.icon.trim() || null,
    };

    if (!payload.name) {
      toast.error('اسم التصنيف مطلوب.');
      return;
    }

    if (duplicateNameLive) {
      toast.error('اسم التصنيف مستخدم بالفعل.');
      return;
    }

    try {
      if (isEditMode && selectedCategory) {
        await updateCategoryMutation.mutateAsync({ id: selectedCategory.id, payload });
        toast.success('تم تحديث التصنيف بنجاح.');
        setIsModalOpen(false);
        return;
      }

      await createCategoryMutation.mutateAsync(payload);
      toast.success('تم إنشاء التصنيف بنجاح.');
      setIsModalOpen(false);
      setFormData(initialForm);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ التصنيف.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategoryMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف التصنيف بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف التصنيف.'));
    }
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    if (!isEditMode) {
      setFormData(initialForm);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">إدارة التصنيفات</h1>
            <p className="text-gray-600 dark:text-gray-400">إضافة وتعديل وحذف تصنيفات المتجر</p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isMutating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="w-5 h-5" />
            إضافة تصنيف
          </button>
        </div>
      </div>

      <div className="container-fluid py-8">
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="ابحث عن تصنيف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الأيقونة</th>
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الاسم</th>
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الاسم (EN)</th>
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-0">
                      <LoadingState text="جاري تحميل التصنيفات..." />
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-600 dark:text-gray-400">
                      لا توجد تصنيفات مطابقة
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-2 text-2xl">{category.icon || '📦'}</td>
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">{category.name}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-300">{category.nameEn || '-'}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(category)}
                            disabled={isMutating}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            aria-label="تعديل التصنيف"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                            disabled={isMutating}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                            aria-label="حذف التصنيف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">الاسم</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {duplicateNameLive ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">اسم التصنيف مستخدم بالفعل.</p>
                ) : null}
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">الاسم بالإنجليزية</label>
                <input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">الأيقونة</label>
                <input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📦"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || duplicateNameLive}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
              >
                {isSaving ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديل' : 'إضافة التصنيف'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemType="التصنيف"
        itemName={deleteTarget?.name}
        isLoading={deleteCategoryMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
