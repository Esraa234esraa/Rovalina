import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container-fluid py-16 text-center">
      <h1 className="font-arabic text-4xl font-bold mb-4">404</h1>
      <p className="font-arabic mb-8">الصفحة غير موجودة</p>
      <Link to="/" className="btn btn-primary">
        العودة للرئيسية
      </Link>
    </div>
  );
}


