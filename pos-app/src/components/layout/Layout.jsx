import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { HiExclamation, HiX, HiArrowLeft } from 'react-icons/hi';
import Sidebar from './Sidebar';
import Header from './Header';
import { isAdmin } from '../../utils/auth';

const pageTitles = {
  '/': 'لوحة التحكم',
  '/pos': 'نقطة البيع',
  '/categories': 'التصنيفات',
  '/suppliers': 'الموردين',
  '/products': 'المنتجات',
  '/orders': 'الطلبات',
  '/sales-report': 'تقرير المبيعات',
  '/my-transactions': 'معاملاتي',
  '/purchases/create': 'إنشاء عملية شراء',
  '/users': 'المستخدمين',
  '/inventory': 'المخزون',
  '/settings': 'الإعدادات',
};

const adminOnlyPaths = ['/', '/categories', '/suppliers', '/products', '/orders', '/sales-report', '/purchases/create', '/users', '/inventory', '/settings'];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStock, setLowStock] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Havana House';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!isAdmin() && adminOnlyPaths.includes(location.pathname)) {
      navigate('/pos');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!isAdmin()) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:5000/api/admin/inventory/low-stock', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setLowStock(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [location.pathname]);

  const showAlert = isAdmin() && lowStock.length > 0 && !alertDismissed;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />

        {showAlert && (
          <div className="bg-gradient-to-l from-amber-500 to-amber-600 px-4 py-2.5 flex items-center gap-3 shadow-md animate-fadeIn">
            <div className="p-1.5 bg-white/20 rounded-lg flex-shrink-0">
              <HiExclamation className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white">
                تنبيه المخزون: {lowStock.length} منتج{lowStock.length > 1 ? 'ات' : ''} بمخزون منخفض
              </span>
              <span className="text-xs text-amber-100 mr-2 hidden sm:inline">
                — {lowStock.slice(0, 3).map((p) => p.name).join('، ')}
                {lowStock.length > 3 && ` و${lowStock.length - 3} آخرين`}
              </span>
            </div>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all flex-shrink-0"
            >
              عرض المخزون
              <HiArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setAlertDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-all flex-shrink-0"
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
