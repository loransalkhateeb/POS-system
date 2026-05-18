import { useState, useEffect, useCallback } from 'react';
import {
  HiCurrencyDollar,
  HiShoppingBag,
  HiCube,
  HiCalendar,
  HiRefresh,
  HiExclamationCircle,
  HiChevronDown,
  HiDocumentText,
  HiUser,
  HiClock,
  HiTrendingUp,
} from 'react-icons/hi';
import { isAdmin } from '../utils/auth';

const API_BASE = `http://localhost:5000/api/${isAdmin() ? 'admin' : 'user'}`;

const periods = [
  { value: 'daily', label: 'يومي' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'monthly', label: 'شهري' },
];

const dayNames = {
  Sunday: 'الأحد',
  Monday: 'الاثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
};

export default function SalesReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchReport = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/sales/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ period, startDate, endDate }),
      });

      if (!res.ok) throw new Error(`فشل في تحميل التقرير (${res.status})`);
      setReport(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const summary = report?.summary || {};
  const avgPerSale = summary.totalSales > 0
    ? (summary.totalRevenue / summary.totalSales).toFixed(2)
    : '0.00';

  const productEntries = Object.entries(report?.productBreakdown || {});
  const topProduct = productEntries.length > 0
    ? productEntries.sort((a, b) => b[1].quantitySold - a[1].quantitySold)[0]
    : null;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  period === p.value
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-1">
            <HiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            <span className="text-xs text-gray-400 font-medium">إلى</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <button
            onClick={() => fetchReport(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-primary-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-fadeIn">
          <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">فشل في تحميل التقرير</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchReport()}
            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {report && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard
              title="إجمالي المبيعات"
              value={summary.totalSales || 0}
              icon={HiShoppingBag}
              subtitle={`تقرير ${period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري'}`}
              color="primary"
            />
            <KPICard
              title="إجمالي الإيرادات"
              value={`$${(summary.totalRevenue || 0).toFixed(2)}`}
              icon={HiCurrencyDollar}
              subtitle="إيرادات المبيعات"
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

          {/* Period Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">الفترة:</span>
                <span className="font-bold text-primary-600">
                  {report.period === 'daily' ? 'يومي' : report.period === 'weekly' ? 'أسبوعي' : report.period === 'monthly' ? 'شهري' : 'مخصص'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-500">من:</span>
                <span className="font-semibold text-gray-700">
                  {new Date(report.startDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-500">إلى:</span>
                <span className="font-semibold text-gray-700">
                  {new Date(report.endDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Daily / Weekly Summary + Product Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Summary */}
            {report.dailySummary?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                  <div className="p-2.5 rounded-xl bg-blue-50">
                    <HiCalendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">الملخص اليومي</h3>
                    <p className="text-xs text-gray-400">{report.dailySummary.length} يوم</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3">التاريخ</th>
                        <th className="px-5 py-3">اليوم</th>
                        <th className="px-5 py-3">المبيعات</th>
                        <th className="px-5 py-3">العناصر</th>
                        <th className="px-5 py-3">الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.dailySummary.map((day) => (
                        <tr key={day.date} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-5 py-3">
                            <span className="text-sm font-semibold text-gray-700">
                              {new Date(day.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm text-gray-500">{dayNames[day.day] || day.day}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                              {day.totalSales}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-semibold text-gray-700">{day.totalItems}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold text-emerald-600">${day.totalRevenue.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Weekly Summary */}
            {report.weeklySummary?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                  <div className="p-2.5 rounded-xl bg-purple-50">
                    <HiCalendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800">الملخص الأسبوعي</h3>
                    <p className="text-xs text-gray-400">{report.weeklySummary.length} أسبوع</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3">الأسبوع</th>
                        <th className="px-5 py-3">الفترة</th>
                        <th className="px-5 py-3">المبيعات</th>
                        <th className="px-5 py-3">العناصر</th>
                        <th className="px-5 py-3">الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.weeklySummary.map((week) => (
                        <tr key={week.week} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold text-gray-700">الأسبوع {week.week}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs text-gray-400">
                              {new Date(week.startDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                              {' — '}
                              {new Date(week.endDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                              {week.totalSales}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-semibold text-gray-700">{week.totalItems}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold text-emerald-600">${week.totalRevenue.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Product Breakdown */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn ${
              report.weeklySummary?.length > 0 ? '' : report.dailySummary?.length > 0 ? '' : 'lg:col-span-2'
            }`}>
              <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                <div className="p-2.5 rounded-xl bg-emerald-50">
                  <HiCube className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">تفاصيل المنتجات المباعة</h3>
                  <p className="text-xs text-gray-400">{productEntries.length} منتج</p>
                </div>
              </div>
              {productEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-3 w-12">#</th>
                        <th className="px-5 py-3">المنتج</th>
                        <th className="px-5 py-3">الباركود</th>
                        <th className="px-5 py-3">الكمية المباعة</th>
                        <th className="px-5 py-3">الإيرادات</th>
                        <th className="px-5 py-3">النسبة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {productEntries
                        .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
                        .map(([name, data], idx) => {
                          const revenuePercent = summary.totalRevenue > 0
                            ? ((data.totalRevenue / summary.totalRevenue) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={name} className="hover:bg-primary-50/30 transition-colors">
                              <td className="px-5 py-3.5">
                                <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
                                    <span className="text-xs font-bold text-white">{name.charAt(0)}</span>
                                  </div>
                                  <span className="text-sm font-bold text-gray-800">{name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">
                                  {data.barcode || '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-sm font-bold text-gray-700">{data.quantitySold}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-sm font-bold text-emerald-600">${data.totalRevenue.toFixed(2)}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-1.5 rounded-full bg-gradient-to-l from-primary-500 to-primary-400 transition-all duration-1000"
                                      style={{ width: `${revenuePercent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-500">{revenuePercent}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                  <HiCube className="w-10 h-10 mb-2" />
                  <p className="text-sm font-medium text-gray-400">لا توجد بيانات منتجات</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center gap-3 p-5 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-primary-50">
                <HiDocumentText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">سجل المبيعات</h3>
                <p className="text-xs text-gray-400">{report.sales?.length || 0} عملية بيع</p>
              </div>
            </div>

            {report.sales?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {report.sales.map((sale) => (
                  <div key={sale.id}>
                    {/* Sale Row */}
                    <button
                      onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                      className="w-full text-right hover:bg-primary-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm flex-shrink-0">
                          <HiDocumentText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-800">{sale.invoiceNumber}</span>
                            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                              {sale.itemsCount} منتج
                            </span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {sale.totalQuantity} عنصر
                            </span>
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
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-emerald-600">${sale.totalAmount.toFixed(2)}</span>
                          <HiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            expandedSale === sale.id ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded Items */}
                    {expandedSale === sale.id && (
                      <div className="bg-gray-50/60 border-t border-gray-100 px-5 py-4 animate-fadeIn">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="px-3 py-2">المنتج</th>
                                <th className="px-3 py-2">الباركود</th>
                                <th className="px-3 py-2">الكمية</th>
                                <th className="px-3 py-2">سعر الوحدة</th>
                                <th className="px-3 py-2">الإجمالي</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {sale.items.map((item, i) => (
                                <tr key={i}>
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-primary-600">
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
                              <tr className="border-t-2 border-gray-200">
                                <td colSpan="4" className="px-3 py-2.5 text-sm font-bold text-gray-700 text-left">
                                  الإجمالي
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="text-sm font-bold text-primary-600">${sale.totalAmount.toFixed(2)}</span>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <HiDocumentText className="w-12 h-12 mb-3" />
                <p className="text-base font-semibold text-gray-400">لا توجد مبيعات</p>
                <p className="text-sm text-gray-300 mt-1">لم يتم تسجيل أي مبيعات في هذه الفترة</p>
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
