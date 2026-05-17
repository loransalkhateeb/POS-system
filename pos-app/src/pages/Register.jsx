import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  HiUser,
  HiMail,
  HiLockClosed,
  HiShoppingCart,
  HiEye,
  HiEyeOff,
  HiShieldCheck,
  HiUserAdd,
  HiCheckCircle,
} from 'react-icons/hi';

const ROLE_CONFIG = {
  admin: {
    roleId: 'cmp9q9ret0000domme6y8wpey',
    title: 'إنشاء حساب مسؤول',
    subtitle: 'تسجيل مسؤول جديد بصلاحيات كاملة',
    badge: 'مسؤول',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: HiShieldCheck,
    iconBg: 'bg-amber-500',
  },
  user: {
    roleId: 'cmp9q9rft0001domm7g6w4sjg',
    title: 'إنشاء حساب مستخدم',
    subtitle: 'تسجيل حساب مستخدم عادي جديد',
    badge: 'مستخدم',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: HiUserAdd,
    iconBg: 'bg-primary-500',
  },
};

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (form.password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          roleId: config.roleId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'فشل إنشاء الحساب');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-5">
            <HiCheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إنشاء الحساب!</h2>
          <p className="text-gray-500 mb-6">
            تم إنشاء حساب {config.badge} بنجاح.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98]"
            >
              الذهاب لتسجيل الدخول
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              إنشاء حساب آخر
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${config.iconBg} rounded-2xl shadow-xl shadow-primary-500/30 mb-4`}>
            <config.icon className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">{config.title}</h1>
          </div>
          <p className="text-primary-300">{config.subtitle}</p>
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeColor}`}>
            الدور: {config.badge}
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
            <Link
              to="/register/admin"
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <HiShieldCheck className="w-4 h-4" />
                مسؤول
              </div>
            </Link>
            <Link
              to="/register/user"
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${
                role === 'user'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <HiUserAdd className="w-4 h-4" />
                مستخدم
              </div>
            </Link>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">الاسم الكامل</label>
              <div className="relative">
                <HiUser className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="أدخل الاسم الكامل"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">البريد الإلكتروني</label>
              <div className="relative">
                <HiMail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">كلمة المرور</label>
              <div className="relative">
                <HiLockClosed className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="6 أحرف على الأقل"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full pr-12 pl-12 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">تأكيد كلمة المرور</label>
              <div className="relative">
                <HiLockClosed className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="أعد إدخال كلمة المرور"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>إنشاء حساب {config.badge}</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
