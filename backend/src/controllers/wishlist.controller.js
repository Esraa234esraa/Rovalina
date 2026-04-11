import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { wishlistService } from '../services/wishlist.service.js';
import { successResponse } from '../utils/response.js';

export const getUserWishlist = asyncHandler(async (req, res) => {
  const data = await wishlistService.getUserWishlist(req.user.id);
  return successResponse(res, {
    message: 'تم جلب المفضلة بنجاح.',
    data,
  });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new ApiError(400, 'الحقل (معرف المنتج) مطلوب.');
  }

  const data = await wishlistService.addItem(req.user.id, productId);
  return successResponse(res, {
    statusCode: 201,
    message: 'تمت إضافة المنتج إلى المفضلة بنجاح.',
    data,
  });
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  const data = await wishlistService.removeItem(req.user.id, req.params.itemId);
  return successResponse(res, {
    message: 'تم حذف المنتج من المفضلة بنجاح.',
    data,
  });
});

export const removeWishlistItemByProduct = asyncHandler(async (req, res) => {
  const data = await wishlistService.removeByProductId(req.user.id, req.params.productId);
  return successResponse(res, {
    message: 'تم حذف المنتج من المفضلة بنجاح.',
    data,
  });
});
