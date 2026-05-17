import { HiMenuAlt2, HiBell, HiUser } from 'react-icons/hi';

export default function Header({ onToggleSidebar, title }) {
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
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            <HiBell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
              <HiUser className="w-4 h-4 text-primary-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">Admin</p>
              <p className="text-xs text-gray-400">Manager</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
