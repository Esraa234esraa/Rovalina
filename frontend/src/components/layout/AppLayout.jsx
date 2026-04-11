import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../scroll-to-top/ScrollToTop';
import { useThemeStore } from '../../store';

export default function AppLayout() {
  const { isDark } = useThemeStore();

  return (
    <div className={isDark ? 'dark' : ''}>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-cream dark:bg-dark-bg">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

