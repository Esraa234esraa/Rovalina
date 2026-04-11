import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Layers,
  Star,
  Clock,
  Images,
  CircleHelp,
  MessageSquare,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { BRAND } from '../../lib/constants';

export default function AdminSidebar({ isOpen, onToggle }) {

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin/dashboard' },
    { icon: Package, label: 'المنتجات', href: '/admin/products' },
    { icon: ShoppingCart, label: 'الطلبات', href: '/admin/orders' },
    { icon: Tags, label: 'العروض', href: '/admin/offers' },
    { icon: Layers, label: 'الفئات', href: '/admin/categories' },
    { icon: Clock, label: 'المدد', href: '/admin/durations' },
    { icon: CircleHelp, label: 'الأسئلة الشائعة', href: '/admin/faqs' },
    { icon: Images, label: 'جالري إنستغرام', href: '/admin/instagram-gallery' },
    { icon: Star, label: 'العلامات التجارية', href: '/admin/brands' },
    { icon: MessageSquare, label: 'التقييمات', href: '/admin/testimonials' },
    { icon: Settings, label: 'الإعدادات', href: '/admin/settings' },
  ];

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-screen overflow-y-auto bg-surface-100 dark:bg-dark-card border-l border-surface-300 dark:border-primary-900/40 shadow-soft transition-all duration-300 ${
        isOpen ? 'translate-x-0 w-72 lg:w-64' : 'translate-x-full lg:translate-x-0 w-72 lg:w-20'
      }`}
    >
      {isOpen && (
        <button
          onClick={onToggle}
          className="absolute top-3 left-3 z-10 p-2 bg-white/90 dark:bg-dark-surface border border-surface-300 dark:border-primary-900/40 rounded-lg shadow-sm hover:bg-surface-200 dark:hover:bg-dark-surface/80 transition lg:hidden"
          aria-label="إغلاق القائمة الجانبية"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="p-4 border-b border-surface-300 dark:border-primary-900/40 flex items-center justify-between">
        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-ink-900 font-bold">
              R
            </div>
            <span className="font-arabic font-bold text-sm">{BRAND.name}</span>
          </div>
        )}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg lg:hidden"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition text-ink-700 dark:text-secondary-200 ${
                isActive
                  ? 'bg-secondary-200 dark:bg-primary-900/30 text-ink-900 dark:text-secondary-100'
                  : 'hover:bg-secondary-200 dark:hover:bg-dark-surface'
              } ${!isOpen ? 'justify-center px-2' : ''}`
            }
            title={!isOpen ? item.label : ''}
          >
            <item.icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
            {isOpen && <span className="font-arabic text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}


