import { asyncHandler } from '../utils/asyncHandler.js';
import { orderService } from '../services/order.service.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/response.js';
export const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id || null;
    const data = await orderService.createOrder(req.body, userId);
    return successResponse(res, {
        statusCode: 201,
        message: 'تم إنشاء الطلب بنجاح.',
        data,
    });
});
export const calculateOrderTotalFromCart = asyncHandler(async (req, res) => {
    const data = await orderService.calculateTotalFromCart(req.user.id);
    return successResponse(res, {
        message: 'تم حساب إجمالي الطلب من السلة بنجاح.',
        data,
    });
});
export const createOrderFromCart = asyncHandler(async (req, res) => {
    const data = await orderService.createOrderFromCart(req.user.id, req.body);
    return successResponse(res, {
        statusCode: 201,
        message: 'تم إنشاء الطلب من السلة بنجاح.',
        data,
    });
});
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    if (!order)
        throw new ApiError(404, 'الطلب غير موجود.');
    return successResponse(res, {
        message: 'تم جلب تفاصيل الطلب بنجاح.',
        data: order,
    });
});
export const listMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.listMyOrders(req.user.id);
    return successResponse(res, {
        message: 'تم جلب طلباتك بنجاح.',
        data: orders,
    });
});
export const listOrders = asyncHandler(async (req, res) => {
    const data = await orderService.listOrders(req.query);
    return successResponse(res, {
        message: 'تم جلب الطلبات بنجاح.',
        data,
    });
});
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!status) {
        throw new ApiError(400, 'الحقل (حالة الطلب) مطلوب.');
    }
    const data = await orderService.updateOrderStatus(req.params.id, status);
    return successResponse(res, {
        message: 'تم تحديث حالة الطلب بنجاح.',
        data,
    });
});
