import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiShoppingCart,
  HiCube,
  HiClipboardList,
  HiCog,
  HiLogout,
  HiTag,
  HiTruck,
  HiExclamationCircle,
  HiChartBar,
  HiSwitchHorizontal,
  HiUsers,
  HiCollection,
} from 'react-icons/hi';
import { isAdmin } from '../../utils/auth';

const adminNav = [
  { path: '/', icon: HiHome, label: 'لوحة التحكم' },
  { path: '/categories', icon: HiTag, label: 'التصنيفات' },
  { path: '/suppliers', icon: HiTruck, label: 'الموردين' },
  { path: '/products', icon: HiCube, label: 'المنتجات' },
  { path: '/orders', icon: HiClipboardList, label: 'الطلبات' },
  { path: '/sales-report', icon: HiChartBar, label: 'تقرير المبيعات' },
  { path: '/users', icon: HiUsers, label: 'المستخدمين' },
  { path: '/inventory', icon: HiCollection, label: 'المخزون' },
  { path: '/settings', icon: HiCog, label: 'الإعدادات' },
];

const userNav = [
  { path: '/pos', icon: HiShoppingCart, label: 'نقطة البيع' },
  { path: '/my-transactions', icon: HiSwitchHorizontal, label: 'معاملاتي' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // proceed with local logout even if the request fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setLoggingOut(false);
      setShowLogoutDialog(false);
      navigate('/login');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-64 bg-primary-950 text-white
          flex flex-col transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-primary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <HiShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Havana House</h1>
              <p className="text-xs text-primary-300">نظام إدارة المبيعات</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {(isAdmin() ? adminNav : userNav).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-primary-200 hover:bg-primary-900 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-800">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-primary-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <HiLogout className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loggingOut && setShowLogoutDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-[slideUp_0.3s_ease-out] overflow-hidden">
            <div className="flex flex-col items-center pt-8 pb-2 px-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <HiExclamationCircle className="w-9 h-9 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">تسجيل الخروج</h3>
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                هل أنت متأكد من أنك تريد تسجيل الخروج من النظام؟
              </p>
            </div>
            <div className="flex gap-3 p-6">
              <button
                onClick={() => setShowLogoutDialog(false)}
                disabled={loggingOut}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الخروج...
                  </>
                ) : (
                  'نعم، تسجيل الخروج'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
