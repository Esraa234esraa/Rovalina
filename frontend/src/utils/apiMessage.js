export const getApiErrorMessage = (error, fallback = 'حدث خطأ غير متوقع.') => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === 'string' && firstError.trim()) return firstError;
    if (typeof firstError?.message === 'string' && firstError.message.trim()) return firstError.message;
  }

  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};
