// Brand constants
export const BRAND = {
  name: 'Rovalina Lenses',
  tagline: 'عدسات بألوان الأحلام',
  taglineEn: 'Lenses with the Colors of Dreams',
};

// Categories
export const CATEGORIES = [
  { id: 1, name: 'عدسات ملونة', nameEn: 'Colored Lenses', slug: 'colored-lenses', icon: '👁️' },
  { id: 2, name: 'عدسات شفافة', nameEn: 'Clear Lenses', slug: 'clear-lenses', icon: '✨' },
  { id: 3, name: 'العدسات الشهرية', nameEn: 'Monthly Lenses', slug: 'monthly', icon: '📅' },
  { id: 4, name: 'الملحقات', nameEn: 'Accessories', slug: 'accessories', icon: '💧' },
  { id: 5, name: 'محاليل العناية', nameEn: 'Care Solutions', slug: 'care-solutions', icon: '🧴' },
];

// Durations
export const DURATIONS = [
  { id: 1, name: 'يومي', nameEn: 'Daily', value: 'daily' },
  { id: 2, name: 'أسبوعي', nameEn: 'Weekly', value: 'weekly' },
  { id: 3, name: 'شهري', nameEn: 'Monthly', value: 'monthly' },
  { id: 4, name: 'سنوي', nameEn: 'Yearly', value: 'yearly' },
];

// Brands
export const BRANDS = [
  { id: 1, name: 'FreshLook', logo: '👓' },
  { id: 2, name: 'Air Optix', logo: '🌬️' },
  { id: 3, name: 'Acuvue', logo: '✨' },
  { id: 4, name: 'Soflens', logo: '☁️' },
  { id: 5, name: 'Dailies', logo: '🌅' },
];

// Colors
export const COLORS = [
  { id: 1, name: 'أسود', nameEn: 'Black', hex: '#000000' },
  { id: 2, name: 'أزرق', nameEn: 'Blue', hex: '#0066FF' },
  { id: 3, name: 'أخضر', nameEn: 'Green', hex: '#00AA00' },
  { id: 4, name: 'بني', nameEn: 'Brown', hex: '#8B4513' },
  { id: 5, name: 'رمادي', nameEn: 'Gray', hex: '#808080' },
  { id: 6, name: 'عسلي', nameEn: 'Hazel', hex: '#A0522D' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 1, name: 'الدفع عند الاستلام', nameEn: 'Cash on Delivery', value: 'cod' },
  { id: 2, name: 'إنستاباي', nameEn: 'Instapay', value: 'instapay' },
];

// Order Status
export const ORDER_STATUS = [
  { id: 1, name: 'قيد الانتظار', nameEn: 'Pending', value: 'pending', color: 'bg-yellow-100' },
  { id: 2, name: 'مؤكدة', nameEn: 'Confirmed', value: 'confirmed', color: 'bg-blue-100' },
  { id: 3, name: 'قيد الشحن', nameEn: 'Shipped', value: 'shipped', color: 'bg-purple-100' },
  { id: 4, name: 'موصلة', nameEn: 'Delivered', value: 'delivered', color: 'bg-green-100' },
  { id: 5, name: 'ملغاة', nameEn: 'Canceled', value: 'canceled', color: 'bg-red-100' },
];

// Governorates (Egyptian)
export const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'البحيرة',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'الإسماعيلية',
  'بورسعيد',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الوادي الجديد',
];

export const SHIPPING_FEE = 50;
export const FREE_SHIPPING_ABOVE = 500;

export const INSTAPAY_ACCOUNT = '01234567890';
