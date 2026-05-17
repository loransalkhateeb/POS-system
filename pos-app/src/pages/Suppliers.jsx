import { useState, useEffect, useCallback } from 'react';
import {
  HiTruck,
  HiPlus,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiExclamationCircle,
  HiSearch,
  HiPhone,
  HiLocationMarker,
  HiShoppingBag,
} from 'react-icons/hi';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const API_BASE = 'http://localhost:5000/api/admin';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/suppliers`, { headers });
      if (!res.ok) throw new Error(`فشل في تحميل الموردين (${res.status})`);
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const url = editing
        ? `${API_BASE}/suppliers/${editing.id}`
        : `${API_BASE}/suppliers`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('فشل في حفظ المورد');

      closeForm();
      fetchSuppliers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget.id);
    try {
      const res = await fetch(`${API_BASE}/suppliers/${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('فشل في حذف المورد');
      setDeleteTarget(null);
      fetchSuppliers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setForm({ name: supplier.name, phone: supplier.phone || '', address: supplier.address || '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', phone: '', address: '' });
  };

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search) ||
    (s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = suppliers.reduce((sum, s) => sum + (s._count?.purchases || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">إجمالي الموردين</p>
              <p className="text-3xl font-bold text-gray-800">{suppliers.length}</p>
              <p className="text-xs text-gray-400">مورد مسجل</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 shadow-lg shadow-primary-500/10">
              <HiTruck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">إجمالي المشتريات</p>
              <p className="text-3xl font-bold text-gray-800">{totalPurchases}</p>
              <p className="text-xs text-gray-400">عملية شراء من الموردين</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10">
              <HiShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">متوسط المشتريات</p>
              <p className="text-3xl font-bold text-gray-800">
                {suppliers.length > 0 ? (totalPurchases / suppliers.length).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-gray-400">مشتريات لكل مورد</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10">
              <HiTruck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن الموردين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={HiRefresh} onClick={fetchSuppliers} size="md">
            تحديث
          </Button>
          <Button icon={HiPlus} onClick={() => { closeForm(); setShowForm(true); }}>
            إضافة مورد
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-fadeIn">
          <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-xs text-red-500 hover:text-red-700 font-semibold">
            إغلاق
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3.5 w-12">#</th>
                <th className="px-5 py-3.5">المورد</th>
                <th className="px-5 py-3.5 hidden sm:table-cell">رقم الهاتف</th>
                <th className="px-5 py-3.5 hidden md:table-cell">العنوان</th>
                <th className="px-5 py-3.5">المشتريات</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">تاريخ الإنشاء</th>
                <th className="px-5 py-3.5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><div className="h-4 w-6 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-32 bg-gray-200 rounded-lg animate-pulse" /></td>
                    <td className="px-5 py-4 hidden sm:table-cell"><div className="h-5 w-24 bg-gray-200 rounded-lg animate-pulse" /></td>
                    <td className="px-5 py-4 hidden md:table-cell"><div className="h-5 w-36 bg-gray-200 rounded-lg animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-16 bg-gray-200 rounded-lg animate-pulse" /></td>
                    <td className="px-5 py-4 hidden lg:table-cell"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="px-5 py-4"><div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" /></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((supplier, idx) => (
                  <tr key={supplier.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
                          <HiTruck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <HiPhone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600 font-mono">{supplier.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <HiLocationMarker className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate max-w-[200px]">{supplier.address || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={supplier._count?.purchases > 0 ? 'green' : 'gray'}>
                        {supplier._count?.purchases || 0} عملية
                      </Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(supplier.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(supplier)}
                          className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                          title="تعديل"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(supplier)}
                          disabled={deleting === supplier.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deleting === supplier.id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <HiTrash className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-16">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <HiTruck className="w-12 h-12 mb-3" />
                      <p className="text-base font-semibold text-gray-400">لا يوجد موردين</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {search ? 'جرب تعديل البحث' : 'أضف مورد جديد للبدء'}
                      </p>
                      {!search && (
                        <Button icon={HiPlus} className="mt-4" onClick={() => { closeForm(); setShowForm(true); }}>
                          إضافة مورد
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editing ? 'تعديل المورد' : 'إضافة مورد جديد'}
        size="md"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <HiTruck className="w-8 h-8 text-white" />
            </div>
          </div>

          <Input
            label="اسم المورد"
            placeholder="مثال: شركة التوريدات..."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="رقم الهاتف"
            placeholder="مثال: 0771234567"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Input
            label="العنوان"
            placeholder="مثال: بغداد، العراق"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={closeForm}>
              إلغاء
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </div>
              ) : (
                editing ? 'حفظ التعديلات' : 'إضافة المورد'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scaleIn">
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <HiExclamationCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-500 mb-1">هل أنت متأكد من حذف المورد</p>
              <p className="text-base font-bold text-primary-600 mb-5">"{deleteTarget.name}"؟</p>
              <p className="text-xs text-gray-400 mb-6">لا يمكن التراجع عن هذا الإجراء بعد التأكيد</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all active:scale-95"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting === deleteTarget.id}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting === deleteTarget.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    'نعم، احذف'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
