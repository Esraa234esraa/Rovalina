import { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store';
import { shopApi } from '../services/shopApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginUser } = useUserStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'الاسم الأخير مطلوب';
    if (!formData.email.includes('@')) newErrors.email = 'بريد إلكتروني صحيح مطلوب';
    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    if (formData.password.length < 6) newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'كلمات المرور غير متطابقة';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await shopApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      const data = response?.data?.data;
      const user = data?.user;
      const token = data?.token;

      loginUser(
        {
          id: user?.id,
          name:
            user?.name ||
            `${user?.firstName || formData.firstName} ${user?.lastName || formData.lastName}`.trim(),
          email: user?.email || formData.email,
          role: user?.role || 'CUSTOMER',
        },
        token || null
      );

      setIsLoading(false);
      navigate('/');
    } catch (registerError) {
      setIsLoading(false);
      setErrors((prev) => ({
        ...prev,
        submit: registerError?.response?.data?.message || 'تعذر إنشاء الحساب حالياً.',
      }));
    }
  };

  return (
    <div className="container-fluid min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="font-arabic text-3xl font-bold text-primary-900 dark:text-white mb-2">إنشاء حساب جديد</h1>
            <p className="font-arabic text-gray-600 dark:text-gray-400">انضم إلى عائلة روڤالينا لينسز</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm font-arabic">
                {errors.submit}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">الاسم الأول</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white outline-none transition ${
                    errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                  } focus:ring-2 focus:border-transparent`}
                />
                {errors.firstName && <p className="font-arabic text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">الاسم الأخير</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white outline-none transition ${
                    errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                  } focus:ring-2 focus:border-transparent`}
                />
                {errors.lastName && <p className="font-arabic text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white outline-none transition ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } focus:ring-2 focus:border-transparent`}
              />
              {errors.email && <p className="font-arabic text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">رقم الهاتف</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white outline-none transition ${
                  errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                } focus:ring-2 focus:border-transparent`}
              />
              {errors.phone && <p className="font-arabic text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white outline-none transition pr-12 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    } focus:ring-2 focus:border-transparent`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="font-arabic text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block font-arabic text-gray-700 dark:text-gray-300 font-semibold mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-dark-secondary text-gray-900 dark:text-white outline-none transition pr-12 ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    } focus:ring-2 focus:border-transparent`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="font-arabic text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold font-arabic py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <UserPlus className="w-5 h-5" />
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <p className="font-arabic text-center text-gray-600 dark:text-gray-400 mt-6">
            هل لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold">
              سجل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
