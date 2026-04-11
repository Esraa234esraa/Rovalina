import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useUserStore } from '../store';
import { shopApi } from '../services/shopApi';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, logoutUser } = useUserStore();
  const { login: loginAdmin, logout: logoutAdmin } = useAuthStore();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    if (!email.includes('@')) {
      setError('الرجاء إدخال بريد إلكتروني صحيح');
      return;
    }

    setIsLoading(true);

    try {
      const response = await shopApi.login({ email, password });
      const data = response?.data?.data;
      const user = data?.user;
      const token = data?.token;
      const normalizedRole = String(user?.role || 'CUSTOMER').toUpperCase();

      const userPayload = {
        id: user?.id,
        name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || email.split('@')[0],
        email: user?.email || email,
        role: normalizedRole,
      };

      if (['ADMIN', 'SUPER_ADMIN'].includes(normalizedRole)) {
        logoutUser();
        loginAdmin(userPayload, token || null);
        setIsLoading(false);
        toast.success('تم تسجيل دخول الأدمن بنجاح.');
        navigate('/admin/dashboard');
        return;
      }

      logoutAdmin();
      loginUser(userPayload, token || null);

      setIsLoading(false);
      toast.success('تم تسجيل الدخول بنجاح.');
      navigate('/');
    } catch (loginError) {
      setIsLoading(false);
      const message = loginError?.response?.data?.message || 'تعذر تسجيل الدخول حالياً.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="container-fluid min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="font-arabic text-3xl font-bold text-primary-900 dark:text-white mb-2">
              دخول الحساب
            </h1>
            <p className="font-arabic text-gray-600 dark:text-gray-400">
              سجل دخولك لمنصة Rovalina | روڤالينا             </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="font-arabic text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div>
              <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition pr-12"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold font-arabic py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'جاري المعالجة...' : 'دخول'}
            </button>
          </form>

          <p className="font-arabic text-center text-gray-600 dark:text-gray-400 mt-6">
            ليس لديك حساب؟{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
            >
              أنشئ حسابًا جديدًا
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="font-arabic text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
