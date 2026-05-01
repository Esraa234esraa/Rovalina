import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

export default function RouteError() {
  const error = useRouteError();
  const message = error?.message || String(error) || 'حدث خطأ غير متوقع.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-200 dark:bg-dark-bg">
      <div className="max-w-xl w-full p-8 bg-white dark:bg-dark-card rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">حدث خطأ أثناء تحميل الصفحة</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="btn btn-primary">إعادة تحميل الصفحة</button>
          <Link to="/" className="btn">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
