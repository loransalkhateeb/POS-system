import { useNavigate } from 'react-router-dom';
import { HiMenuAlt2, HiBell, HiUser, HiShieldCheck, HiUserAdd } from 'react-icons/hi';

export default function Header({ onToggleSidebar, title }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 lg:hidden transition-colors"
          >
            <HiMenuAlt2 className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/register/admin')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all duration-200 active:scale-95"
          >
            <HiShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">إنشاء</span> مسؤول
          </button>
          <button
            onClick={() => navigate('/register/user')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 transition-all duration-200 active:scale-95"
          >
            <HiUserAdd className="w-4 h-4" />
            <span className="hidden sm:inline">إنشاء</span> مستخدم
          </button>

          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1" />

          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            <HiBell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 mr-1 pr-2 border-r border-gray-200">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <HiUser className="w-4 h-4 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800">المسؤول</p>
              <p className="text-xs text-gray-400">مدير</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
