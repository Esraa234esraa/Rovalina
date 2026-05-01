import { Suspense, createElement, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';
import LoadingState from '../components/ui/LoadingState';
import RouteError from '../components/ui/RouteError';

const withSuspense = (component) => (
  <Suspense fallback={<LoadingState text="جاري تحميل الصفحة..." className="py-24" />}>
    {createElement(component)}
  </Suspense>
);

const pageHome = lazy(() => import('../pages/HomePage'));
const pageShop = lazy(() => import('../pages/ShopPage'));
const pageBrands = lazy(() => import('../pages/BrandsPage'));
const pageBrandProducts = lazy(() => import('../pages/BrandProductsPage'));
const pageCategory = lazy(() => import('../pages/CategoryPage'));
const pageProductDetails = lazy(() => import('../pages/ProductDetailsPage'));
const pageOffers = lazy(() => import('../pages/OffersPage'));
const pageCart = lazy(() => import('../pages/CartPage'));
const pageWishlist = lazy(() => import('../pages/WishlistPage'));
const pageCheckout = lazy(() => import('../pages/CheckoutPage'));
const pageOrderSuccess = lazy(() => import('../pages/OrderSuccessPage'));
const pageContact = lazy(() => import('../pages/ContactPage'));
const pageAbout = lazy(() => import('../pages/AboutPage'));
const pageFaq = lazy(() => import('../pages/FAQPage'));
const pageLogin = lazy(() => import('../pages/LoginPage'));
const pageRegister = lazy(() => import('../pages/RegisterPage'));
const pageUserDashboard = lazy(() => import('../pages/UserDashboardPage'));
const pageNotFound = lazy(() => import('../pages/NotFoundPage'));

const pageAdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const pageAdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const pageAdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const pageAdminOffers = lazy(() => import('../pages/admin/AdminOffers'));
const pageAdminBrands = lazy(() => import('../pages/admin/AdminBrands'));
const pageAdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const pageAdminDurations = lazy(() => import('../pages/admin/AdminDurations'));
const pageAdminTestimonials = lazy(() => import('../pages/admin/AdminTestimonials'));
const pageAdminInstagramGallery = lazy(() => import('../pages/admin/AdminInstagramGallery'));
const pageAdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const pageAdminFaqs = lazy(() => import('../pages/admin/AdminFAQs'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: withSuspense(pageHome) },
      { path: '/shop', element: withSuspense(pageShop) },
      { path: '/brands', element: withSuspense(pageBrands) },
      { path: '/brands/:slug', element: withSuspense(pageBrandProducts) },
      { path: '/category/:slug', element: withSuspense(pageCategory) },
      { path: '/product/:id', element: withSuspense(pageProductDetails) },
      { path: '/offers', element: withSuspense(pageOffers) },
      { path: '/wishlist', element: withSuspense(pageWishlist) },
      { path: '/cart', element: withSuspense(pageCart) },
      { path: '/checkout', element: withSuspense(pageCheckout) },
      { path: '/order-success/:orderId', element: withSuspense(pageOrderSuccess) },
      { path: '/contact', element: withSuspense(pageContact) },
      { path: '/about', element: withSuspense(pageAbout) },
      { path: '/faq', element: withSuspense(pageFaq) },
      { path: '/login', element: withSuspense(pageLogin) },
      { path: '/register', element: withSuspense(pageRegister) },
      { path: '/user/dashboard', element: withSuspense(pageUserDashboard) },
      { path: '*', element: withSuspense(pageNotFound) },
    ],
  },
  {
    path: '/admin/login',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(pageAdminDashboard) },
      { path: 'products', element: withSuspense(pageAdminProducts) },
      { path: 'orders', element: withSuspense(pageAdminOrders) },
      { path: 'offers', element: withSuspense(pageAdminOffers) },
      { path: 'brands', element: withSuspense(pageAdminBrands) },
      { path: 'categories', element: withSuspense(pageAdminCategories) },
      { path: 'durations', element: withSuspense(pageAdminDurations) },
      { path: 'faqs', element: withSuspense(pageAdminFaqs) },
      { path: 'testimonials', element: withSuspense(pageAdminTestimonials) },
      { path: 'instagram-gallery', element: withSuspense(pageAdminInstagramGallery) },
      { path: 'settings', element: withSuspense(pageAdminSettings) },
    ],
  },
]);
