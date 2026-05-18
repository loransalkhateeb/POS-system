import { useState, useEffect, useCallback } from 'react';
import {
  HiCurrencyDollar,
  HiShoppingBag,
  HiCube,
  HiRefresh,
  HiExclamationCircle,
  HiDocumentText,
  HiClock,
  HiChevronDown,
  HiUser,
  HiMail,
  HiShieldCheck,
  HiTrendingUp,
  HiSearch,
} from 'react-icons/hi';
import Badge from '../components/ui/Badge';
import { isAdmin } from '../utils/auth';

const API_BASE = `http://localhost:5000/api/${isAdmin() ? 'admin' : 'user'}`;

export default function MyTransactions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchTransactions = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/sales/my-transactions`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error(`فشل في تحميل المعاملات (${res.status})`);
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const user = data?.user;
  const summary = data?.summary || {};
  const sales = data?.sales || [];

  const avgPerSale = summary.totalSales > 0
    ? (summary.totalRevenue / summary.totalSales).toFixed(2)
    : '0.00';

  const filtered = sales.filter((s) =>
    s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.items.some((item) => item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.product.barcode || '').includes(search))
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Card */}
      {user && (
        <div className="bg-gradient-to-l from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/20 p-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <HiUser className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-primary-100 text-sm flex items-center gap-1">
                    <HiMail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <HiShieldCheck className="w-3 h-3" />
                    {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => fetchTransactions(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95 disabled:opacity-50"
            >
              <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-fadeIn">
          <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">فشل في تحميل المعاملات</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchTransactions()}
            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard
              title="إجمالي المبيعات"
              value={summary.totalSales || 0}
              icon={HiShoppingBag}
              subtitle="عملية بيع"
              color="primary"
            />
            <KPICard
              title="إجمالي الإيرادات"
              value={`$${(summary.totalRevenue || 0).toFixed(2)}`}
              icon={HiCurrencyDollar}
              subtitle="إيرادات محققة"
              color="blue"
            />
            <KPICard
              title="العناصر المباعة"
              value={summary.totalItemsSold || 0}
              icon={HiCube}
              subtitle="إجمالي الوحدات"
              color="green"
            />
            <KPICard
              title="متوسط قيمة البيع"
              value={`$${avgPerSale}`}
              icon={HiTrendingUp}
              subtitle="لكل عملية بيع"
              color="orange"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث برقم الفاتورة أو اسم المنتج أو الباركود..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
            />
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-50">
                  <HiDocumentText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">سجل المعاملات</h3>
                  <p className="text-xs text-gray-400">
                    {filtered.length === sales.length
                      ? `${sales.length} عملية بيع`
                      : `${filtered.length} من ${sales.length} عملية بيع`}
                  </p>
                </div>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {filtered.map((sale, idx) => (
                  <div key={sale.id}>
                    <button
                      onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                      className="w-full text-right hover:bg-primary-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Number */}
                        <span className="text-sm font-bold text-gray-300 w-6 text-center flex-shrink-0">
                          {idx + 1}
                        </span>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm flex-shrink-0">
                          <HiDocumentText className="w-5 h-5 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-800">{sale.invoiceNumber}</span>
                            <Badge color="purple">{sale.itemsCount} منتج</Badge>
                            <Badge color="blue">{sale.totalQuantity} عنصر</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <HiClock className="w-3 h-3" />
                              {new Date(sale.saleDate).toLocaleDateString('ar-EG', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                              {' '}
                              {new Date(sale.saleDate).toLocaleTimeString('ar-EG', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                            <span className="hidden sm:flex items-center gap-1 text-xs text-gray-300">
                              {sale.items.map((item) => item.product.name).join('، ')}
                            </span>
                          </div>
                        </div>

                        {/* Amount + Arrow */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-lg font-bold text-emerald-600">${sale.totalAmount.toFixed(2)}</span>
                          <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            expandedSale === sale.id ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {expandedSale === sale.id && (
                      <div className="bg-gray-50/60 border-t border-gray-100 animate-fadeIn">
                        {/* Items Table */}
                        <div className="px-5 py-4">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                  <th className="px-3 py-2 w-10">#</th>
                                  <th className="px-3 py-2">المنتج</th>
                                  <th className="px-3 py-2">الباركود</th>
                                  <th className="px-3 py-2">الكمية</th>
                                  <th className="px-3 py-2">سعر الوحدة</th>
                                  <th className="px-3 py-2">الإجمالي</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {sale.items.map((item, i) => (
                                  <tr key={i} className="hover:bg-white/60 transition-colors">
                                    <td className="px-3 py-2.5">
                                      <span className="text-xs font-bold text-gray-300">{i + 1}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                                          <span className="text-[10px] font-bold text-white">
                                            {item.product.name.charAt(0)}
                                          </span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{item.product.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span className="text-xs text-gray-400 font-mono bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                        {item.product.barcode || '—'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span className="text-sm font-bold text-gray-700">{item.quantity}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span className="text-sm text-gray-600">${item.unitPrice.toFixed(2)}</span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span className="text-sm font-bold text-emerald-600">${item.totalPrice.toFixed(2)}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-gray-200 bg-white/50">
                                  <td colSpan="3" className="px-3 py-3">
                                    <span className="text-xs text-gray-400">
                                      {sale.items.length} منتج &middot; {sale.totalQuantity} عنصر
                                    </span>
                                  </td>
                                  <td colSpan="2" className="px-3 py-3 text-left">
                                    <span className="text-sm font-bold text-gray-700">الإجمالي</span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className="text-base font-bold text-primary-600">${sale.totalAmount.toFixed(2)}</span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <HiDocumentText className="w-12 h-12 mb-3" />
                <p className="text-base font-semibold text-gray-400">
                  {search ? 'لا توجد نتائج للبحث' : 'لا توجد معاملات'}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  {search ? 'جرب تعديل كلمة البحث' : 'ستظهر معاملاتك هنا بعد إنشائها'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ title, value, icon: Icon, subtitle, color = 'primary' }) {
  const colorClasses = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600', glow: 'shadow-primary-500/10' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', glow: 'shadow-emerald-500/10' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', glow: 'shadow-blue-500/10' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', glow: 'shadow-orange-500/10' },
  };
  const c = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 font-medium mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} ${c.text} shadow-lg ${c.glow}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
