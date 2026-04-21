import { imageService } from '../../services/imageService';

const paymentLabels = {
  cod: 'الدفع عند الاستلام',
  instapay: 'Instapay',
  wallet: 'المحفظة الإلكترونية',
  paymob: 'الدفع الإلكتروني',
};

export default function CheckoutForm({
  form,
  setForm,
  onSubmit,
  loading,
  paymentOptions = [],
  paymentDetails = {},
  governorates = [],
  selectedGovernorateRate = 0,
  appliedShippingFee = 0,
  shippingEnabled = true,
  isFreeShippingApplied = false,
  paymentRequiresProof = false,
  onPaymentProofChange,
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="lg:col-span-2 card p-6 space-y-4">
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
        type="email"
        placeholder="البريد الإلكتروني"
        value={form.email}
        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        required
      />
      <select
        className="input"
        value={form.governorate}
        onChange={(e) => setForm((p) => ({ ...p, governorate: e.target.value }))}
        required
        disabled={governorates.length === 0}
      >
        <option value="" disabled>
          {governorates.length ? 'اختاري المحافظة' : 'لا توجد محافظات مفعلة حالياً'}
        </option>
        {governorates.map((governorate) => (
          <option key={governorate} value={governorate}>
            {governorate}
          </option>
        ))}
      </select>

      <input
        className="input"
        placeholder="المدينة"
        value={form.city}
        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
        required
      />

      {shippingEnabled && form.governorate ? (
        <div className="rounded-xl border border-surface-300 dark:border-primary-900/40 bg-surface-50 dark:bg-dark-surface p-3 text-sm text-ink-700 dark:text-secondary-200 space-y-1">
          <p>
            سعر الشحن لمحافظة {form.governorate}: <span className="font-semibold">{selectedGovernorateRate} ج.م</span>
          </p>
          <p>
            سعر الشحن المطبق على الطلب الآن:{' '}
            <span className="font-semibold">{appliedShippingFee === 0 ? 'مجاني' : `${appliedShippingFee} ج.م`}</span>
          </p>
          {isFreeShippingApplied ? (
            <p className="text-green-700 dark:text-green-400">تم تطبيق الشحن المجاني على هذا الطلب.</p>
          ) : null}
        </div>
      ) : null}
      <textarea
        className="input min-h-28"
        placeholder="العنوان بالتفصيل"
        value={form.address}
        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        required
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">وسيلة الدفع</p>
        <div className="space-y-2">
          {paymentOptions.length > 0 ? (
            paymentOptions.map((option) => (
              <label
                key={option.value}
                className={`flex flex-col gap-1 rounded-xl border px-4 py-3 cursor-pointer transition ${
                  form.payment === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface'
                }`}
              >
                <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                  <input
                    type="radio"
                    checked={form.payment === option.value}
                    onChange={() => setForm((p) => ({ ...p, payment: option.value }))}
                  />
                  {option.label}
                </span>
                {option.description ? (
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-6">{option.description}</span>
                ) : null}
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد وسائل دفع مفعلة حالياً.</p>
          )}
        </div>
        <p className="text-xs text-primary-700 dark:text-primary-300">
          الوسيلة المختارة الآن: <span className="font-semibold">{paymentLabels[form.payment] || form.payment}</span>
        </p>
      </div>

      {form.payment !== 'cod' ? (
        <div className="rounded-xl border border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/60 dark:bg-primary-900/10 p-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p className="font-semibold">تعليمات الدفع</p>
          <p>{paymentDetails[form.payment]?.note || paymentLabels[form.payment] || 'أكملي الطلب ثم ستظهر لك التعليمات.'}</p>
          {paymentDetails[form.payment]?.account ? (
            <p>
              الحساب: <span className="font-semibold">{paymentDetails[form.payment].account}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {paymentRequiresProof ? (
        <div className="space-y-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-white dark:bg-dark-surface p-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">صورة التحويل</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-white hover:file:bg-primary-700"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !onPaymentProofChange) return;

              const image = await imageService.fileToCompressedDataUrl(file, {
                maxDimension: 1600,
                quality: 0.82,
              });

              onPaymentProofChange({
                image,
                name: file.name,
              });
            }}
          />
          {form.paymentProofName ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">تم اختيار: {form.paymentProofName}</p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">يمكن رفع لقطة شاشة مباشرة، وسيتم ضغطها تلقائيًا قبل الإرسال.</p>
          )}
        </div>
      ) : null}

      <button
        className="btn-primary w-full"
        type="submit"
        disabled={loading || (paymentRequiresProof && !form.paymentProofImage)}
      >
        {loading ? 'جاري التأكيد...' : 'تأكيد الطلب'}
      </button>
    </form>
  );
}
