import { asyncHandler } from '../utils/asyncHandler.js';
import { engagementService } from '../services/engagement.service.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/response.js';
export const listProductReviews = asyncHandler(async (req, res) => {
    const data = await engagementService.listProductReviews(req.params.productId);
    return successResponse(res, {
        message: 'تم جلب تقييمات المنتج بنجاح.',
        data,
    });
});
export const listInstagramGallery = asyncHandler(async (_req, res) => {
    const data = await engagementService.listInstagramGallery();
    return successResponse(res, {
        message: 'تم جلب معرض انستجرام بنجاح.',
        data,
    });
});
export const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment, name } = req.body;
    if (!rating || !comment) {
        throw new ApiError(400, 'التقييم والتعليق مطلوبان.');
    }
    const userId = req.user?.id || null;
    const data = await engagementService.createProductReview({
        productId: req.params.productId,
        userId,
        name,
        rating,
        comment,
    });
    return successResponse(res, {
        statusCode: 201,
        message: 'تم إضافة تقييم المنتج بنجاح.',
        data,
    });
});
export const createSiteReview = asyncHandler(async (req, res) => {
    const { name, email, quote, rating } = req.body;
    if (!quote || !rating) {
        throw new ApiError(400, 'التقييم النصي والتقييم الرقمي مطلوبان.');
    }
    const userId = req.user?.id || null;
    const data = await engagementService.createSiteReview({ userId, name, email, quote, rating });
    return successResponse(res, {
        statusCode: 201,
        message: 'تم إضافة التقييم العام بنجاح.',
        data,
    });
});
export const listTestimonials = asyncHandler(async (_req, res) => {
    const data = await engagementService.listTestimonials();
    return successResponse(res, {
        message: 'تم جلب آراء العملاء بنجاح.',
        data,
    });
});
export const createContactMessage = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        throw new ApiError(400, 'الاسم والبريد الإلكتروني والرسالة مطلوبة.');
    }
    const userId = req.user?.id || null;
    const data = await engagementService.createContactMessage(req.body, userId);
    return successResponse(res, {
        statusCode: 201,
        message: 'تم إرسال رسالة التواصل بنجاح.',
        data,
    });
});
export const subscribeNewsletter = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, 'البريد الإلكتروني مطلوب.');
    }
    const userId = req.user?.id || null;
    const data = await engagementService.subscribeNewsletter({ email, userId });
    return successResponse(res, {
        statusCode: 201,
        message: 'تم الاشتراك في النشرة البريدية بنجاح.',
        data,
    });
});
export const listFAQs = asyncHandler(async (_req, res) => {
    const data = await engagementService.listFAQs();
    return successResponse(res, {
        message: 'تم جلب الأسئلة الشائعة بنجاح.',
        data,
    });
});
export const getFAQsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    if (!category) {
        throw new ApiError(400, 'الفئة مطلوبة.');
    }
    const data = await engagementService.getFAQsByCategory(decodeURIComponent(category));
    return successResponse(res, {
        message: 'تم جلب الأسئلة الشائعة للفئة بنجاح.',
        data,
    });
});
