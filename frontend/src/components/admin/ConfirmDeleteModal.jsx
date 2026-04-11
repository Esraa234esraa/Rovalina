import { AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  itemName,
  itemType = 'العنصر',
  onCancel,
  onConfirm,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card shadow-xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-start gap-3">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">تأكيد الحذف</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              هل أنت متأكد من حذف {itemType}
              {itemName ? `: ${itemName}` : ''}؟ لا يمكن التراجع بعد الحذف.
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-800/60">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isLoading ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  );
}
