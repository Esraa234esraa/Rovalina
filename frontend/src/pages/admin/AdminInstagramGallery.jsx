import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, ImageIcon, X } from 'lucide-react';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import LoadingState from '../../components/ui/LoadingState';
import {
  useAdminCreateInstagramGalleryItemMutation,
  useAdminDeleteInstagramGalleryItemMutation,
  useAdminInstagramGalleryQuery,
  useAdminUpdateInstagramGalleryItemMutation,
} from '../../hooks/admin/useAdminInstagramGallery';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const initialForm = {
  username: '@rovalina_lenses',
  image: '',
  sortOrder: 0,
  isActive: true,
};

const getInstagramEmbedUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const parts = parsed.pathname.split('/').filter(Boolean);

    if (host !== 'instagram.com') return null;

    if ((parts[0] === 'p' || parts[0] === 'reel') && parts[1]) {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }

    if ((parts[0] === 'p' || parts[0] === 'reel') && parts[2] === 'media' && parts[1]) {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }
  } catch {
    return null;
  }

  return null;
};

export default function AdminInstagramGallery() {
  const toast = useToast();
  const { data: items = [], isLoading } = useAdminInstagramGalleryQuery();
  const createMutation = useAdminCreateInstagramGalleryItemMutation();
  const updateMutation = useAdminUpdateInstagramGalleryItemMutation();
  const deleteMutation = useAdminDeleteInstagramGalleryItemMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (Array.isArray(items) ? items : []).filter((item) => {
      if (!query) return true;
      return (
        String(item.username || '').toLowerCase().includes(query) ||
        String(item.image || '').toLowerCase().includes(query)
      );
    });
  }, [items, searchTerm]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((item) => item.isActive).length,
      hidden: items.filter((item) => !item.isActive).length,
    }),
    [items]
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      username: item.username || '@rovalina_lenses',
      image: item.image || '',
      sortOrder: Number(item.sortOrder || 0),
      isActive: Boolean(item.isActive),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData(initialForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const payload = {
      username: String(formData.username || '').trim() || '@rovalina_lenses',
      image: String(formData.image || '').trim(),
      sortOrder: Number.isFinite(Number(formData.sortOrder)) ? Number(formData.sortOrder) : 0,
      isActive: Boolean(formData.isActive),
    };

    if (!payload.image) {
      toast.error('رابط الصورة مطلوب.');
      return;
    }

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, payload });
        toast.success('تم تحديث عنصر الجالري بنجاح.');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('تم إضافة عنصر جديد للجالري.');
      }
      closeModal();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ عنصر الجالري.'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('تم حذف عنصر الجالري بنجاح.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حذف عنصر الجالري.'));
    }
  };

  const toggleVisibility = async (item) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: { isActive: !item.isActive },
      });
      toast.success(item.isActive ? 'تم إخفاء العنصر.' : 'تم إظهار العنصر.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر تحديث حالة العنصر.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">إدارة جالري إنستغرام</h1>
            <p className="text-gray-600 dark:text-gray-400">إضافة وتعديل وترتيب صور قسم إنستغرام في الصفحة الرئيسية</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-60"
          >
            <Plus className="w-5 h-5" />
            إضافة صورة
          </button>
        </div>
      </div>

      <div className="container-fluid py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي العناصر</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ظاهرة</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مخفية</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.hidden}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث باليوزر أو رابط الصورة..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {isLoading ? (
          <LoadingState text="جاري تحميل عناصر الجالري..." />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد عناصر جالري مطابقة للبحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const embedUrl = getInstagramEmbedUrl(item.image);

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={item.username || 'Instagram Post'}
                        className="w-full h-full border-0 bg-white"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.username || '@instagram'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.username || '@rovalina_lenses'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">الترتيب: {Number(item.sortOrder || 0)}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive
                            ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {item.isActive ? 'ظاهر' : 'مخفي'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all line-clamp-2">{item.image}</p>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
                      >
                        {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {item.isActive ? 'إخفاء' : 'إظهار'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'تعديل عنصر جالري' : 'إضافة عنصر جالري'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الحساب</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(event) => setFormData((prev) => ({ ...prev, username: event.target.value }))}
                  placeholder="@rovalina_lenses"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط الصورة أو بوست إنستغرام</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(event) => setFormData((prev) => ({ ...prev, image: event.target.value }))}
                  placeholder="https://www.instagram.com/p/... أو رابط صورة مباشر"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  لو وضعتِ رابط بوست أو ريل من إنستغرام، سيتم تحويله تلقائيًا لصورة قابلة للعرض في الجالري.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        sortOrder: Number(event.target.value || 0),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: event.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    عنصر ظاهر في الموقع
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                >
                  {isSaving ? 'جارٍ الحفظ...' : editingItem ? 'حفظ التعديلات' : 'إضافة العنصر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        itemName={deleteTarget?.username}
        itemType="عنصر الجالري"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
