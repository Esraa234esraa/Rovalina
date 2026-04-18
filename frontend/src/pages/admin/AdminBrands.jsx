import { useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import {
  useAdminBrandsQuery,
  useAdminCreateBrandMutation,
  useAdminDeleteBrandMutation,
  useAdminUpdateBrandMutation,
} from '../../hooks/admin/useAdminBrands';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const initialForm = {
  name: '',
  logoUrl: '',
};

export default function AdminBrands() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const { data: rows = [], isLoading } = useAdminBrandsQuery();
  const createBrandMutation = useAdminCreateBrandMutation();
  const updateBrandMutation = useAdminUpdateBrandMutation();
  const deleteBrandMutation = useAdminDeleteBrandMutation();
  const isSaving = createBrandMutation.isPending || updateBrandMutation.isPending;
  const isMutating = isSaving || deleteBrandMutation.isPending;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (b) =>
        b.name?.toLowerCase().includes(q)
    );
  }, [search, rows]);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedBrand(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setIsEditMode(true);
    setSelectedBrand(brand);
    setFormData({
      name: brand.name || '',
      logoUrl: brand.logoUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (isMutating) return;

    const name = String(formData.name || '').trim();
    const logoUrl = String(formData.logoUrl || '').trim();

    if (!name) {
      toast.error('اسم العلامة التجارية مطلوب.');
      return;
    }

    const duplicateBrand = rows.find((brand) => {
      if (isEditMode && selectedBrand && brand.id === selectedBrand.id) return false;
      return String(brand.name || '').trim().toLowerCase() === name.toLowerCase();
    });

    if (duplicateBrand) {
      toast.error('يوجد علامة تجارية بنفس الاسم.');
      return;
    }

    const payload = {
      name,
      logoUrl: logoUrl || null,
    };

    try {
      if (isEditMode && selectedBrand) {
        await updateBrandMutation.mutateAsync({ id: selectedBrand.id, payload });
        toast.success('تم تحديث العلامة التجارية بنجاح.');
      } else {
        await createBrandMutation.mutateAsync(payload);
        toast.success('تم إنشاء العلامة التجارية بنجاح.');
      }

      setIsModalOpen(false);
      setSelectedBrand(null);
      setFormData(initialForm);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ العلامة التجارية.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBrandMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف العلامة التجارية بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف العلامة التجارية.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              إدارة العلامات التجارية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              متابعة وإضافة وتعديل العلامات التجارية المتاحة في المتجر
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isMutating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
          >
            <Plus className="w-5 h-5" />
            إضافة علامة تجارية
          </button>
        </div>
      </div>

      <div className="container-fluid py-8">
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="ابحث عن علامة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الشعار</th>
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الاسم</th>
                  <th className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="py-0">
                      <LoadingState text="جاري تحميل العلامات التجارية..." />
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-600 dark:text-gray-400">
                      لا توجد علامات تجارية مطابقة
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((brand) => (
                    <tr key={brand.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-2">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <span className="text-2xl">🏷️</span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">{brand.name}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(brand)}
                            disabled={isMutating}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            aria-label="تعديل العلامة التجارية"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: brand.id, name: brand.name })}
                            disabled={isMutating}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                            aria-label="حذف العلامة التجارية"
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
                {isEditMode ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية جديدة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">اسم العلامة التجارية</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">رابط الشعار (اختياري)</label>
                <input
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
              >
                {isSaving ? 'جارٍ الحفظ...' : isEditMode ? 'حفظ التعديل' : 'إضافة العلامة التجارية'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemType="العلامة التجارية"
        itemName={deleteTarget?.name}
        isLoading={deleteBrandMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
