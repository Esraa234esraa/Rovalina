import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Heart, User, Menu, X, Moon, Sun, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore, useThemeStore, useUserStore } from '../../store';
import { BRAND } from '../../lib/constants';
import { useCartCount } from '../../hooks/useUserCart';
import { useWishlistCount } from '../../hooks/useUserWishlist';
import { useToast } from '../../hooks/useToast';
import logo from '../../assets/logo.svg';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const { isDark, toggleDarkMode } = useThemeStore();
  const { isLoggedIn, user, logoutUser } = useUserStore();
  const { isAuthenticated, adminEmail, logout } = useAuthStore();
  const { count: cartCount } = useCartCount();
  const { count: wishlistCount } = useWishlistCount();
  const toast = useToast();

  const isAdminLoggedIn = isAuthenticated;
  const isUserLoggedIn = isLoggedIn && !isAdminLoggedIn;
  const isAnyLoggedIn = isAdminLoggedIn || isUserLoggedIn;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) {
      navigate(`/shop?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/shop');
    }
    setIsMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
  };

  const goToDashboard = () => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard');
    } else if (isUserLoggedIn) {
      navigate('/user/dashboard');
    } else {
      navigate('/login');
    }
    setIsAccountMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    logout();
    toast.success('تم تسجيل الخروج بنجاح.');
    setIsAccountMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const setHeaderHeightVar = () => {
      const nextHeight = headerRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty('--user-header-height', `${nextHeight}px`);
    };

    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);

    return () => {
      window.removeEventListener('resize', setHeaderHeightVar);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background-100 dark:bg-dark-card border-b border-surface-300 dark:border-primary-900/40 shadow-soft"
    >
      <div className="container-fluid">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src={logo}
              alt="Rovalina Lenses"
              className="h-12 w-auto object-contain group-hover:opacity-75 transition-opacity duration-200"
            />
            <span className="font-arabic font-bold text-lg text-primary-600 dark:text-primary-400 hidden sm:inline">
              {BRAND.name}
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8">
            <div className="w-full relative">
              <input
                type="search"
                placeholder="ابحثي عن عدسات..."
                className="input pr-4 pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-200 dark:hover:bg-dark-surface">
                <Search className="w-5 h-5 text-ink-400 dark:text-secondary-300" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-ink-600" />
              )}
            </button>

            <Link to="/wishlist" className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition relative">
              <Heart className="w-5 h-5 text-ink-600 dark:text-secondary-300" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-primary-500 text-ink-900 text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition relative">
              <ShoppingCart className="w-5 h-5 text-ink-600 dark:text-secondary-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-primary-500 text-ink-900 text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg transition flex items-center gap-1"
              >
                <User className="w-5 h-5 text-ink-600 dark:text-secondary-300" />
                <ChevronDown className="w-4 h-4 text-ink-500 dark:text-secondary-300" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-surface-50 dark:bg-dark-card border border-surface-300 dark:border-primary-900/40 rounded-xl shadow-soft-md p-2 z-50">
                  {isAnyLoggedIn ? (
                    <>
                      <div className="px-3 py-2 border-b border-surface-300 dark:border-primary-900/40 mb-1">
                        <p className="text-sm font-semibold text-ink-800 dark:text-secondary-100">
                          {user?.name || user?.email || adminEmail || 'حسابي'}
                        </p>
                        <p className="text-xs text-ink-500 dark:text-secondary-300">{user?.email || adminEmail}</p>
                      </div>
                      <button onClick={goToDashboard} className="w-full text-right px-3 py-2 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-surface text-sm text-ink-700 dark:text-secondary-200 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {isAdminLoggedIn ? 'لوحة تحكم الأدمن' : 'لوحة المستخدم'}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-sm text-red-700 dark:text-red-300"
                      >
                        تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-3 py-2 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-surface text-sm text-ink-700 dark:text-secondary-200" onClick={() => setIsAccountMenuOpen(false)}>
                        تسجيل الدخول
                      </Link>
                      <Link to="/register" className="block px-3 py-2 rounded-lg hover:bg-surface-200 dark:hover:bg-dark-surface text-sm text-ink-700 dark:text-secondary-200" onClick={() => setIsAccountMenuOpen(false)}>
                        إنشاء حساب
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-surface-200 dark:hover:bg-dark-surface rounded-lg"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <input
              type="search"
              placeholder="ابحثي..."
              className="input pr-4 pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-200 dark:hover:bg-dark-surface">
              <Search className="w-5 h-5 text-ink-400 dark:text-secondary-300" />
            </button>
          </div>
        </form>

        <nav
          className={`border-t border-surface-300 dark:border-primary-900/40 overflow-hidden transition-all duration-300 ease-in-out md:overflow-visible ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
          }`}
        >
          <ul className="flex flex-col md:flex-row gap-6 md:gap-8 py-4">
            <li><Link to="/" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">الرئيسية</Link></li>
            <li><Link to="/shop" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">تسوقي</Link></li>
            <li><Link to="/brands" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">العلامات التجارية</Link></li>
            <li><Link to="/offers" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">العروض</Link></li>
            <li><Link to="/about" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">عننا</Link></li>
            <li><Link to="/contact" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">تواصلي معنا</Link></li>
            <li><Link to="/faq" onClick={handleNavLinkClick} className="font-arabic text-sm hover:text-primary-600 dark:hover:text-primary-400">الأسئلة الشائعة</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
