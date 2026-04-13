import { Link, useLocation, useParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const paymentState = location.state || {};

  const paymentMethodLabel = paymentState.paymentLabel || 'الدفع عند الاستلام';
  const paymentDetails = paymentState.paymentDetails || null;

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="container-fluid py-16">
        <div className="max-w-3xl mx-auto card p-10 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">تم تأكيد الطلب بنجاح</h1>
          <p className="text-ink-700 dark:text-secondary-200 mb-2">رقم الطلب:</p>
          <p className="text-2xl font-bold text-primary-700 mb-8">{orderId}</p>

          <div className="mb-8 rounded-2xl border border-primary-200 bg-primary-50/70 dark:border-primary-800 dark:bg-primary-900/10 p-5 text-right space-y-2">
            <p className="font-bold text-ink-800 dark:text-white">وسيلة الدفع المختارة: {paymentMethodLabel}</p>
            <p className="text-ink-600 dark:text-secondary-300">سيتم التواصل معك قريبًا لتأكيد الشحن.</p>
            {paymentDetails?.note ? <p className="text-ink-600 dark:text-secondary-300 leading-7">{paymentDetails.note}</p> : null}
            {paymentDetails?.account ? (
              <p className="text-ink-800 dark:text-white font-semibold">
                رقم التحويل: <span className="font-mono">{paymentDetails.account}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn-primary">متابعة التسوق</Link>
            <Link to="/" className="btn-secondary">العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
