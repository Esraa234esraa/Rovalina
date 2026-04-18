import { ApiError } from '../utils/ApiError.js';
import { errorResponse, toArabicErrorMessage } from '../utils/response.js';
export const notFound = (req, _res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
export const errorHandler = (err, _req, res, _next) => {
    let normalizedError = err;
    if (!(err instanceof ApiError) && err?.code === 'P2002') {
        const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(', ') : 'قيمة فريدة';
        normalizedError = new ApiError(409, `يوجد تعارض: ${target} مستخدم بالفعل.`);
    }
    else if (!(err instanceof ApiError) && err?.code === 'P2025') {
        normalizedError = new ApiError(404, 'العنصر المطلوب غير موجود.');
    }
    else if (!(err instanceof ApiError) && err?.code === 'P2003') {
        normalizedError = new ApiError(400, 'لا يمكن تنفيذ العملية بسبب ترابط البيانات.');
    }
    else if (!(err instanceof ApiError) && (err?.type === 'entity.too.large' || err?.status === 413)) {
        normalizedError = new ApiError(413, 'حجم البيانات المرسلة كبير جدًا. يرجى تقليل حجم الصور والمحاولة مرة أخرى.');
    }
    const statusCode = normalizedError instanceof ApiError
        ? normalizedError.statusCode
        : Number(err?.statusCode || err?.status || 500);
    const errors = normalizedError instanceof ApiError
        ? normalizedError.errors
        : process.env.NODE_ENV !== 'production'
            ? { stack: err.stack }
            : undefined;
    return errorResponse(res, {
        statusCode,
        message: toArabicErrorMessage(normalizedError?.message, statusCode),
        errors,
    });
};
