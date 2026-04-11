import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, DollarSign, Users, Clock, Download, TrendingUp, PackageOpen, RefreshCw } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { adminApi } from '../../services/adminApi';

const STATUS_LABELS = {
  PENDING: 'قيد الانتظار',
  PAID: 'تم الدفع',
  PROCESSING: 'قيد المعالجة',
  CONFIRMED: 'تم التأكيد',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

const STATUS_CLASSES = {
  PENDING: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  PAID: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  PROCESSING: 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  CONFIRMED: 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  SHIPPED: 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
  DELIVERED: 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300',
  CANCELLED: 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300',
};

const formatCurrency = (value, currency = 'EGP') =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ar-EG');
};

const getStatusLabel = (status) => STATUS_LABELS[status] || status;
const getStatusClass = (status) => STATUS_CLASSES[status] || STATUS_CLASSES.PENDING;

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    stats: null,
    topSellingProducts: [],
    recentOrders: [],
    limits: { topProductsLimit: 5, recentOrdersLimit: 5 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await adminApi.getDashboardOverview({
        topProductsLimit: 5,
        recentOrdersLimit: 5,
      });
      setDashboard(response.data?.data || dashboard);
    } catch (dashboardError) {
      setError(
        dashboardError?.response?.data?.message ||
          'تعذر تحميل بيانات لوحة التحكم حالياً.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = dashboard.stats || {
    orders: 0,
    customers: 0,
    products: 0,
    activeOffers: 0,
    revenue: 0,
  };

  const pendingOrders = dashboard.recentOrders.filter((order) => order.status === 'PENDING').length;
  const averageOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <div className="bg-surface-100 dark:bg-dark-card border-b border-surface-300 dark:border-primary-900/40">
        <div className="container-fluid py-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-ink-800 dark:text-secondary-100 mb-2">
              لوحة التحكم
            </h1>
            <p className="text-ink-600 dark:text-secondary-300">
              بيانات مباشرة من قاعدة البيانات مع أحدث الطلبات والمنتجات الأكثر مبيعاً.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-300 dark:border-primary-900/40 bg-surface-50 dark:bg-dark-surface text-ink-700 dark:text-secondary-200 hover:bg-surface-200 dark:hover:bg-dark-card transition"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث البيانات
          </button>
        </div>
      </div>

      <div className="container-fluid py-8 space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={ShoppingCart}
            label="إجمالي الطلبات"
            value={isLoading ? '...' : stats.orders}
            change={isLoading ? '' : `+${pendingOrders} قيد الانتظار`}
            trend="up"
          />
          <StatCard
            icon={DollarSign}
            label="إجمالي الإيرادات"
            value={isLoading ? '...' : formatCurrency(stats.revenue)}
            change={isLoading ? '' : 'من جميع الطلبات المؤكدة'}
            trend="up"
          />
          <StatCard
            icon={Users}
            label="عدد العملاء"
            value={isLoading ? '...' : stats.customers}
            change={isLoading ? '' : 'عملاء مسجلون'}
            trend="up"
          />
          <StatCard
            icon={Clock}
            label="طلبات قيد الانتظار"
            value={isLoading ? '...' : pendingOrders}
            change={isLoading ? '' : 'تحتاج مراجعة'}
            trend="down"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-surface-50 dark:bg-dark-card rounded-lg border border-surface-300 dark:border-primary-900/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-300 dark:border-primary-900/40 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-ink-800 dark:text-secondary-100">
                    آخر الطلبات
                  </h2>
                  <p className="text-sm text-ink-600 dark:text-secondary-300 mt-1">
                    آخر {dashboard.limits.recentOrdersLimit} طلبات من النظام
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDashboard}
                  className="p-2 hover:bg-surface-200 dark:hover:bg-gray-800 rounded-lg transition"
                  aria-label="تحديث الطلبات"
                >
                  <Download className="w-5 h-5 text-ink-600 dark:text-secondary-300" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-ink-700 dark:text-secondary-200 uppercase tracking-wider">
                        رقم الطلب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        المبلغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        التاريخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-300 dark:divide-gray-700">
                    {!isLoading && dashboard.recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-ink-600 dark:text-secondary-300">
                          لا توجد طلبات حديثة بعد.
                        </td>
                      </tr>
                    )}
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-background-100 dark:hover:bg-gray-800 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to="/admin/orders"
                            className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-ink-800 dark:text-secondary-100">
                              {order.customer?.name || 'عميل غير معروف'}
                            </p>
                            <p className="text-sm text-ink-600 dark:text-secondary-300">
                              {order.customer?.email || order.customerEmail || '-'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-ink-800 dark:text-secondary-100">
                          {formatCurrency(order.total, order.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-600 dark:text-secondary-300">
                          {formatDate(order.placedAt || order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-surface-300 dark:border-primary-900/40">
                <Link
                  to="/admin/orders"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm"
                >
                  عرض جميع الطلبات
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface-50 dark:bg-dark-card rounded-lg border border-surface-300 dark:border-primary-900/40 overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-surface-300 dark:border-primary-900/40 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-ink-800 dark:text-secondary-100">
                    المنتجات الأكثر مبيعاً
                  </h2>
                  <p className="text-sm text-ink-600 dark:text-secondary-300 mt-1">
                    أعلى {dashboard.limits.topProductsLimit} منتجات من حيث المبيعات
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>

              <div className="divide-y divide-surface-300 dark:divide-gray-700">
                {!isLoading && dashboard.topSellingProducts.length === 0 && (
                  <div className="px-6 py-10 text-center text-ink-600 dark:text-secondary-300">
                    لا توجد بيانات كافية لعرض المنتجات الأكثر مبيعاً.
                  </div>
                )}
                {dashboard.topSellingProducts.map((product, index) => (
                  <div key={product.productId} className="px-6 py-4 hover:bg-background-100 dark:hover:bg-gray-800 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-secondary-200 dark:bg-primary-900 text-ink-700 dark:text-secondary-100 rounded text-xs font-semibold">
                            #{index + 1}
                          </span>
                          <p className="font-medium text-ink-800 dark:text-secondary-100 text-sm truncate">
                            {product.productName}
                          </p>
                        </div>
                        {product.productNameEn && (
                          <p className="text-xs text-ink-600 dark:text-secondary-300 mt-0.5 truncate">
                            {product.productNameEn}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm mt-3 gap-3">
                      <div>
                        <p className="text-ink-600 dark:text-secondary-300 text-xs">
                          عدد المبيعات
                        </p>
                        <p className="font-bold text-ink-800 dark:text-secondary-100">
                          {product.totalSales}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-ink-600 dark:text-secondary-300 text-xs">
                          الإيرادات
                        </p>
                        <p className="font-bold text-primary-600 dark:text-primary-400">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 w-full bg-secondary-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, product.totalSales * 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-surface-300 dark:border-primary-900/40 flex items-center justify-between text-sm text-ink-600 dark:text-secondary-300">
                <span>متوسط قيمة الطلب</span>
                <span className="font-semibold text-ink-800 dark:text-secondary-100">
                  {isLoading ? '...' : formatCurrency(averageOrderValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-primary-600" />
              ملخص سريع
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">المنتجات</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.products}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">العروض النشطة</span>
                <span className="font-bold text-gray-900 dark:text-white">{stats.activeOffers}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">متوسط الطلب</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {isLoading ? '...' : formatCurrency(averageOrderValue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              حالة الطلبات
            </h3>
            <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">{pendingOrders}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">طلبات قيد الانتظار</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              تنقل سريع
            </h3>
            <div className="space-y-3">
              <Link to="/admin/orders" className="block w-full text-center px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition">
                إدارة الطلبات
              </Link>
              <Link to="/admin/products" className="block w-full text-center px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                إدارة المنتجات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
