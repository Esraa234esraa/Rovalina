import { Link, useParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-16">
        <div className="max-w-3xl mx-auto card p-10 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">تم تأكيد الطلب بنجاح</h1>
          <p className="text-ink-700 dark:text-secondary-200 mb-2">رقم الطلب:</p>
          <p className="text-2xl font-bold text-primary-700 mb-8">{orderId}</p>

          <p className="text-ink-600 dark:text-secondary-300 mb-8">سيتم التواصل معك قريبًا لتأكيد الشحن.</p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-primary">متابعة التسوق</Link>
            <Link to="/" className="btn-secondary">العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
