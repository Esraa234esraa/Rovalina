export default function CheckoutForm({ form, setForm, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="lg:col-span-2 card p-6 space-y-4">
      <h1 className="text-3xl font-bold mb-2">إكمال الطلب</h1>

      <input
        className="input"
        placeholder="الاسم الكامل"
        value={form.fullName}
        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
        required
      />
      <input
        className="input"
        placeholder="رقم الهاتف"
        value={form.phone}
        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        required
      />
      <input
        className="input"
        placeholder="المدينة"
        value={form.city}
        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
        required
      />
      <textarea
        className="input min-h-28"
        placeholder="العنوان بالتفصيل"
        value={form.address}
        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        required
      />

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={form.payment === 'cod'}
            onChange={() => setForm((p) => ({ ...p, payment: 'cod' }))}
          />
          الدفع عند الاستلام
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={form.payment === 'instapay'}
            onChange={() => setForm((p) => ({ ...p, payment: 'instapay' }))}
          />
          Instapay
        </label>
      </div>

      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'جاري التأكيد...' : 'تأكيد الطلب'}
      </button>
    </form>
  );
}
