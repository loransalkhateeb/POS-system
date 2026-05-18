import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HiCube,
  HiPlus,
  HiPencil,
  HiTrash,
  HiRefresh,
  HiExclamationCircle,
  HiSearch,
  HiCurrencyDollar,
  HiTag,
  HiExclamation,
  HiQrcode,
  HiX,
} from 'react-icons/hi';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { isAdmin } from '../utils/auth';

function getApiBase() {
  return `http://localhost:5000/api/${isAdmin() ? 'admin' : 'user'}`;
}

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '', minQuantity: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [barcodeLocked, setBarcodeLocked] = useState(false);
  const barcodeRef = useRef(null);
  const barcodeLockRef = useRef(false);
  barcodeLockRef.current = barcodeLocked;

  useEffect(() => {
    if (!showForm) return;
    let buffer = '';
    let lastKeyTime = 0;
    let resetTimer = null;

    const handleKeyDown = (e) => {
      if (barcodeLockRef.current) return;
      if (document.activeElement === barcodeRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const now = Date.now();
      const gap = now - lastKeyTime;
      lastKeyTime = now;

      if (gap > 50) buffer = '';

      if (e.key === 'Enter') {
        clearTimeout(resetTimer);
        if (buffer.length >= 3) {
          e.preventDefault();
          e.stopPropagation();
          setForm((prev) => ({ ...prev, barcode: buffer }));
          setBarcodeLocked(true);
        }
        buffer = '';
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { buffer = ''; }, 100);

        if (buffer.length >= 2 && gap <= 50) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      clearTimeout(resetTimer);
    };
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    if (barcodeLocked) return;
    const input = barcodeRef.current;
    if (!input) return;
    let lockTimer = null;

    const handleInput = () => {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        if (input.value.length >= 3) {
          setForm((prev) => ({ ...prev, barcode: input.value }));
          setBarcodeLocked(true);
        }
      }, 150);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && input.value.length >= 3) {
        e.preventDefault();
        setForm((prev) => ({ ...prev, barcode: input.value }));
        setBarcodeLocked(true);
      }
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(lockTimer);
      input.removeEventListener('input', handleInput);
      input.removeEventListener('keydown', handleKeyDown);
    };
  }, [showForm, barcodeLocked]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getApiBase()}/products`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`فشل في تحميل المنتجات (${res.status})`);
      const data = await res.json();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/categories`, { headers: getHeaders() });
      if (res.ok) setCategories(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.salePrice) return;
    if (form.barcode.trim()) {
      const duplicate = products.find(
        (p) => p.barcode === form.barcode.trim() && (!editing || p.id !== editing.id)
      );
      if (duplicate) {
        setError(`الباركود "${form.barcode.trim()}" موجود بالفعل للمنتج "${duplicate.name}"`);
        return;
      }
    }
    setSaving(true);
    try {
      const base = getApiBase();
      const url = editing ? `${base}/products/${editing.id}` : `${base}/products`;
      const method = editing ? 'PUT' : 'POST';

      const body = {
        name: form.name,
        barcode: form.barcode,
        categoryId: form.categoryId || undefined,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        salePrice: parseFloat(form.salePrice) || 0,
        quantity: parseInt(form.quantity) || 0,
        minQuantity: parseInt(form.minQuantity) || 0,
      };

      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error('فشل في حفظ المنتج');

      closeForm();
      fetchProducts();
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
      const res = await fetch(`${getApiBase()}/products/${deleteTarget.id}`, { method: 'DELETE', headers: getHeaders() });
      if (!res.ok) throw new Error('فشل في حذف المنتج');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      barcode: product.barcode || '',
      categoryId: product.categoryId || '',
      purchasePrice: product.purchasePrice || '',
      salePrice: product.salePrice || '',
      quantity: product.quantity?.toString() || '',
      minQuantity: product.minQuantity?.toString() || '',
    });
    setBarcodeLocked(!!product.barcode);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setBarcodeLocked(false);
    setForm({ name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '', minQuantity: '' });
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || '').includes(search) ||
    (p.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.salePrice) || 0) * (p.quantity || 0), 0);
  const lowStock = products.filter((p) => p.quantity <= p.minQuantity).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">إجمالي المنتجات</p>
              <p className="text-3xl font-bold text-gray-800">{products.length}</p>
              <p className="text-xs text-gray-400">منتج مسجل</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-50 text-primary-600 shadow-lg shadow-primary-500/10">
              <HiCube className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">قيمة المخزون</p>
              <p className="text-3xl font-bold text-gray-800">${totalValue.toFixed(2)}</p>
              <p className="text-xs text-gray-400">بسعر البيع</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10">
              <HiCurrencyDollar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">التصنيفات</p>
              <p className="text-3xl font-bold text-gray-800">{new Set(products.map(p => p.category?.name)).size}</p>
              <p className="text-xs text-gray-400">تصنيف نشط</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10">
              <HiTag className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-500 font-medium">مخزون منخفض</p>
              <p className={`text-3xl font-bold ${lowStock > 0 ? 'text-red-600' : 'text-gray-800'}`}>{lowStock}</p>
              <p className="text-xs text-gray-400">منتج يحتاج إعادة تعبئة</p>
            </div>
            <div className={`p-3 rounded-xl ${lowStock > 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'} shadow-lg`}>
              <HiExclamation className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الباركود أو التصنيف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={HiRefresh} onClick={fetchProducts} size="md">
            تحديث
          </Button>
          <Button icon={HiPlus} onClick={() => { closeForm(); setShowForm(true); }}>
            إضافة منتج
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-fadeIn">
          <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-xs text-red-500 hover:text-red-700 font-semibold">إغلاق</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3.5 w-12">#</th>
                <th className="px-4 py-3.5">المنتج</th>
                <th className="px-4 py-3.5 hidden sm:table-cell">الباركود</th>
                <th className="px-4 py-3.5 hidden md:table-cell">التصنيف</th>
                <th className="px-4 py-3.5">سعر الشراء</th>
                <th className="px-4 py-3.5">سعر البيع</th>
                <th className="px-4 py-3.5 hidden lg:table-cell">الكمية</th>
                <th className="px-4 py-3.5 hidden xl:table-cell">الحد الأدنى</th>
                <th className="px-4 py-3.5 hidden xl:table-cell">آخر تحديث</th>
                <th className="px-4 py-3.5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(10)].map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-5 w-full max-w-[80px] bg-gray-200 rounded-lg animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((product, idx) => {
                  const isLowStock = product.quantity <= product.minQuantity;
                  return (
                    <tr key={product.id} className={`hover:bg-primary-50/30 transition-colors ${isLowStock ? 'bg-red-50/30' : ''}`}>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-white">{product.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded">{product.barcode || '—'}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <Badge color="purple">{product.category?.name || '—'}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-600">${parseFloat(product.purchasePrice).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-primary-600">${parseFloat(product.salePrice).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                            {product.quantity}
                          </span>
                          {isLowStock && (
                            <span className="flex items-center gap-0.5 text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">
                              <HiExclamation className="w-3 h-3" />
                              منخفض
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden xl:table-cell">
                        <span className="text-sm text-gray-500">{product.minQuantity}</span>
                      </td>
                      <td className="px-4 py-4 hidden xl:table-cell">
                        <span className="text-xs text-gray-400">
                          {new Date(product.updatedAt).toLocaleDateString('ar-EG', {
                            month: 'short', day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors"
                            title="تعديل"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            disabled={deleting === product.id}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="حذف"
                          >
                            {deleting === product.id ? (
                              <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <HiTrash className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-5 py-16">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <HiCube className="w-12 h-12 mb-3" />
                      <p className="text-base font-semibold text-gray-400">لا توجد منتجات</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {search ? 'جرب تعديل البحث' : 'أضف منتج جديد للبدء'}
                      </p>
                      {!search && (
                        <Button icon={HiPlus} className="mt-4" onClick={() => { closeForm(); setShowForm(true); }}>
                          إضافة منتج
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
      <Modal isOpen={showForm} onClose={closeForm} title={editing ? 'تعديل المنتج' : 'إضافة منتج جديد'} size="lg">
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <HiCube className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم المنتج"
              placeholder="مثال: كوكا كولا"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">الباركود</label>
              <div className="relative">
                <HiQrcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                {barcodeLocked ? (
                  <>
                    <input
                      type="text"
                      value={form.barcode}
                      readOnly
                      className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-green-300 bg-green-50/50 text-green-800 font-mono font-semibold text-sm cursor-default"
                    />
                    <button
                      type="button"
                      onClick={() => { setForm({ ...form, barcode: '' }); setBarcodeLocked(false); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <HiX className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <input
                    ref={barcodeRef}
                    type="text"
                    placeholder="امسح الباركود بالقارئ..."
                    defaultValue=""
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                  />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {barcodeLocked ? 'تم مسح الباركود بنجاح — اضغط ✕ لإعادة المسح' : 'امسح الباركود بالقارئ مباشرة'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">التصنيف</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="سعر الشراء"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
            />
            <Input
              label="سعر البيع"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            />
            <Input
              label="الكمية"
              type="number"
              placeholder="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <Input
              label="الحد الأدنى"
              type="number"
              placeholder="0"
              value={form.minQuantity}
              onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="ghost" className="flex-1" onClick={closeForm}>
              إلغاء
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </div>
              ) : (
                editing ? 'حفظ التعديلات' : 'إضافة المنتج'
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
              <p className="text-sm text-gray-500 mb-1">هل أنت متأكد من حذف المنتج</p>
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
