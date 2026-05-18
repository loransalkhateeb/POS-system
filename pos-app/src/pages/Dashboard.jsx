import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiCurrencyDollar,
  HiShoppingBag,
  HiCube,
  HiCalendar,
  HiRefresh,
  HiExclamationCircle,
  HiPlus,
} from 'react-icons/hi';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import TopProducts from '../components/dashboard/TopProducts';
import SupplierBreakdown from '../components/dashboard/SupplierBreakdown';
import PurchasesTable from '../components/dashboard/PurchasesTable';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';

const API_BASE = 'http://localhost:5000/api/admin';

const periods = [
  { value: 'daily', label: 'يومي' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'monthly', label: 'شهري' },
];

export default function Dashboard() {
  const navigate = useNavigate();
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

  const fetchReport = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/purchases/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ period, startDate, endDate }),
      });

      if (!res.ok) throw new Error(`فشل في تحميل التقرير (${res.status})`);

      const data = await res.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const summary = report?.summary || {};
  const avgPerPurchase = summary.totalPurchases > 0
    ? (summary.totalAmount / summary.totalPurchases).toFixed(2)
    : '0.00';

  const summaryData =
    period === 'daily' ? report?.dailySummary :
    period === 'weekly' ? report?.weeklySummary :
    report?.dailySummary;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* الفلاتر */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* تبويبات الفترة */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                  ${period === p.value
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 scale-[1.02]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* فلاتر التاريخ */}
          <div className="flex items-center gap-2 flex-1">
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
          </div>

          {/* الإجراءات */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchReport(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-primary-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              onClick={() => navigate('/purchases/create')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all active:scale-95"
            >
              <HiPlus className="w-4 h-4" />
              عملية شراء جديدة
            </button>
          </div>
        </div>
      </div>

      {/* خطأ */}
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

      {/* بطاقات الإحصائيات */}
      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي المشتريات"
              value={summary.totalPurchases || 0}
              icon={HiShoppingBag}
              subtitle={`تقرير ${period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري'}`}
              color="primary"
              delay={0}
            />
            <StatCard
              title="المبلغ الإجمالي"
              value={`$${(summary.totalAmount || 0).toFixed(2)}`}
              icon={HiCurrencyDollar}
              subtitle="إجمالي الإنفاق"
              color="blue"
              delay={100}
            />
            <StatCard
              title="إجمالي العناصر"
              value={summary.totalItems || 0}
              icon={HiCube}
              subtitle="العناصر المشتراة"
              color="green"
              delay={200}
            />
            <StatCard
              title="متوسط المشتريات"
              value={`$${avgPerPurchase}`}
              icon={HiCurrencyDollar}
              subtitle="متوسط قيمة الطلب"
              color="orange"
              delay={300}
            />
          </div>

          {/* معلومات الفترة */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fadeIn">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">الفترة:</span>
                <span className="font-bold text-primary-600">{report.period === 'daily' ? 'يومي' : report.period === 'weekly' ? 'أسبوعي' : 'شهري'}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-500">من:</span>
                <span className="font-semibold text-gray-700">{new Date(report.startDate).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-gray-500">إلى:</span>
                <span className="font-semibold text-gray-700">{new Date(report.endDate).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          </div>

          {/* الرسوم البيانية */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart data={summaryData || []} period={period} />
            </div>
            <SupplierBreakdown data={report.supplierBreakdown || {}} />
          </div>

          {/* تفاصيل المنتجات */}
          <TopProducts data={report.productBreakdown || {}} />

          {/* جدول المشتريات */}
          <PurchasesTable purchases={report.purchases || []} />
        </>
      )}
    </div>
  );
}
