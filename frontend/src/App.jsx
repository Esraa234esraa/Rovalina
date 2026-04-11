import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/index.jsx';
import { useThemeStore } from './store';
import ScrollToTop from './components/scroll-to-top/ScrollToTop';
import './index.css';

export default function App() {
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div dir="rtl" className="min-h-screen bg-cream dark:bg-dark-bg">
      <RouterProvider router={router} />
    </div>
  );
}

