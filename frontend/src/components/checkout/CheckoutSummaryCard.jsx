export default function CheckoutSummaryCard({ items, subtotal, shipping, total }) {
  return (
    <div className="card p-6 h-fit sticky top-24">
      <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{item.price * item.quantity} ج.م</span>
          </div>
        ))}
        <div className="border-t border-surface-300 pt-3 flex justify-between"><span>المجموع الفرعي</span><span>{subtotal} ج.م</span></div>
        <div className="flex justify-between"><span>الشحن</span><span>{shipping === 0 ? 'مجاني' : `${shipping} ج.م`}</span></div>
        <div className="font-bold text-lg border-t border-surface-300 pt-3 flex justify-between"><span>الإجمالي</span><span>{total} ج.م</span></div>
      </div>
    </div>
  );
}
