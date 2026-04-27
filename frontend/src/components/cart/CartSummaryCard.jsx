export default function CartSummaryCard({ subtotal, shipping, total, onCheckout, enableFreeShipping }) {
  return (
    <div className="card p-6 h-fit sticky top-24">
      <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
      <div className="space-y-2 text-ink-700 dark:text-secondary-200">
        <div className="flex justify-between"><span>المجموع الفرعي</span><span>{subtotal} ج.م</span></div>
        {enableFreeShipping && (
          <div className="flex justify-between"><span>الشحن</span><span>مجاني</span></div>
        )}
        <div className="flex justify-between font-bold text-lg pt-3 border-t border-surface-300"><span>الإجمالي</span><span>{total} ج.م</span></div>
      </div>
      <button onClick={onCheckout} className="btn-primary w-full mt-4">المتابعة للدفع</button>
    </div>
  );
}
