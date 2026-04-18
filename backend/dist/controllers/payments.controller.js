import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { orderService } from '../services/order.service.js';
import { paymobService } from '../services/paymob.service.js';
export const createPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body || {};
    if (!orderId) {
        throw new ApiError(400, 'orderId is required');
    }
    const order = await orderService.getOrderById(orderId);
    if (!order) {
        throw new ApiError(404, 'الطلب غير موجود.');
    }
    if (String(order.status || '').toUpperCase() === 'PAID') {
        throw new ApiError(409, 'تم سداد هذا الطلب بالفعل.');
    }
    const paymentSession = await paymobService.createPaymentSession(order);
    const data = await prisma.order.update({
        where: { id: order.id },
        data: {
            paymobOrderId: paymentSession.paymobOrderId,
            paymentResponse: {
                lastPaymentSessionCreatedAt: new Date().toISOString(),
                paymobOrderId: paymentSession.paymobOrderId,
            },
        },
        select: {
            id: true,
            orderNumber: true,
            paymobOrderId: true,
            paymentMethod: true,
            total: true,
            currency: true,
        },
    });
    return successResponse(res, {
        message: 'تم إنشاء جلسة الدفع بنجاح.',
        data: {
            ...data,
            paymentToken: paymentSession.paymentToken,
            iframeUrl: paymentSession.iframeUrl,
        },
    });
});
export const handleWebhook = asyncHandler(async (req, res) => {
    const context = paymobService.extractWebhookContext(req.body || {});
    const lookupOrderId = context.merchantOrderId || context.paymobOrderId;
    if (!lookupOrderId) {
        throw new ApiError(400, 'تعذر تحديد الطلب المرتبط ببيان الدفع.');
    }
    const order = await prisma.order.findFirst({
        where: {
            OR: [
                { id: lookupOrderId },
                { paymobOrderId: lookupOrderId },
            ],
        },
    });
    if (!order) {
        throw new ApiError(404, 'الطلب المرتبط بالدفع غير موجود.');
    }
    const updateData = {
        paymobOrderId: context.paymobOrderId || order.paymobOrderId,
        paymentResponse: context.paymentResponse,
    };
    if (context.success) {
        updateData.status = 'PAID';
        if (context.transactionId) {
            updateData.transactionId = context.transactionId;
        }
    }
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: updateData,
        select: {
            id: true,
            orderNumber: true,
            status: true,
            transactionId: true,
            paymobOrderId: true,
            updatedAt: true,
        },
    });
    return successResponse(res, {
        message: context.success
            ? 'تم تأكيد عملية الدفع بنجاح.'
            : 'تم استلام إشعار دفع غير ناجح، وتم الإبقاء على حالة الطلب قيد الانتظار.',
        data: updatedOrder,
    });
});
