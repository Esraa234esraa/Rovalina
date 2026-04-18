import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { cartService } from '../services/cart.service.js';
import { successResponse } from '../utils/response.js';
export const getUserCart = asyncHandler(async (req, res) => {
    const data = await cartService.getUserCart(req.user.id);
    return successResponse(res, {
        message: 'تم جلب السلة بنجاح.',
        data,
    });
});
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId) {
        throw new ApiError(400, 'الحقل (معرف المنتج) مطلوب.');
    }
    const data = await cartService.addToCart(req.user.id, { productId, quantity });
    return successResponse(res, {
        statusCode: 201,
        message: 'تمت إضافة المنتج إلى السلة بنجاح.',
        data,
    });
});
export const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    if (typeof quantity === 'undefined') {
        throw new ApiError(400, 'الحقل (الكمية) مطلوب.');
    }
    const data = await cartService.updateQuantity(req.user.id, req.params.itemId, quantity);
    return successResponse(res, {
        message: 'تم تحديث الكمية في السلة بنجاح.',
        data,
    });
});
export const removeCartItem = asyncHandler(async (req, res) => {
    const data = await cartService.removeItem(req.user.id, req.params.itemId);
    return successResponse(res, {
        message: 'تم حذف العنصر من السلة بنجاح.',
        data,
    });
});
