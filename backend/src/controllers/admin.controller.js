import { asyncHandler } from '../utils/asyncHandler.js';
import { adminService } from '../services/admin.service.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/response.js';

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const data = await adminService.dashboardStats();
  return successResponse(res, {
    message: 'تم جلب إحصائيات لوحة التحكم بنجاح.',
    data,
  });
});

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const data = await adminService.dashboardOverview({
    topProductsLimit: req.query.topProductsLimit,
    recentOrdersLimit: req.query.recentOrdersLimit,
  });

  return successResponse(res, {
    message: 'تم جلب بيانات لوحة التحكم بنجاح.',
    data,
  });
});

export const listNotifications = asyncHandler(async (req, res) => {
  const data = await adminService.listNotifications(req.user.id);
  return successResponse(res, {
    message: 'تم جلب الإشعارات بنجاح.',
    data,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const data = await adminService.markNotificationRead(req.params.id, req.user.id);
  return successResponse(res, {
    message: 'تم تحديث حالة الإشعار بنجاح.',
    data,
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const data = await adminService.deleteNotification(req.params.id, req.user.id);
  return successResponse(res, {
    message: 'تم حذف الإشعار بنجاح.',
    data,
  });
});

export const getSettings = asyncHandler(async (_req, res) => {
  const data = await adminService.getSettings();
  return successResponse(res, {
    message: 'تم جلب إعدادات المتجر بنجاح.',
    data,
  });
});

export const upsertSettings = asyncHandler(async (req, res) => {
  const data = await adminService.upsertSettings(req.body);
  return successResponse(res, {
    message: 'تم حفظ إعدادات المتجر بنجاح.',
    data,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    throw new ApiError(400, 'اسم التصنيف مطلوب.');
  }
  const data = await adminService.createCategory(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء القسم بنجاح.',
    data,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = await adminService.updateCategory(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث القسم بنجاح.',
    data,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await adminService.deleteCategory(req.params.id);
  return successResponse(res, {
    message: 'تم حذف القسم بنجاح.',
    data: null,
  });
});

export const createBrand = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    throw new ApiError(400, 'اسم العلامة التجارية مطلوب.');
  }
  const data = await adminService.createBrand(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء العلامة التجارية بنجاح.',
    data,
  });
});

export const updateBrand = asyncHandler(async (req, res) => {
  const data = await adminService.updateBrand(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث العلامة التجارية بنجاح.',
    data,
  });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  await adminService.deleteBrand(req.params.id);
  return successResponse(res, {
    message: 'تم حذف العلامة التجارية بنجاح.',
    data: null,
  });
});

export const listDurations = asyncHandler(async (_req, res) => {
  const data = await adminService.listDurations();
  return successResponse(res, {
    message: 'تم جلب المدد بنجاح.',
    data,
  });
});

export const getDurationById = asyncHandler(async (req, res) => {
  const data = await adminService.getDurationById(req.params.id);
  if (!data) {
    throw new ApiError(404, 'المدة غير موجودة.');
  }
  return successResponse(res, {
    message: 'تم جلب تفاصيل المدة بنجاح.',
    data,
  });
});

export const createDuration = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    throw new ApiError(400, 'اسم المدة مطلوب.');
  }
  const data = await adminService.createDuration(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء المدة بنجاح.',
    data,
  });
});

export const updateDuration = asyncHandler(async (req, res) => {
  const data = await adminService.updateDuration(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث المدة بنجاح.',
    data,
  });
});

export const deleteDuration = asyncHandler(async (req, res) => {
  await adminService.deleteDuration(req.params.id);
  return successResponse(res, {
    message: 'تم حذف المدة بنجاح.',
    data: null,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const required = ['name', 'slug', 'price', 'sku', 'categoryId'];
  for (const key of required) {
    if (!req.body[key]) throw new ApiError(400, `${key} is required`);
  }
  const data = await adminService.createProduct(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء المنتج بنجاح.',
    data,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const data = await adminService.updateProduct(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث المنتج بنجاح.',
    data,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await adminService.deleteProduct(req.params.id);
  return successResponse(res, {
    message: 'تم حذف المنتج بنجاح.',
    data: null,
  });
});

export const listProductReviews = asyncHandler(async (req, res) => {
  const data = await adminService.listProductReviews(req.params.productId);
  return successResponse(res, {
    message: 'تم جلب تقييمات المنتج بنجاح.',
    data,
  });
});

export const updateProductReview = asyncHandler(async (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(req.body || {}, 'isApproved')) {
    throw new ApiError(400, 'isApproved is required');
  }

  const data = await adminService.updateProductReview(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث حالة تقييم المنتج بنجاح.',
    data,
  });
});

export const deleteProductReview = asyncHandler(async (req, res) => {
  await adminService.deleteProductReview(req.params.id);
  return successResponse(res, {
    message: 'تم حذف تقييم المنتج بنجاح.',
    data: null,
  });
});

export const createOffer = asyncHandler(async (req, res) => {
  const required = ['title', 'code', 'discount', 'startDate', 'endDate'];
  for (const key of required) {
    if (!req.body[key]) throw new ApiError(400, `${key} is required`);
  }
  const data = await adminService.createOffer(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء العرض بنجاح.',
    data,
  });
});

export const listOffers = asyncHandler(async (_req, res) => {
  const data = await adminService.listOffers();
  return successResponse(res, {
    message: 'تم جلب العروض بنجاح.',
    data,
  });
});

export const updateOffer = asyncHandler(async (req, res) => {
  const data = await adminService.updateOffer(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث العرض بنجاح.',
    data,
  });
});

export const deleteOffer = asyncHandler(async (req, res) => {
  await adminService.deleteOffer(req.params.id);
  return successResponse(res, {
    message: 'تم حذف العرض بنجاح.',
    data: null,
  });
});

export const listTestimonials = asyncHandler(async (_req, res) => {
  const data = await adminService.listTestimonials();
  return successResponse(res, {
    message: 'تم جلب التقييمات بنجاح.',
    data,
  });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const required = ['quote', 'rating'];
  for (const key of required) {
    if (!req.body[key]) throw new ApiError(400, `${key} is required`);
  }
  const data = await adminService.createTestimonial(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء شهادة العميل بنجاح.',
    data,
  });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const data = await adminService.updateTestimonial(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث شهادة العميل بنجاح.',
    data,
  });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  await adminService.deleteTestimonial(req.params.id);
  return successResponse(res, {
    message: 'تم حذف شهادة العميل بنجاح.',
    data: null,
  });
});

export const listFAQs = asyncHandler(async (_req, res) => {
  const data = await adminService.listFAQs();
  return successResponse(res, {
    message: 'تم جلب الأسئلة الشائعة بنجاح.',
    data,
  });
});

export const createFAQ = asyncHandler(async (req, res) => {
  if (!req.body.question || !req.body.answer || !req.body.category) {
    throw new ApiError(400, 'السؤال والإجابة والفئة مطلوبة.');
  }
  const data = await adminService.createFAQ(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء السؤال الشائع بنجاح.',
    data,
  });
});

export const updateFAQ = asyncHandler(async (req, res) => {
  const data = await adminService.updateFAQ(req.params.id, req.body);
  return successResponse(res, {
    message: 'تم تحديث السؤال الشائع بنجاح.',
    data,
  });
});

export const deleteFAQ = asyncHandler(async (req, res) => {
  await adminService.deleteFAQ(req.params.id);
  return successResponse(res, {
    message: 'تم حذف السؤال الشائع بنجاح.',
    data: null,
  });
});

export const listInstagramGalleryItems = asyncHandler(async (_req, res) => {
  const data = await adminService.listInstagramGalleryItems();
  return successResponse(res, {
    message: 'تم جلب عناصر معرض انستجرام بنجاح.',
    data,
  });
});

export const createInstagramGalleryItem = asyncHandler(async (req, res) => {
  if (!req.body?.image) {
    throw new ApiError(400, 'رابط الصورة مطلوب.');
  }

  const data = await adminService.createInstagramGalleryItem(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'تم إضافة صورة جديدة للمعرض بنجاح.',
    data,
  });
});

export const updateInstagramGalleryItem = asyncHandler(async (req, res) => {
  const data = await adminService.updateInstagramGalleryItem(req.params.id, req.body || {});
  return successResponse(res, {
    message: 'تم تحديث عنصر معرض انستجرام بنجاح.',
    data,
  });
});

export const deleteInstagramGalleryItem = asyncHandler(async (req, res) => {
  await adminService.deleteInstagramGalleryItem(req.params.id);
  return successResponse(res, {
    message: 'تم حذف عنصر معرض انستجرام بنجاح.',
    data: null,
  });
});
