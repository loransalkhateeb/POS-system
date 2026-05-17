import { NavLink } from 'react-router-dom';
import {
  HiHome,
  HiShoppingCart,
  HiCube,
  HiClipboardList,
  HiCog,
  HiLogout,
  HiTag,
  HiTruck,
} from 'react-icons/hi';

const navItems = [
  { path: '/', icon: HiHome, label: 'لوحة التحكم' },
  { path: '/pos', icon: HiShoppingCart, label: 'نقطة البيع' },
  { path: '/categories', icon: HiTag, label: 'التصنيفات' },
  { path: '/suppliers', icon: HiTruck, label: 'الموردين' },
  { path: '/products', icon: HiCube, label: 'المنتجات' },
  { path: '/orders', icon: HiClipboardList, label: 'الطلبات' },
  { path: '/settings', icon: HiCog, label: 'الإعدادات' },
];

export default function Sidebar({ isOpen, onClose }) {
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
          {navItems.map((item) => (
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
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-primary-300 hover:bg-primary-900 hover:text-white transition-all duration-200">
            <HiLogout className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
