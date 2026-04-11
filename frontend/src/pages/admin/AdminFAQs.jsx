import { useMemo, useState } from 'react';
import { Trash2, Edit2, Plus, Search } from 'lucide-react';
import { useAdminFAQsQuery, useAdminCreateFAQMutation, useAdminUpdateFAQMutation, useAdminDeleteFAQMutation } from '../../hooks/admin/useAdminFAQs';
import { useToast } from '../../hooks/useToast';
import LoadingState from '../../components/ui/LoadingState';

const initialFormState = {
  category: '',
  categoryEn: '',
  question: '',
  questionEn: '',
  answer: '',
  answerEn: '',
  order: 0,
  isActive: true,
};

export default function AdminFAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const toast = useToast();

  const { data: faqs = [], isLoading, error } = useAdminFAQsQuery();
  const createMutation = useAdminCreateFAQMutation();
  const updateMutation = useAdminUpdateFAQMutation();
  const deleteMutation = useAdminDeleteFAQMutation();
  const isMutating = useMemo(
    () => createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    [createMutation.isPending, updateMutation.isPending, deleteMutation.isPending]
  );

  // Filter FAQs based on search term
  const filteredFAQs = useMemo(() => {
    if (!faqs) return [];
    return faqs.filter(
      (faq) =>
        faq.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faqs, searchTerm]);

  // Group FAQs by category
  const groupedFAQs = useMemo(() => {
    const grouped = {};
    filteredFAQs.forEach((faq) => {
      const category = faq.category || 'غير مصنفة';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(faq);
    });
    return grouped;
  }, [filteredFAQs]);

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setEditingId(faq.id);
      setFormData(faq);
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.question || !formData.answer) {
      toast.error('الفئة والسؤال والإجابة مطلوبة.');
      return;
    }

    try {
      toast.info(editingId ? 'جارٍ تحديث السؤال...' : 'جارٍ إنشاء السؤال...');
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: formData });
        toast.success('تم تحديث السؤال بنجاح.');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('تم إنشاء السؤال بنجاح.');
      }
      handleCloseModal();
    } catch {
      toast.error('حدث خطأ أثناء حفظ السؤال.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
      toast.info('جارٍ حذف السؤال...');
      await deleteMutation.mutateAsync(id);
      toast.success('تم حذف السؤال بنجاح.');
    } catch {
      toast.error('حدث خطأ أثناء حذف السؤال.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="container-fluid py-10">
          <LoadingState text="جاري تحميل الأسئلة الشائعة..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <div className="container-fluid py-10">
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-red-700 dark:text-red-300">حدث خطأ في تحميل البيانات.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <div className="flex justify-between items-center gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">الأسئلة الشائعة</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">إدارة أسئلة وإجابات صفحة FAQ للمستخدمين</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-8">
      <div className="mb-6 flex justify-between items-center gap-3">
        <button
          onClick={() => handleOpenModal()}
          disabled={isMutating}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition disabled:opacity-60"
        >
          <Plus className="w-5 h-5" />
          <span className="font-arabic">إضافة سؤال</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن سؤال أو فئة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* FAQs by Category */}
      {filteredFAQs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد أسئلة شائعة</p>
        </div>
      ) : (
        Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 pb-2 border-b-2 border-primary-500">
              {category}
            </h2>
            <div className="space-y-3">
              {categoryFAQs.map((faq) => (
                <div key={faq.id} className="bg-white dark:bg-dark-card p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{faq.answer}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {!faq.isActive && <span className="bg-red-100 text-red-700 px-2 py-1 rounded">غير مفعل</span>}
                        <span>الترتيب: {faq.order}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(faq)}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        disabled={isMutating}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-3xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h2>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-140px)] sm:max-h-[calc(90vh-150px)]">

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفئة *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="مثال: عن المنتجات"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الفئة (إنجليزي)</label>
                    <input
                      type="text"
                      value={formData.categoryEn}
                      onChange={(e) => setFormData({ ...formData, categoryEn: e.target.value })}
                      placeholder="Category in English"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السؤال *</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="اكتب السؤال"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السؤال (إنجليزي)</label>
                  <input
                    type="text"
                    value={formData.questionEn}
                    onChange={(e) => setFormData({ ...formData, questionEn: e.target.value })}
                    placeholder="Question in English"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الإجابة *</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="اكتب الإجابة"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الإجابة (إنجليزي)</label>
                  <textarea
                    value={formData.answerEn}
                    onChange={(e) => setFormData({ ...formData, answerEn: e.target.value })}
                    placeholder="Answer in English"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الترتيب</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 md:mt-6">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      مفعل
                    </label>
                  </div>
                </div>

                <div className="sticky bottom-0 pt-3 bg-white dark:bg-dark-card">
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={isMutating}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {isMutating ? 'جارٍ الحفظ...' : editingId ? 'تحديث' : 'إنشاء'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isMutating}
                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
