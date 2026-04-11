import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/response.js';

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'البريد الإلكتروني وكلمة المرور مطلوبان.');
  }

  const result = await authService.register({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'تم إنشاء الحساب بنجاح.',
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'البريد الإلكتروني وكلمة المرور مطلوبان.');
  }

  const result = await authService.login({ email, password });
  return successResponse(res, {
    message: 'تم تسجيل الدخول بنجاح.',
    data: result,
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'البريد الإلكتروني وكلمة المرور مطلوبان.');
  }

  const result = await authService.login({ email, password, adminOnly: true });
  return successResponse(res, {
    message: 'تم تسجيل دخول المشرف بنجاح.',
    data: result,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return successResponse(res, {
    message: 'تم جلب بيانات المستخدم بنجاح.',
    data: user,
  });
});

export const logout = asyncHandler(async (_req, res) => {
  return successResponse(res, {
    message: 'تم تسجيل الخروج بنجاح.',
    data: null,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (String(newPassword).length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  await authService.changePassword(req.user.id, currentPassword, newPassword);

  return successResponse(res, {
    message: 'تم تغيير كلمة المرور بنجاح.',
    data: null,
  });
});
