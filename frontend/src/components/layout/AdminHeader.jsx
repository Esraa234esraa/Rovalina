import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun, Home } from 'lucide-react';
import { useAuthStore, useThemeStore } from '../../store';
import NotificationsDropdown from '../admin/NotificationsDropdown';
import { useToast } from '../../hooks/useToast';

export default function AdminHeader({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { logout, adminEmail } = useAuthStore();
  const { isDark, toggleDarkMode } = useThemeStore();
  const toast = useToast();
  const adminLabel = typeof adminEmail === 'string' ? adminEmail : adminEmail?.email || 'admin@rovalina.com';

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح.');
    navigate('/admin/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 bg-surface-100/95 dark:bg-dark-card/95 backdrop-blur-sm border-b border-surface-300 dark:border-primary-900/40 shadow-soft px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
          aria-label="فتح أو إغلاق القائمة الجانبية"
        >
          <Menu className="w-5 h-5 text-ink-700 dark:text-secondary-200" />
        </button>
        
        <button
          onClick={handleGoHome}
          className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
          title="العودة إلى الصفحة الرئيسية"
        >
          <Home className="w-5 h-5 text-ink-700 dark:text-secondary-200" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 min-w-0">
        <span className="hidden md:block font-arabic text-sm text-ink-600 dark:text-secondary-300 truncate max-w-[220px]">
          {adminLabel}
        </span>

        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-ink-600" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-secondary-100 dark:bg-red-900/20 text-ink-700 dark:text-red-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-red-900/40 transition font-arabic text-sm"
          title="تسجيل الخروج"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
}


