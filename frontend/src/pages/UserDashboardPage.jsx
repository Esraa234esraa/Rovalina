import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Lock, Mail, Package, Phone, UserRound } from 'lucide-react';
import { useUserStore } from '../store';
import { shopApi } from '../services/shopApi';
import LoadingState from '../components/ui/LoadingState';

const ITEMS_PER_PAGE = 5;

const STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  PROCESSING: 'قيد المعالجة',
  CONFIRMED: 'مؤكد',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

const STATUS_BADGES = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  CONFIRMED: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  SHIPPED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const formatCurrency = (value, currency = 'EGP') =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useUserStore();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [profileResponse, ordersResponse] = await Promise.all([shopApi.me(), shopApi.getMyOrders()]);

        if (!isMounted) return;

        setProfile(profileResponse?.data?.data || null);
        setOrders(Array.isArray(ordersResponse?.data?.data) ? ordersResponse.data.data : []);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.response?.data?.message || 'تعذر تحميل لوحة المستخدم حالياً.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, navigate]);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  const displayedName = profile?.name || user?.name || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'مستخدم';

  const onChangePasswordField = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('يرجى إدخال كل حقول كلمة المرور.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('تأكيد كلمة المرور غير مطابق.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await shopApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess('تم تغيير كلمة المرور بنجاح.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error?.response?.data?.message || 'تعذر تغيير كلمة المرور حالياً.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return <LoadingState text="جاري تحميل لوحة المستخدم..." className="py-20" />;
  }

  if (loadError) {
    return (
      <div className="container-fluid py-12">
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{loadError}</p>
          <Link to="/" className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-semibold">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-8">
      <div className="mb-8">
        <h1 className="font-arabic text-3xl font-bold text-ink-900 dark:text-secondary-100 mb-2">لوحة المستخدم</h1>
        <p className="text-ink-500 dark:text-secondary-300">بيانات الحساب وطلباتك السابقة (عرض فقط).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 bg-white dark:bg-dark-card border border-surface-300 dark:border-primary-900/40 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-ink-800 dark:text-secondary-100">بيانات الحساب</h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-ink-700 dark:text-secondary-200">
              <UserRound className="w-4 h-4" />
              <span>{displayedName}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-700 dark:text-secondary-200">
              <Mail className="w-4 h-4" />
              <span>{profile?.email || user?.email || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-700 dark:text-secondary-200">
              <Phone className="w-4 h-4" />
              <span>{profile?.phone || 'غير مضاف'}</span>
            </div>
            <div className="flex items-center gap-2 text-ink-700 dark:text-secondary-200">
              <CalendarDays className="w-4 h-4" />
              <span>
                تاريخ التسجيل:{' '}
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ar-EG') : '-'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-300 dark:border-primary-900/40">
            <h3 className="font-semibold text-ink-800 dark:text-secondary-100 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              تغيير كلمة المرور
            </h3>

            <form className="space-y-3" onSubmit={handleChangePassword}>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => onChangePasswordField('currentPassword', e.target.value)}
                className="w-full input"
                placeholder="كلمة المرور الحالية"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => onChangePasswordField('newPassword', e.target.value)}
                className="w-full input"
                placeholder="كلمة المرور الجديدة"
              />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => onChangePasswordField('confirmPassword', e.target.value)}
                className="w-full input"
                placeholder="تأكيد كلمة المرور الجديدة"
              />

              {passwordError && <p className="text-xs text-red-600 dark:text-red-300">{passwordError}</p>}
              {passwordSuccess && <p className="text-xs text-green-700 dark:text-green-300">{passwordSuccess}</p>}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2 bg-white dark:bg-dark-card border border-surface-300 dark:border-primary-900/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-800 dark:text-secondary-100">طلباتي</h2>
            <span className="text-xs text-ink-500 dark:text-secondary-300">إجمالي الطلبات: {orders.length}</span>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-300 dark:border-primary-900/40 p-8 text-center">
              <Package className="w-10 h-10 mx-auto text-ink-400 dark:text-secondary-400 mb-2" />
              <p className="text-sm text-ink-600 dark:text-secondary-300">لا توجد طلبات حتى الآن.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedOrders.map((order) => {
                  const statusKey = String(order.status || '').toUpperCase();
                  const statusText = STATUS_LABELS[statusKey] || order.status;
                  const statusClass = STATUS_BADGES[statusKey] || STATUS_BADGES.PENDING;

                  return (
                    <article
                      key={order.id}
                      className="rounded-xl border border-surface-300 dark:border-primary-900/40 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-ink-800 dark:text-secondary-100">
                          {order.orderNumber || order.id}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-600 dark:text-secondary-300 mb-3">
                        <p>التاريخ: {new Date(order.createdAt || order.placedAt).toLocaleDateString('ar-EG')}</p>
                        <p>العدد: {order.items?.length || 0} منتج</p>
                        <p>الإجمالي: {formatCurrency(order.total, order.currency || 'EGP')}</p>
                      </div>

                      <div className="space-y-1 text-xs text-ink-600 dark:text-secondary-300">
                        {(order.items || []).slice(0, 3).map((item) => (
                          <p key={item.id}>
                            {item.productName || item.productSku || 'منتج'} x {item.quantity}
                          </p>
                        ))}
                        {(order.items || []).length > 3 && (
                          <p className="text-ink-500 dark:text-secondary-400">... والمزيد</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-5 border-t border-surface-300 dark:border-primary-900/40 pt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-surface-300 dark:border-primary-900/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                <p className="text-xs text-ink-600 dark:text-secondary-300">
                  صفحة {currentPage} من {totalPages}
                </p>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-surface-300 dark:border-primary-900/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
