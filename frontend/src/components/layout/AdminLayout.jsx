import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ScrollToTop from '../scroll-to-top/ScrollToTop';

export default function AdminLayout() {
  const { isAuthenticated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background-200 dark:bg-dark-bg">
      <ScrollToTop />

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />

      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'lg:mr-64' : 'lg:mr-20'
        }`}
      >
        <AdminHeader onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

