const ARABIC_FIELD_NAMES = {
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    productId: 'معرف المنتج',
    quantity: 'الكمية',
    orderId: 'معرف الطلب',
    status: 'حالة الطلب',
    name: 'الاسم',
    slug: 'الرابط التعريفي',
    title: 'العنوان',
    code: 'الكود',
    discount: 'قيمة الخصم',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    quote: 'التقييم النصي',
    rating: 'التقييم',
    message: 'الرسالة',
    sku: 'رمز المنتج',
    price: 'السعر',
    categoryId: 'القسم',
    comment: 'التعليق',
    transactionId: 'معرف المعاملة',
    paymobOrderId: 'معرف طلب Paymob',
    paymentToken: 'رمز الدفع',
    iframeUrl: 'رابط نافذة الدفع',
};
const EXACT_MESSAGE_MAP = new Map([
    ['email and password are required', 'البريد الإلكتروني وكلمة المرور مطلوبان.'],
    ['product not found', 'المنتج غير موجود.'],
    ['offer not found', 'العرض غير موجود.'],
    ['order not found', 'الطلب غير موجود.'],
    ['rating and comment are required', 'التقييم والتعليق مطلوبان.'],
    ['quote and rating are required', 'التقييم النصي والتقييم الرقمي مطلوبان.'],
    ['name, email, and message are required', 'الاسم والبريد الإلكتروني والرسالة مطلوبة.'],
    ['email is required', 'البريد الإلكتروني مطلوب.'],
    ['name and slug are required', 'الاسم والرابط التعريفي مطلوبان.'],
    ['logged out successfully', 'تم تسجيل الخروج بنجاح.'],
    ['authentication required', 'مطلوب تسجيل الدخول أولاً.'],
    ['invalid or expired token', 'جلسة الدخول غير صالحة أو منتهية.'],
    ['user is not active', 'الحساب غير نشط حالياً.'],
    ['forbidden', 'ليس لديك صلاحية لتنفيذ هذا الإجراء.'],
    ['quantity must be a positive number', 'يجب أن تكون الكمية رقماً موجباً.'],
    ['product is not active', 'هذا المنتج غير متاح حالياً.'],
    ['insufficient stock for requested quantity', 'الكمية المطلوبة غير متوفرة في المخزون.'],
    ['cart item not found', 'عنصر السلة غير موجود.'],
    ['email already in use', 'هذا البريد الإلكتروني مستخدم بالفعل.'],
    ['invalid credentials', 'بيانات تسجيل الدخول غير صحيحة.'],
    ['user not found', 'المستخدم غير موجود.'],
    ['current password and new password are required', 'كلمة المرور الحالية والجديدة مطلوبتان.'],
    ['current password is incorrect', 'كلمة المرور الحالية غير صحيحة.'],
    ['new password must be at least 6 characters long', 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.'],
    ['account is inactive', 'الحساب غير مفعل حالياً.'],
    ['admin access required', 'هذا الإجراء متاح للمشرف فقط.'],
    ['cart is empty', 'السلة فارغة.'],
    ['order items are required', 'يجب إضافة عناصر للطلب.'],
    ['internal server error', 'حدث خطأ داخلي في الخادم.'],
]);
const toArabicFieldName = (fieldName) => ARABIC_FIELD_NAMES[fieldName] || fieldName;
const defaultErrorMessageByStatus = (statusCode) => {
    if (statusCode === 400)
        return 'البيانات المرسلة غير صحيحة.';
    if (statusCode === 401)
        return 'غير مصرح لك بتنفيذ هذا الطلب.';
    if (statusCode === 403)
        return 'ليس لديك صلاحية للوصول إلى هذا المورد.';
    if (statusCode === 404)
        return 'العنصر المطلوب غير موجود.';
    if (statusCode === 409)
        return 'تعذر تنفيذ الطلب بسبب تعارض في البيانات.';
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
};
export const toArabicErrorMessage = (message, statusCode = 500) => {
    if (!message)
        return defaultErrorMessageByStatus(statusCode);
    const normalized = String(message).trim();
    if (!normalized)
        return defaultErrorMessageByStatus(statusCode);
    if (/[^\u0000-\u007F]/.test(normalized)) {
        return normalized;
    }
    const exact = EXACT_MESSAGE_MAP.get(normalized.toLowerCase());
    if (exact)
        return exact;
    const requiredMatch = normalized.match(/^([A-Za-z][A-Za-z0-9_]*) is required$/i);
    if (requiredMatch) {
        return `الحقل (${toArabicFieldName(requiredMatch[1])}) مطلوب.`;
    }
    const routeNotFoundMatch = normalized.match(/^Route not found:\s*(.+)$/i);
    if (routeNotFoundMatch) {
        return `المسار غير موجود: ${routeNotFoundMatch[1]}`;
    }
    const productNotFoundById = normalized.match(/^Product not found:\s*(.+)$/i);
    if (productNotFoundById) {
        return `المنتج غير موجود (${productNotFoundById[1]}).`;
    }
    const unavailableProduct = normalized.match(/^Product is unavailable:\s*(.+)$/i);
    if (unavailableProduct) {
        return `المنتج غير متاح حالياً: ${unavailableProduct[1]}.`;
    }
    const insufficientStock = normalized.match(/^Insufficient stock for\s+(.+)$/i);
    if (insufficientStock) {
        return `المخزون غير كافٍ للمنتج: ${insufficientStock[1]}.`;
    }
    return defaultErrorMessageByStatus(statusCode);
};
export const successResponse = (res, { message = 'تمت العملية بنجاح.', data = null, statusCode = 200 }) => res.status(statusCode).json({
    success: true,
    message,
    data,
});
export const errorResponse = (res, { message, statusCode = 500, errors }) => {
    const body = {
        success: false,
        message: toArabicErrorMessage(message, statusCode),
    };
    if (errors) {
        body.errors = errors;
    }
    return res.status(statusCode).json(body);
};
