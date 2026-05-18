import { useState, useEffect, useCallback } from 'react';
import {
  HiCube,
  HiCurrencyDollar,
  HiTrendingUp,
  HiExclamation,
  HiExclamationCircle,
  HiRefresh,
  HiSearch,
  HiTag,
  HiShoppingBag,
  HiXCircle,
  HiCheckCircle,
  HiMinusCircle,
} from 'react-icons/hi';
import Badge from '../components/ui/Badge';

const API_BASE = 'http://localhost:5000/api/admin';

const statusConfig = {
  in_stock: { label: 'متوفر', color: 'green', icon: HiCheckCircle },
  low_stock: { label: 'مخزون منخفض', color: 'yellow', icon: HiMinusCircle },
  out_of_stock: { label: 'نفذ المخزون', color: 'red', icon: HiXCircle },
};

export default function Inventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchInventory = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/inventory`, { headers });
      if (!res.ok) throw new Error(`فشل في تحميل المخزون (${res.status})`);
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const summary = data?.summary || {};
  const products = data?.products || [];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-gray-200 rounded-2xl" />
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
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary-50">
            <HiCube className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">إدارة المخزون</h1>
            <p className="text-sm text-gray-400">تتبع المنتجات والمخزون المتاح</p>
          </div>
        </div>
        <button
          onClick={() => fetchInventory(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-primary-100 transition-all active:scale-95 disabled:opacity-50"
        >
          <HiRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-fadeIn">
          <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">فشل في تحميل المخزون</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchInventory()}
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
              title="إجمالي المنتجات"
              value={summary.totalProducts || 0}
              icon={HiCube}
              subtitle={`${summary.totalQuantity || 0} وحدة في المخزون`}
              color="primary"
            />
            <KPICard
              title="قيمة المخزون"
              value={`$${(summary.totalStockValue || 0).toFixed(2)}`}
              icon={HiCurrencyDollar}
              subtitle="بسعر الشراء"
              color="blue"
            />
            <KPICard
              title="قيمة البيع المتوقعة"
              value={`$${(summary.totalSaleValue || 0).toFixed(2)}`}
              icon={HiShoppingBag}
              subtitle="بسعر البيع"
              color="green"
            />
            <KPICard
              title="الربح المتوقع"
              value={`$${(summary.expectedProfit || 0).toFixed(2)}`}
              icon={HiTrendingUp}
              subtitle={summary.totalStockValue > 0
                ? `${((summary.expectedProfit / summary.totalStockValue) * 100).toFixed(1)}% هامش ربح`
                : 'لا توجد بيانات'}
              color="orange"
            />
          </div>

          {/* Stock Alerts */}
          {(summary.lowStockCount > 0 || summary.outOfStockCount > 0) && (
            <div className="flex flex-wrap gap-3 animate-fadeIn">
              {summary.outOfStockCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200">
                  <HiXCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">
                    {summary.outOfStockCount} منتج نفذ من المخزون
                  </span>
                </div>
              )}
              {summary.lowStockCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <HiExclamation className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">
                    {summary.lowStockCount} منتج مخزون منخفض
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn">
            <div className="relative flex-1">
              <HiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الباركود أو التصنيف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-shrink-0">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'in_stock', label: 'متوفر' },
                { value: 'low_stock', label: 'منخفض' },
                { value: 'out_of_stock', label: 'نفذ' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    filterStatus === f.value
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center gap-3 p-5 border-b border-gray-100">
              <div className="p-2.5 rounded-xl bg-primary-50">
                <HiCube className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">جرد المنتجات</h3>
                <p className="text-xs text-gray-400">
                  {filtered.length === products.length
                    ? `${products.length} منتج`
                    : `${filtered.length} من ${products.length} منتج`}
                </p>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-5 py-3 w-12">#</th>
                      <th className="px-5 py-3">المنتج</th>
                      <th className="px-5 py-3">الباركود</th>
                      <th className="px-5 py-3">التصنيف</th>
                      <th className="px-5 py-3">سعر الشراء</th>
                      <th className="px-5 py-3">سعر البيع</th>
                      <th className="px-5 py-3">الكمية</th>
                      <th className="px-5 py-3">قيمة المخزون</th>
                      <th className="px-5 py-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((product, idx) => {
                      const sc = statusConfig[product.status] || statusConfig.in_stock;
                      const profit = product.salePrice - product.purchasePrice;
                      const margin = product.purchasePrice > 0
                        ? ((profit / product.purchasePrice) * 100).toFixed(1)
                        : 0;
                      const quantityPercent = product.minQuantity > 0
                        ? Math.min((product.quantity / (product.minQuantity * 5)) * 100, 100)
                        : 100;

                      return (
                        <tr key={product.id} className="hover:bg-primary-50/30 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-sm font-bold text-gray-300">{idx + 1}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
                                <span className="text-sm font-bold text-white">{product.name.charAt(0)}</span>
                              </div>
                              <div>
                                <span className="text-sm font-bold text-gray-800 block">{product.name}</span>
                                <span className="text-xs text-gray-400">الحد الأدنى: {product.minQuantity}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                              {product.barcode}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                              <HiTag className="w-3 h-3" />
                              {product.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-gray-600">${product.purchasePrice.toFixed(2)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <span className="text-sm font-bold text-gray-800">${product.salePrice.toFixed(2)}</span>
                              <span className={`block text-xs font-semibold mt-0.5 ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {profit > 0 ? '+' : ''}{margin}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1.5">
                              <span className="text-sm font-bold text-gray-800">{product.quantity}</span>
                              <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                                    product.status === 'out_of_stock'
                                      ? 'bg-red-500'
                                      : product.status === 'low_stock'
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${quantityPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-bold text-blue-600">${product.stockValue.toFixed(2)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <sc.icon className={`w-4 h-4 ${
                                product.status === 'in_stock' ? 'text-emerald-500'
                                  : product.status === 'low_stock' ? 'text-amber-500'
                                    : 'text-red-500'
                              }`} />
                              <Badge color={sc.color}>{sc.label}</Badge>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50/80 border-t-2 border-gray-200">
                      <td colSpan="4" className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-700">الإجمالي</span>
                      </td>
                      <td className="px-5 py-4" />
                      <td className="px-5 py-4" />
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-gray-800">
                          {filtered.reduce((sum, p) => sum + p.quantity, 0)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-blue-600">
                          ${filtered.reduce((sum, p) => sum + p.stockValue, 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <HiCube className="w-12 h-12 mb-3" />
                <p className="text-base font-semibold text-gray-400">
                  {search || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد منتجات'}
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  {search || filterStatus !== 'all' ? 'جرب تعديل البحث أو الفلتر' : 'أضف منتجات لتظهر هنا'}
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
