import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import LoadingState from '../ui/LoadingState';

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `قبل ${diffMinutes} دقيقة`;
  if (diffHours < 24) return `قبل ${diffHours} ساعة`;
  if (diffDays < 7) return `قبل ${diffDays} يوم`;
  return date.toLocaleDateString('ar-EG');
};

export default function NotificationsDropdown() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const notificationsQuery = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await adminApi.listNotifications();
      return response.data.data;
    },
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: 'always',
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => adminApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => adminApi.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });

  const notifications = useMemo(
    () => (Array.isArray(notificationsQuery.data) ? notificationsQuery.data : []),
    [notificationsQuery.data]
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  // إغلاق الـ dropdown عند الضغط بره
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleViewAllOrders = () => {
    setIsOpen(false);
    navigate('/admin/orders');
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markReadMutation.mutateAsync(notification.id);
    }
    setIsOpen(false);
    navigate('/admin/orders');
  };

  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation();
    if (!notificationId) return;

    await deleteNotificationMutation.mutateAsync(notificationId);
  };

  const notificationsLoading = notificationsQuery.isLoading;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
        title="الإشعارات"
      >
        <Bell className="w-5 h-5 text-ink-700 dark:text-secondary-200" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu - Overlay على الموبايل وDropdown على الشاشات الأكبر */}
      {isOpen && (
        <div className="fixed top-16 left-3 right-3 bg-white dark:bg-dark-card rounded-lg shadow-xl border border-surface-200 dark:border-dark-surface z-50 max-h-[70vh] overflow-hidden flex flex-col sm:absolute sm:top-full sm:left-0 sm:right-auto sm:mt-2 sm:w-96 sm:max-h-96" dir="rtl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-surface-200 dark:border-dark-surface flex justify-between items-center">
            <h3 className="font-arabic font-semibold text-ink-900 dark:text-white">
              الإشعارات
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surface-100 dark:hover:bg-dark-surface rounded transition"
            >
              <X className="w-4 h-4 text-ink-600 dark:text-secondary-300" />
            </button>
          </div>

          {/* Orders List */}
          <div className="overflow-y-auto flex-1">
            {notificationsLoading ? (
              <div className="p-4">
                <LoadingState text="جاري تحميل الإشعارات..." />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const isOrderNotification = String(notification.type || '').startsWith('ORDER');
                const orderNumber = notification.data?.orderNumber || notification.data?.orderId || 'طلب جديد';

                return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  className="p-3 border-b border-surface-100 dark:border-dark-surface hover:bg-surface-50 dark:hover:bg-dark-surface/50 transition cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-arabic font-medium text-ink-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                        {notification.title}
                      </p>
                      <p className="font-arabic text-xs text-ink-600 dark:text-secondary-300 mt-1 leading-6">
                        {notification.message}
                      </p>
                      <p className="font-arabic text-xs text-ink-500 dark:text-secondary-400 mt-1">
                        {isOrderNotification ? `الطلب: ${orderNumber}` : notification.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={(event) => handleDeleteNotification(event, notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="inline-flex items-center justify-center p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-60"
                        title="حذف الإشعار"
                        aria-label="حذف الإشعار"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <p className="font-arabic text-xs text-ink-500 dark:text-secondary-400">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                      {!notification.isRead && (
                        <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 text-[11px] font-semibold">
                          جديد
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-surface-300 dark:text-dark-surface mx-auto mb-2" />
                <p className="font-arabic text-ink-600 dark:text-secondary-300">
                  لا توجد إشعارات حالياً
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-surface-200 dark:border-dark-surface">
              <button
                type="button"
                onClick={handleViewAllOrders}
                className="w-full font-arabic text-sm py-2 text-center text-primary-600 dark:text-primary-400 hover:bg-surface-50 dark:hover:bg-dark-surface rounded transition font-medium"
              >
                عرض جميع الطلبات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
