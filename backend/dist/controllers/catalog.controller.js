import { catalogService } from '../services/catalog.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/response.js';
export const listProducts = asyncHandler(async (req, res) => {
    const data = await catalogService.listProducts(req.query);
    return successResponse(res, {
        message: 'تم جلب المنتجات بنجاح.',
        data,
    });
});
export const getProductById = asyncHandler(async (req, res) => {
    const item = await catalogService.getProductById(req.params.id);
    if (!item)
        throw new ApiError(404, 'المنتج غير موجود.');
    return successResponse(res, {
        message: 'تم جلب بيانات المنتج بنجاح.',
        data: item,
    });
});
export const listCategories = asyncHandler(async (_req, res) => {
    const items = await catalogService.listCategories();
    return successResponse(res, {
        message: 'تم جلب الأقسام بنجاح.',
        data: items,
    });
});
export const listBrands = asyncHandler(async (_req, res) => {
    const items = await catalogService.listBrands();
    return successResponse(res, {
        message: 'تم جلب العلامات التجارية بنجاح.',
        data: items,
    });
});
export const listDurations = asyncHandler(async (_req, res) => {
    const items = await catalogService.listDurations();
    return successResponse(res, {
        message: 'تم جلب المدد بنجاح.',
        data: items,
    });
});
export const getDurationById = asyncHandler(async (req, res) => {
    const item = await catalogService.getDurationById(req.params.id);
    if (!item)
        throw new ApiError(404, 'المدة غير موجودة.');
    return successResponse(res, {
        message: 'تم جلب تفاصيل المدة بنجاح.',
        data: item,
    });
});
export const listOffers = asyncHandler(async (_req, res) => {
    const items = await catalogService.listOffers();
    return successResponse(res, {
        message: 'تم جلب العروض بنجاح.',
        data: items,
    });
});
export const listFeaturedOffers = asyncHandler(async (_req, res) => {
    const items = await catalogService.listFeaturedOffers();
    return successResponse(res, {
        message: 'تم جلب العروض المميزة بنجاح.',
        data: items,
    });
});
export const getStoreSettings = asyncHandler(async (_req, res) => {
    const data = await catalogService.getStoreSettings();
    return successResponse(res, {
        message: 'تم جلب إعدادات المتجر بنجاح.',
        data,
    });
});
export const getOfferById = asyncHandler(async (req, res) => {
    const item = await catalogService.getOfferById(req.params.id);
    if (!item)
        throw new ApiError(404, 'العرض غير موجود.');
    return successResponse(res, {
        message: 'تم جلب تفاصيل العرض بنجاح.',
        data: item,
    });
});
