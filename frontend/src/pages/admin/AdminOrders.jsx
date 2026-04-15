import { useMemo, useState } from 'react';
import { Search, Eye, Printer, ChevronDown } from 'lucide-react';
import { useAdminOrdersQuery, useAdminUpdateOrderStatusMutation } from '../../hooks/admin/useAdminOrders';
import LoadingState from '../../components/ui/LoadingState';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'قيد الانتظار', color: 'yellow' },
  { value: 'paid', label: 'تم الدفع', color: 'green' },
  { value: 'processing', label: 'قيد المعالجة', color: 'blue' },
  { value: 'confirmed', label: 'تم التأكيد', color: 'purple' },
  { value: 'shipped', label: 'تم الشحن', color: 'blue' },
  { value: 'delivered', label: 'تم التسليم', color: 'green' },
  { value: 'cancelled', label: 'ملغي', color: 'red' },
];

const getStatusColor = (status) => {
  const statusObj = STATUS_OPTIONS.find((s) => s.value === status);
  const colors = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
    green: 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300',
  };
  return colors[statusObj?.color] || colors.blue;
};

const getStatusLabel = (status) => {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
};

const getPaymentLabel = (paymentMethod) => {
  const paymentMap = {
    COD: 'الدفع عند الاستلام',
    WALLET: 'محفظة إلكترونية',
    INSTAPAY: 'إنستاباي',
    PAYMOB: 'بطاقة بنكية',
  };

  return paymentMap[paymentMethod] || paymentMethod || '-';
};

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

export default function AdminOrders() {
  const { data: remoteOrdersData = { items: [] }, isLoading } = useAdminOrdersQuery();
  const updateOrderStatusMutation = useAdminUpdateOrderStatusMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(null);

  const orders = useMemo(() => {
    const sourceOrders = Array.isArray(remoteOrdersData)
      ? remoteOrdersData
      : Array.isArray(remoteOrdersData?.items)
        ? remoteOrdersData.items
        : [];

    return sourceOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber || order.id,
      customerName: order.customerName || order.user?.name || 'عميل غير معروف',
      email: order.customerEmail || order.user?.email || '-',
      phone: order.customerPhone || order.user?.phone || '-',
      date: order.placedAt || order.createdAt,
      status: String(order.status || '').toLowerCase(),
      total: Number(order.total || 0),
      subtotal: Number(order.subtotal || 0),
      shippingFee: Number(order.shippingFee || 0),
      taxAmount: Number(order.taxAmount || 0),
      discountAmount: Number(order.discountAmount || 0),
      itemsCount:
        Number(order.itemsCount || 0) ||
        (Array.isArray(order.items)
          ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
          : 0),
      items: Array.isArray(order.items) ? order.items : [],
      payment: order.paymentMethod,
      paymentProofImage: order.paymentProofImage || order.paymentResponse?.paymentProofImage || '',
      governorate: order.governorate || '',
      city: order.city || '',
      postalCode: order.postalCode || '',
      addressLine: order.addressLine || '',
      notes: order.notes || '',
    }));
  }, [remoteOrdersData]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.includes(searchTerm) ||
      order.customerName.includes(searchTerm) ||
      order.email.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    if (updateOrderStatusMutation.isPending) return;
    updateOrderStatusMutation.mutate(
      { id: orderId, status: newStatus.toUpperCase() },
      {
        onSuccess: () => {
          setStatusDropdown(null);
        },
      }
    );
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid py-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                إدارة الطلبات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
                عرض وإدارة جميع طلبات العملاء
            </p>
          </div>
        </div>
      </div>

      <div className="container-fluid py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي الطلبات</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {orderStats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">قيد الانتظار</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {orderStats.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">قيد المعالجة</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {orderStats.processing}
            </p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">تم التسليم</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {orderStats.delivered}
            </p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ملغي</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {orderStats.cancelled}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">جميع الحالات</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    مبلغ المنتجات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    مبلغ الشحن
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    الإجمالي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="py-0">
                      <LoadingState text="جاري تحميل الطلبات..." />
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="space-y-0.5">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 align-middle">
                        {new Date(order.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setStatusDropdown(
                                statusDropdown === order.id ? null : order.id
                              )
                            }
                            disabled={updateOrderStatusMutation.isPending}
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {statusDropdown === order.id && (
                            <div className="absolute top-full right-0 mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-max">
                              {STATUS_OPTIONS.map((status) => (
                                <button
                                  key={status.value}
                                  onClick={() =>
                                    handleStatusChange(order.id, status.value)
                                  }
                                  disabled={updateOrderStatusMutation.isPending}
                                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition first:rounded-t-lg last:rounded-b-lg"
                                >
                                  {status.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white align-middle">
                        {formatCurrency(order.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white align-middle">
                        {formatCurrency(order.shippingFee)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-primary-600 dark:text-primary-400 align-middle">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded transition"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 dark:text-green-400 rounded transition"
                            title="طباعة"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                      لا توجد طلبات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 p-3 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto hide-scrollbar">
          <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-3xl max-h-[82vh] sm:max-h-[78vh] flex flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                تفاصيل الطلب {selectedOrder.orderNumber}
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">اسم العميل</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الهاتف</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">التاريخ</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedOrder.date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">العنوان</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.addressLine || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">طريقة الدفع</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getPaymentLabel(selectedOrder.payment)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">المحافظة</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.governorate || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">المدينة / المركز</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.city || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الرمز البريدي</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.postalCode || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ملاحظات العميل</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.notes || '-'}
                  </p>
                </div>
                {selectedOrder.paymentProofImage ? (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">صورة التحويل</p>
                    <a href={selectedOrder.paymentProofImage} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={selectedOrder.paymentProofImage}
                        alt="إثبات التحويل"
                        className="w-full max-h-64 sm:max-h-80 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                      />
                    </a>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عدد المنتجات</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.itemsCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأصناف</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.items.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مبلغ المنتجات</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {formatCurrency(selectedOrder.subtotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مبلغ الشحن</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {formatCurrency(selectedOrder.shippingFee)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">المبلغ الإجمالي</p>
                  <p className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">تفاصيل المنتجات</p>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedOrder.items.length ? (
                      selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.productName || 'منتج'}</p>
                            <p className="text-gray-600 dark:text-gray-400">الكمية: {item.quantity || 0}</p>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-gray-600 dark:text-gray-400">لا توجد تفاصيل أصناف لهذا الطلب.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                إغلاق
              </button>
              <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center gap-2">
                <Printer className="w-4 h-4" />
                طباعة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

