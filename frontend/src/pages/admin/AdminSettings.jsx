import { useEffect, useMemo, useRef, useState } from 'react';
import { Save, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useAdminSettingsQuery, useAdminUpdateSettingsMutation } from '../../hooks/admin/useAdminSettings';
import LoadingState from '../../components/ui/LoadingState';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiMessage';

const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'اسوان',
  'اسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
];

const DEFAULT_SETTINGS = {
  storeName: 'Rovalina Lenses',
  storeEmail: 'info@rovalinaloneses.com',
  storePhone: '+20 100 123 4567',
  storeAddress: 'القاهرة، مصر',
  city: 'القاهرة',
  governorate: 'القاهرة',
  postalCode: '12345',
  shippingFee: 50,
  freeShippingMinimum: 500,
  deliveryDays: 3,
  shippingRates: [],
  enableShipping: true,
  enableCOD: true,
  enableInstapay: true,
  enableWallet: false,
  enablePaymob: false,
  walletNumber: '',
  instapayNumber: '',
  metaTitle: 'Rovalina Lenses - عدسات لاصقة أصلية',
  metaDescription: 'متجر متخصص في بيع العدسات اللاصقة الأصلية بأفضل الأسعار',
  facebook: 'https://facebook.com/rovalina',
  instagram: 'https://instagram.com/rovalina',
  tiktok: 'https://tiktok.com/@rovalina',
  whatsapp: '+20 100 123 4567',
  enableEmailNotifications: true,
  notifyOnNewOrder: true,
  notifyOnNewReview: true,
  taxRate: 14,
  enableTax: true,
  supportEmail: 'support@rovalinaloneses.com',
  supportPhone: '+20 100 234 5678',
  aboutUs: 'نحن متجر متخصص في العدسات الأصلية مع خدمة عملاء سريعة وتوصيل آمن.',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GovernorateDropdown({ value, options, onChange, isOptionDisabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef(null);

  const normalizedSearch = String(search || '').trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedSearch) return true;
    return String(option).toLowerCase().includes(normalizedSearch);
  });

  const closeDropdown = () => {
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between gap-2"
      >
        <span className={value ? '' : 'text-gray-400 dark:text-gray-500'}>
          {value || 'اختاري المحافظة'}
        </span>
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute top-full mt-1 z-20 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحثي عن المحافظة..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">لا توجد نتائج مطابقة.</p>
            ) : (
              filteredOptions.map((option) => {
                const selected = option === value;
                const disabled = Boolean(isOptionDisabled?.(option));

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(option);
                      closeDropdown();
                    }}
                    className={`w-full px-3 py-2 text-sm text-right flex items-center justify-between gap-2 transition ${
                      selected
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span>{option}</span>
                    {selected ? <Check className="w-4 h-4" /> : null}
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={closeDropdown}
              className="w-full px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminSettings() {
  const toast = useToast();
  const { data: remoteSettings, isLoading } = useAdminSettingsQuery();
  const updateSettingsMutation = useAdminUpdateSettingsMutation();
  const [draft, setDraft] = useState({});

  const baseSettings = useMemo(
    () => ({
      ...DEFAULT_SETTINGS,
      ...(remoteSettings || {}),
    }),
    [remoteSettings]
  );

  const settings = useMemo(
    () => ({
      ...baseSettings,
      ...draft,
    }),
    [baseSettings, draft]
  );

  const hasChanges = useMemo(() => Object.keys(draft).length > 0, [draft]);

  const isSaving = updateSettingsMutation.isPending;

  const summary = useMemo(
    () => ({
      email: settings.storeEmail || '-',
      phone: settings.storePhone || '-',
      shippingRatesCount: Array.isArray(settings.shippingRates) ? settings.shippingRates.length : 0,
      taxRate: Number(settings.taxRate || 0),
      aboutPreview: String(settings.aboutUs || '').trim().slice(0, 120),
    }),
    [settings]
  );

  const handleSettingChange = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleShippingRateChange = (index, key, value) => {
    const currentRates = Array.isArray(settings.shippingRates) ? settings.shippingRates : [];
    const nextRates = currentRates.map((rate, rateIndex) =>
      rateIndex === index
        ? {
            ...rate,
            [key]: value,
          }
        : rate
    );

    setDraft((current) => ({
      ...current,
      shippingRates: nextRates,
    }));
  };

  const addShippingRate = () => {
    const currentRates = Array.isArray(settings.shippingRates) ? settings.shippingRates : [];
    const selectedGovernorates = new Set(
      currentRates.map((rate) => String(rate?.governorate || '').trim()).filter(Boolean)
    );
    const nextGovernorate = EGYPT_GOVERNORATES.find((name) => !selectedGovernorates.has(name)) || '';

    setDraft((current) => ({
      ...current,
      shippingRates: [...currentRates, { governorate: nextGovernorate, fee: 0 }],
    }));
  };

  const addAllGovernorates = () => {
    const currentRates = Array.isArray(settings.shippingRates) ? settings.shippingRates : [];
    const ratesMap = new Map();

    currentRates.forEach((rate) => {
      const governorate = String(rate?.governorate || '').trim();
      if (!governorate) return;
      ratesMap.set(governorate, {
        governorate,
        fee: Number(rate?.fee || 0),
      });
    });

    EGYPT_GOVERNORATES.forEach((governorate) => {
      if (!ratesMap.has(governorate)) {
        ratesMap.set(governorate, { governorate, fee: 0 });
      }
    });

    setDraft((current) => ({
      ...current,
      shippingRates: Array.from(ratesMap.values()),
    }));
  };

  const removeShippingRate = (index) => {
    const currentRates = Array.isArray(settings.shippingRates) ? settings.shippingRates : [];
    setDraft((current) => ({
      ...current,
      shippingRates: currentRates.filter((_, rateIndex) => rateIndex !== index),
    }));
  };

  const validateSettings = () => {
    const storeName = String(settings.storeName || '').trim();
    const storeEmail = String(settings.storeEmail || '').trim();
    const freeShippingMinimum = Number(settings.freeShippingMinimum);
    const deliveryDays = Number.parseInt(String(settings.deliveryDays), 10);
    const taxRate = Number(settings.taxRate);

    if (!storeName) {
      toast.error('اسم المتجر مطلوب.');
      return false;
    }

    if (!storeEmail || !emailRegex.test(storeEmail)) {
      toast.error('البريد الإلكتروني غير صحيح.');
      return false;
    }

    if (!Number.isFinite(freeShippingMinimum) || freeShippingMinimum < 0) {
      toast.error('حد الشحن المجاني يجب أن يكون رقمًا موجبًا أو صفر.');
      return false;
    }

    if (!Number.isFinite(deliveryDays) || deliveryDays <= 0) {
      toast.error('عدد أيام التسليم يجب أن يكون رقمًا أكبر من صفر.');
      return false;
    }

    if (settings.enableTax && (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100)) {
      toast.error('معدل الضريبة يجب أن يكون بين 0 و 100.');
      return false;
    }

    if (settings.enableInstapay && !String(settings.instapayNumber || '').trim()) {
      toast.error('رقم Instapay مطلوب عند تفعيل وسيلة الدفع هذه.');
      return false;
    }

    if (settings.enableWallet && !String(settings.walletNumber || '').trim()) {
      toast.error('رقم المحفظة مطلوب عند تفعيل وسيلة الدفع هذه.');
      return false;
    }

    if (settings.enableShipping) {
      const shippingRates = Array.isArray(settings.shippingRates) ? settings.shippingRates : [];

      if (!shippingRates.length) {
        toast.error('أضيفي على الأقل محافظة واحدة مع سعر الشحن.');
        return false;
      }

      const governorates = new Set();

      for (const rate of shippingRates) {
        const governorate = String(rate?.governorate || '').trim();
        const fee = Number(rate?.fee);

        if (!governorate) {
          toast.error('اسم المحافظة مطلوب داخل جدول الشحن.');
          return false;
        }

        if (governorates.has(governorate)) {
          toast.error(`المحافظة ${governorate} مضافة أكثر من مرة.`);
          return false;
        }
        governorates.add(governorate);

        if (!Number.isFinite(fee) || fee < 0) {
          toast.error(`سعر الشحن للمحافظة ${governorate} يجب أن يكون رقمًا موجبًا أو صفر.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    if (!validateSettings()) return;

    const payload = {
      ...settings,
      storeName: String(settings.storeName || '').trim(),
      storeEmail: String(settings.storeEmail || '').trim(),
      shippingFee: 0,
      freeShippingMinimum: Number(settings.freeShippingMinimum || 0),
      deliveryDays: Number.parseInt(String(settings.deliveryDays || 1), 10),
      taxRate: Number(settings.taxRate || 0),
      shippingRates: Array.isArray(settings.shippingRates)
        ? settings.shippingRates
            .map((rate) => ({
              governorate: String(rate?.governorate || '').trim(),
              fee: Number(rate?.fee || 0),
            }))
            .filter((rate) => rate.governorate)
        : [],
      aboutUs: String(settings.aboutUs || '').trim(),
    };

    try {
      await updateSettingsMutation.mutateAsync(payload);
      toast.success('تم حفظ الإعدادات بنجاح.');
      setDraft({});
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر حفظ الإعدادات.'));
    }
  };

  const handleReset = () => {
    if (isSaving) return;
    setDraft({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">إعدادات المتجر</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة الإعدادات العامة وصفحة من نحن وطرق الشحن والدفع</p>
        </div>
      </div>

      <div className="container-fluid py-8">
        {isLoading ? (
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700">
            <LoadingState text="جاري تحميل إعدادات المتجر..." className="py-6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">معلومات المتجر</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المتجر</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleSettingChange('storeName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الهاتف</label>
                      <input
                        type="tel"
                        value={settings.storePhone}
                        onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان</label>
                    <input
                      type="text"
                      value={settings.storeAddress}
                      onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">الشحن والضرائب</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">حد الشحن المجاني</label>
                      <input
                        type="number"
                        value={settings.freeShippingMinimum}
                        onChange={(e) => handleSettingChange('freeShippingMinimum', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">أيام التسليم</label>
                      <input
                        type="number"
                        value={settings.deliveryDays}
                        onChange={(e) => handleSettingChange('deliveryDays', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(settings.enableShipping)}
                        onChange={(e) => handleSettingChange('enableShipping', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300"
                      />
                      <span className="text-gray-700 dark:text-gray-300">تفعيل الشحن</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(settings.enableTax)}
                        onChange={(e) => handleSettingChange('enableTax', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300"
                      />
                      <span className="text-gray-700 dark:text-gray-300">تفعيل الضريبة</span>
                    </label>
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/60 dark:bg-gray-800/40">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">أسعار الشحن حسب المحافظة فقط</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">اختاري المحافظة وحددي سعر الشحن لها.</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={addAllGovernorates}
                          className="px-4 py-2 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition"
                        >
                          إضافة كل المحافظات
                        </button>
                        <button
                          type="button"
                          onClick={addShippingRate}
                          className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                        >
                          إضافة محافظة
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(Array.isArray(settings.shippingRates) ? settings.shippingRates : []).length > 0 ? (
                        settings.shippingRates.map((rate, index) => (
                          <div key={`shipping-rate-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3 items-center">
                            <GovernorateDropdown
                              value={rate?.governorate || ''}
                              options={EGYPT_GOVERNORATES}
                              onChange={(governorate) => handleShippingRateChange(index, 'governorate', governorate)}
                              isOptionDisabled={(governorate) =>
                                settings.shippingRates.some(
                                  (item, itemIndex) =>
                                    itemIndex !== index &&
                                    String(item?.governorate || '').trim() === governorate
                                )
                              }
                            />
                            <input
                              type="number"
                              value={rate?.fee ?? 0}
                              onChange={(e) => handleShippingRateChange(index, 'fee', e.target.value)}
                              placeholder="سعر الشحن"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeShippingRate(index)}
                              className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/20 transition"
                            >
                              حذف
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-4 py-6 text-sm text-gray-600 dark:text-gray-400">
                          لا توجد محافظات مضافة بعد.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">وسائل الدفع</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.enableCOD)}
                          onChange={(e) => handleSettingChange('enableCOD', e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300"
                        />
                        <span className="text-gray-700 dark:text-gray-300">الدفع عند الاستلام</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.enableInstapay)}
                          onChange={(e) => handleSettingChange('enableInstapay', e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Instapay</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.enableWallet)}
                          onChange={(e) => handleSettingChange('enableWallet', e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300"
                        />
                        <span className="text-gray-700 dark:text-gray-300">المحفظة الإلكترونية</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.enablePaymob)}
                          onChange={(e) => handleSettingChange('enablePaymob', e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Paymob (لاحقًا)</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم Instapay</label>
                        <input
                          type="text"
                          value={settings.instapayNumber || ''}
                          onChange={(e) => handleSettingChange('instapayNumber', e.target.value)}
                          placeholder="رقم/معرف Instapay"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم المحفظة</label>
                        <input
                          type="text"
                          value={settings.walletNumber || ''}
                          onChange={(e) => handleSettingChange('walletNumber', e.target.value)}
                          placeholder="رقم المحفظة الإلكترونية"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">معدل الضريبة (%)</label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleSettingChange('taxRate', e.target.value)}
                      disabled={!settings.enableTax}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">صفحة من نحن (About Us)</h2>
                </div>
                <div className="p-6">
                  <textarea
                    rows="6"
                    value={settings.aboutUs}
                    onChange={(e) => handleSettingChange('aboutUs', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-7"
                    placeholder="اكتبي وصف المتجر ورسالة العلامة التجارية..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">هذا النص يظهر في صفحة /about للمستخدمين.</p>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">روابط التواصل الاجتماعي</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رابط Facebook</label>
                      <input
                        type="url"
                        value={settings.facebook || ''}
                        onChange={(e) => handleSettingChange('facebook', e.target.value)}
                        placeholder="https://facebook.com/your-page"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رابط Instagram</label>
                      <input
                        type="url"
                        value={settings.instagram || ''}
                        onChange={(e) => handleSettingChange('instagram', e.target.value)}
                        placeholder="https://instagram.com/your-page"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رابط TikTok</label>
                      <input
                        type="url"
                        value={settings.tiktok || ''}
                        onChange={(e) => handleSettingChange('tiktok', e.target.value)}
                        placeholder="https://tiktok.com/@your-page"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم/رابط WhatsApp</label>
                      <input
                        type="text"
                        value={settings.whatsapp || ''}
                        onChange={(e) => handleSettingChange('whatsapp', e.target.value)}
                        placeholder="+20 100 123 4567 أو https://wa.me/..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving || isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition font-medium"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isSaving || isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition font-medium"
                  >
                    <RotateCcw className="w-5 h-5" />
                    إعادة تعيين
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">ملخص سريع</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="text-gray-900 dark:text-white break-all">{summary.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الهاتف</p>
                    <p className="text-gray-900 dark:text-white">{summary.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">عدد المحافظات المسعرة</p>
                    <p className="text-gray-900 dark:text-white">{summary.shippingRatesCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">نسبة الضريبة</p>
                    <p className="text-gray-900 dark:text-white">{summary.taxRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">وسائل الدفع المفعلة</p>
                    <p className="text-gray-900 dark:text-white leading-6">
                      {[
                        settings.enableCOD ? 'COD' : null,
                        settings.enableInstapay ? 'Instapay' : null,
                        settings.enableWallet ? 'Wallet' : null,
                        settings.enablePaymob ? 'Paymob' : null,
                      ]
                        .filter(Boolean)
                        .join(' • ') || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">معاينة About Us</p>
                    <p className="text-gray-900 dark:text-white leading-6">{summary.aboutPreview || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}