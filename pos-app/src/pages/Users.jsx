import { useState, useEffect, useCallback } from 'react';
import {
  HiUsers,
  HiUser,
  HiMail,
  HiCalendar,
  HiRefresh,
  HiExclamationCircle,
  HiEye,
  HiCheckCircle,
  HiXCircle,
  HiDocumentText,
  HiClock,
  HiChevronDown,
  HiCurrencyDollar,
  HiShoppingBag,
  HiCube,
  HiSearch,
  HiX,
} from 'react-icons/hi';
import Badge from '../components/ui/Badge';

const API_BASE = 'http://localhost:5000/api/admin';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState('');
  const [expandedSale, setExpandedSale] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchUsers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/users/cashiers`, { headers });
      if (!res.ok) throw new Error(`فشل في تحميل المستخدمين (${res.status})`);
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchTransactions = async (user) => {
    setSelectedUser(user);
    setTxLoading(true);
    setTxError('');
    setTransactions(null);
    setExpandedSale(null);

    try {
      const res = await fetch(`${API_BASE}/users/sales`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error(`فشل في تحميل المعاملات (${res.status})`);
      setTransactions(await res.json());
    } catch (err) {
      setTxError(err.message);
    } finally {
      setTxLoading(false);
    }
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setTransactions(null);
    setTxError('');
    setExpandedSale(null);
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary-50">
            <HiUsers className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">إدارة المستخدمين</h1>
            <p className="text-sm text-gray-400">عرض جميع المستخدمين ومعاملاتهم</p>
          </div>
        </div>
        <button
          onClick={() => fetchUsers(true)}
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
            <p className="text-sm font-semibold text-red-700">فشل في تحميل المستخدمين</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchUsers()}
            className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="إجمالي المستخدمين"
          value={users.length}
          icon={HiUsers}
          subtitle="مستخدم مسجل"
          color="primary"
        />
        <KPICard
          title="المستخدمين النشطين"
          value={activeCount}
          icon={HiCheckCircle}
          subtitle="نشط حالياً"
          color="green"
        />
        <KPICard
          title="المستخدمين الغير نشطين"
          value={inactiveCount}
          icon={HiXCircle}
          subtitle="غير نشط"
          color="orange"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-11 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="p-2.5 rounded-xl bg-primary-50">
            <HiUsers className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">قائمة المستخدمين</h3>
            <p className="text-xs text-gray-400">
              {filtered.length === users.length
                ? `${users.length} مستخدم`
                : `${filtered.length} من ${users.length} مستخدم`}
            </p>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-5 py-3 w-12">#</th>
                  <th className="px-5 py-3">المستخدم</th>
                  <th className="px-5 py-3">البريد الإلكتروني</th>
                  <th className="px-5 py-3">الدور</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th className="px-5 py-3">تاريخ الإنشاء</th>
                  <th className="px-5 py-3 text-center">المعاملات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-300">{idx + 1}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <HiMail className="w-3.5 h-3.5 text-gray-400" />
                        {user.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={user.role?.name === 'admin' ? 'yellow' : 'purple'}>
                        {user.role?.name === 'admin' ? 'مسؤول' : 'مستخدم'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className={`text-xs font-semibold ${user.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {user.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <HiCalendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => fetchTransactions(user)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 hover:shadow-md hover:shadow-primary-500/10 transition-all duration-200 active:scale-95"
                      >
                        <HiEye className="w-4 h-4" />
                        عرض المعاملات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <HiUsers className="w-12 h-12 mb-3" />
            <p className="text-base font-semibold text-gray-400">
              {search ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {search ? 'جرب تعديل كلمة البحث' : 'لم يتم تسجيل أي مستخدم بعد'}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDialog} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-[slideUp_0.3s_ease-out]">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-md">
                  <span className="text-lg font-bold text-white">{selectedUser.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">معاملات {selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <HiMail className="w-3 h-3" />
                      {selectedUser.email}
                    </span>
                    <Badge color={selectedUser.isActive ? 'green' : 'gray'}>
                      {selectedUser.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={closeDialog}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <HiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {txLoading && (
                <div className="space-y-4 animate-pulse">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
                  </div>
                  <div className="h-64 bg-gray-200 rounded-2xl" />
                </div>
              )}

              {txError && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
                  <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700">فشل في تحميل المعاملات</p>
                    <p className="text-xs text-red-500 mt-0.5">{txError}</p>
                  </div>
                  <button
                    onClick={() => fetchTransactions(selectedUser)}
                    className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}

              {transactions && !txLoading && (
                <div className="space-y-5">
                  {/* Transaction KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <MiniKPI
                      title="إجمالي المبيعات"
                      value={transactions.summary?.totalSales || 0}
                      icon={HiShoppingBag}
                      color="primary"
                    />
                    <MiniKPI
                      title="إجمالي الإيرادات"
                      value={`$${(transactions.summary?.totalRevenue || 0).toFixed(2)}`}
                      icon={HiCurrencyDollar}
                      color="blue"
                    />
                    <MiniKPI
                      title="العناصر المباعة"
                      value={transactions.summary?.totalItemsSold || 0}
                      icon={HiCube}
                      color="green"
                    />
                  </div>

                  {/* Transactions List */}
                  {transactions.sales?.length > 0 ? (
                    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <div className="p-2 rounded-lg bg-primary-50">
                          <HiDocumentText className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">سجل المعاملات</h4>
                          <p className="text-xs text-gray-400">{transactions.sales.length} عملية بيع</p>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {transactions.sales.map((sale, idx) => (
                          <div key={sale.id}>
                            <button
                              onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                              className="w-full text-right hover:bg-white/80 transition-colors"
                            >
                              <div className="flex items-center gap-3 px-4 py-3">
                                <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm flex-shrink-0">
                                  <HiDocumentText className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-gray-800">{sale.invoiceNumber}</span>
                                    <Badge color="purple">{sale.itemsCount} منتج</Badge>
                                    <Badge color="blue">{sale.totalQuantity} عنصر</Badge>
                                  </div>
                                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
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
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-base font-bold text-emerald-600">${sale.totalAmount.toFixed(2)}</span>
                                  <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                    expandedSale === sale.id ? 'rotate-180' : ''
                                  }`} />
                                </div>
                              </div>
                            </button>

                            {expandedSale === sale.id && (
                              <div className="bg-white border-t border-gray-100 px-4 py-3 animate-fadeIn">
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="px-3 py-2 w-8">#</th>
                                        <th className="px-3 py-2">المنتج</th>
                                        <th className="px-3 py-2">الباركود</th>
                                        <th className="px-3 py-2">الكمية</th>
                                        <th className="px-3 py-2">سعر الوحدة</th>
                                        <th className="px-3 py-2">الإجمالي</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {sale.items.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                          <td className="px-3 py-2.5">
                                            <span className="text-xs font-bold text-gray-300">{i + 1}</span>
                                          </td>
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
                                            <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
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
                                        <td colSpan="3" className="px-3 py-2.5">
                                          <span className="text-xs text-gray-400">
                                            {sale.items.length} منتج &middot; {sale.totalQuantity} عنصر
                                          </span>
                                        </td>
                                        <td colSpan="2" className="px-3 py-2.5 text-left">
                                          <span className="text-sm font-bold text-gray-700">الإجمالي</span>
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
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                      <HiDocumentText className="w-10 h-10 mb-2" />
                      <p className="text-sm font-semibold text-gray-400">لا توجد معاملات</p>
                      <p className="text-xs text-gray-300 mt-1">لم يقم هذا المستخدم بأي عمليات بيع بعد</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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

function MiniKPI({ title, value, icon: Icon, color = 'primary' }) {
  const colorClasses = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  };
  const c = colorClasses[color];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${c.bg} ${c.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{title}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
