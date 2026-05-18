import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiTrash,
  HiSearch,
  HiShoppingBag,
  HiCube,
  HiTag,
  HiDocumentText,
  HiTruck,
  HiCheck,
  HiExclamationCircle,
  HiArrowRight,
  HiCurrencyDollar,
  HiCalendar,
  HiChevronDown,
  HiPencil,
  HiQrcode,
  HiX,
} from 'react-icons/hi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const API_BASE = 'http://localhost:5000/api/admin';
const DRAFT_KEY = 'purchase_draft';

function loadDraft() {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function CreatePurchase() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [invoiceNumber, setInvoiceNumber] = useState(() => loadDraft()?.invoiceNumber || '');
  const [purchaseDate, setPurchaseDate] = useState(() => loadDraft()?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState(() => loadDraft()?.supplierId || '');
  const [items, setItems] = useState(() => loadDraft()?.items || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0',
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [productError, setProductError] = useState('');
  const [barcodeLocked, setBarcodeLocked] = useState(false);
  const barcodeRef = useRef(null);
  const barcodeLockRef = useRef(false);
  barcodeLockRef.current = barcodeLocked;

  useEffect(() => {
    if (!showProductForm) return;
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
          setProductForm((prev) => ({ ...prev, barcode: buffer }));
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
  }, [showProductForm]);

  useEffect(() => {
    if (!showProductForm) return;
    if (barcodeLocked) return;
    const input = barcodeRef.current;
    if (!input) return;
    let lockTimer = null;

    const handleInput = () => {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        if (input.value.length >= 3) {
          setProductForm((prev) => ({ ...prev, barcode: input.value }));
          setBarcodeLocked(true);
        }
      }, 150);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && input.value.length >= 3) {
        e.preventDefault();
        setProductForm((prev) => ({ ...prev, barcode: input.value }));
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
  }, [showProductForm, barcodeLocked]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const headers = getHeaders();
      const [catRes, supRes, prodRes] = await Promise.all([
        fetch(`${API_BASE}/categories`, { headers }),
        fetch(`${API_BASE}/suppliers`, { headers }),
        fetch(`${API_BASE}/products`, { headers }),
      ]);

      if (!catRes.ok || !supRes.ok || !prodRes.ok) {
        throw new Error('فشل في تحميل البيانات');
      }

      setCategories(await catRes.json());
      setSuppliers(await supRes.json());
      setProducts(await prodRes.json());
    } catch {
      setError('فشل في تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ invoiceNumber, purchaseDate, supplierId, items }));
  }, [invoiceNumber, purchaseDate, supplierId, items]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode || '').includes(productSearch);
    return matchesCategory && matchesSearch;
  });

  const addItem = (product, qty) => {
    if (items.some((item) => item.productId === product.id)) return;
    setItems([...items, {
      productId: product.id,
      productName: product.name,
      categoryName: product.category?.name || '—',
      quantity: qty || 1,
      purchasePrice: product.purchasePrice || 0,
    }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0' });
    setBarcodeLocked(false);
    setProductError('');
    setShowProductForm(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      barcode: product.barcode || '',
      categoryId: product.categoryId || '',
      purchasePrice: product.purchasePrice?.toString() || '',
      salePrice: product.salePrice?.toString() || '',
      quantity: product.quantity?.toString() || '0',
      minQuantity: product.minQuantity?.toString() || '0',
    });
    setBarcodeLocked(!!product.barcode);
    setProductError('');
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setBarcodeLocked(false);
    setProductError('');
    setProductForm({ name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0' });
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.categoryId || !productForm.salePrice) return;
    if (productForm.barcode.trim()) {
      const duplicate = products.find(
        (p) => p.barcode === productForm.barcode.trim() && (!editingProduct || p.id !== editingProduct.id)
      );
      if (duplicate) {
        setProductError(`الباركود "${productForm.barcode.trim()}" موجود بالفعل للمنتج "${duplicate.name}"`);
        return;
      }
    }
    setSavingProduct(true);
    setProductError('');
    try {
      const body = {
        name: productForm.name.trim(),
        categoryId: productForm.categoryId,
        purchasePrice: parseFloat(productForm.purchasePrice) || 0,
        salePrice: parseFloat(productForm.salePrice),
        quantity: parseInt(productForm.quantity) || 0,
        minQuantity: parseInt(productForm.minQuantity) || 0,
      };
      if (productForm.barcode.trim()) {
        body.barcode = productForm.barcode.trim();
      }

      const isEditing = !!editingProduct;
      const url = isEditing ? `${API_BASE}/products/${editingProduct.id}` : `${API_BASE}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = isEditing ? 'فشل في تحديث المنتج' : 'فشل في إنشاء المنتج';
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const saved = await res.json();

      if (isEditing) {
        setProducts((prev) => prev.map((p) => p.id === saved.id ? saved : p));
        setItems((prev) => prev.map((item) =>
          item.productId === saved.id
            ? { ...item, productName: saved.name, categoryName: saved.category?.name || '—', purchasePrice: saved.purchasePrice || item.purchasePrice }
            : item
        ));
      } else {
        setProducts((prev) => [...prev, saved]);
        addItem(saved, parseInt(productForm.quantity) || 1);
      }

      closeProductForm();
    } catch (err) {
      setProductError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!invoiceNumber.trim()) {
      setError('يرجى إدخال رقم الفاتورة');
      return;
    }
    if (items.length === 0) {
      setError('يرجى إضافة منتج واحد على الأقل');
      return;
    }

    const invalidItem = items.find((item) => !item.quantity || item.quantity < 1 || item.purchasePrice < 0);
    if (invalidItem) {
      setError('يرجى التأكد من صحة الكمية والسعر لجميع المنتجات');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        invoiceNumber: invoiceNumber.trim(),
        ...(purchaseDate ? { purchaseDate: new Date(purchaseDate).toISOString() } : {}),
        ...(supplierId ? { supplierId } : {}),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice),
        })),
      };

      const res = await fetch(`${API_BASE}/purchases`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'فشل في إنشاء عملية الشراء');
      }

      sessionStorage.removeItem(DRAFT_KEY);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-5">
            <HiCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تمت عملية الشراء بنجاح!</h2>
          <p className="text-gray-500 mb-2">تم إنشاء الفاتورة <span className="font-bold text-primary-600">{invoiceNumber}</span></p>
          <p className="text-sm text-gray-400 mb-6">
            {items.length} منتج &middot; المبلغ الإجمالي: <span className="font-bold">${totalAmount.toFixed(2)}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              العودة للوحة التحكم
            </Button>
            <Button onClick={() => {
              sessionStorage.removeItem(DRAFT_KEY);
              setSuccess(false);
              setInvoiceNumber('');
              setPurchaseDate(new Date().toISOString().split('T')[0]);
              setSupplierId('');
              setItems([]);
            }}>
              إنشاء عملية شراء جديدة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl h-48 border border-gray-100" />
            <div className="bg-white rounded-2xl h-64 border border-gray-100" />
          </div>
          <div className="bg-white rounded-2xl h-72 border border-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">إنشاء عملية شراء جديدة</h1>
            <p className="text-sm text-gray-400">أضف المنتجات وأكمل بيانات الفاتورة</p>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Invoice info + Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Invoice Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-primary-50">
                <HiDocumentText className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-base font-bold text-gray-800">بيانات الفاتورة</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="رقم الفاتورة *"
                placeholder="مثال: INV-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                icon={HiDocumentText}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">تاريخ الشراء</label>
                <div className="relative">
                  <HiCalendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">المورد (اختياري)</label>
                <div className="relative">
                  <HiTruck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full pr-10 pl-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                  >
                    <option value="">بدون مورد</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <HiShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">فاتورة الشراء</h2>
                  <p className="text-xs text-gray-400">{items.length} منتج مضاف</p>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <HiShoppingBag className="w-12 h-12 mb-2" />
                <p className="text-sm font-semibold text-gray-400">لا توجد منتجات مضافة</p>
                <p className="text-xs text-gray-300 mt-1">اختر المنتجات من الجدول أدناه</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-3 w-12">#</th>
                      <th className="px-4 py-3">المنتج</th>
                      <th className="px-4 py-3 hidden sm:table-cell">التصنيف</th>
                      <th className="px-4 py-3 w-28">الكمية</th>
                      <th className="px-4 py-3 w-36">سعر الشراء</th>
                      <th className="px-4 py-3">الإجمالي</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-bold text-gray-400">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm">
                              <span className="text-xs font-bold text-white">{item.productName.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-800">{item.productName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <Badge color="purple">{item.categoryName}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="relative">
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.purchasePrice}
                              onChange={(e) => updateItem(idx, 'purchasePrice', parseFloat(e.target.value) || 0)}
                              className="w-full pr-7 pl-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-bold text-primary-600">
                            ${(item.quantity * item.purchasePrice).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => removeItem(idx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-gray-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50">
                  <HiCube className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">المنتجات</h2>
                  <p className="text-xs text-gray-400">{products.length} منتج متاح</p>
                </div>
              </div>
              <Button size="sm" icon={HiPlus} onClick={openCreateProduct}>
                منتج جديد
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100 bg-gray-50/30">
              <div className="relative flex-1">
                <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الباركود..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div className="relative">
                <HiTag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pr-10 pl-8 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none"
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <HiChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3">المنتج</th>
                    <th className="px-4 py-3 hidden md:table-cell">الباركود</th>
                    <th className="px-4 py-3 hidden sm:table-cell">التصنيف</th>
                    <th className="px-4 py-3">سعر الشراء</th>
                    <th className="px-4 py-3">سعر البيع</th>
                    <th className="px-4 py-3">المخزون</th>
                    <th className="px-4 py-3 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const alreadyAdded = items.some((item) => item.productId === product.id);
                      return (
                        <tr key={product.id} className={`transition-colors ${alreadyAdded ? 'bg-primary-50/40' : 'hover:bg-gray-50/80'}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-xs font-bold text-white">{product.name.charAt(0)}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-800">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded">{product.barcode || '—'}</span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge color="purple">{product.category?.name || '—'}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-gray-600">${parseFloat(product.purchasePrice).toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-bold text-primary-600">${parseFloat(product.salePrice).toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${product.quantity <= product.minQuantity ? 'text-red-600' : 'text-gray-800'}`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => addItem(product)}
                                disabled={alreadyAdded}
                                className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={alreadyAdded ? 'مضاف مسبقاً' : 'إضافة للفاتورة'}
                              >
                                <HiPlus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openEditProduct(product)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                title="تعديل"
                              >
                                <HiPencil className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-12">
                        <div className="flex flex-col items-center justify-center text-gray-300">
                          <HiCube className="w-10 h-10 mb-2" />
                          <p className="text-sm font-medium text-gray-400">لا توجد منتجات</p>
                          <p className="text-xs text-gray-300 mt-1">{productSearch ? 'جرب تعديل البحث' : 'أضف منتج جديد للبدء'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side - Summary */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn sticky top-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <HiCurrencyDollar className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-base font-bold text-gray-800">ملخص الفاتورة</h2>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">رقم الفاتورة</span>
                <span className="text-sm font-bold text-gray-800">{invoiceNumber || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">التاريخ</span>
                <span className="text-sm font-semibold text-gray-700">
                  {purchaseDate ? new Date(purchaseDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">المورد</span>
                <span className="text-sm font-semibold text-gray-700">
                  {suppliers.find((s) => s.id === supplierId)?.name || 'غير محدد'}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">عدد المنتجات</span>
                <Badge color="blue">{items.length} منتج</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">إجمالي العناصر</span>
                <span className="text-sm font-bold text-gray-800">{totalItems}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center py-3">
                <span className="text-base font-bold text-gray-800">المبلغ الإجمالي</span>
                <span className="text-xl font-bold text-primary-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {items.length > 0 && (
              <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-1.5 px-2 rounded-lg bg-gray-50/80">
                    <span className="text-xs text-gray-600 truncate flex-1">{item.productName}</span>
                    <span className="text-xs font-bold text-gray-700 mr-2">
                      {item.quantity} × ${Number(item.purchasePrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              icon={HiCheck}
              onClick={handleSubmit}
              disabled={submitting || items.length === 0 || !invoiceNumber.trim()}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري إنشاء الفاتورة...
                </div>
              ) : (
                'تأكيد عملية الشراء'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={showProductForm}
        onClose={closeProductForm}
        title={editingProduct ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${editingProduct ? 'from-blue-500 to-blue-400 shadow-blue-500/20' : 'from-primary-500 to-primary-400 shadow-primary-500/20'} flex items-center justify-center shadow-xl`}>
              {editingProduct ? <HiPencil className="w-7 h-7 text-white" /> : <HiCube className="w-7 h-7 text-white" />}
            </div>
          </div>

          {productError && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200 animate-fadeIn">
              <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700 flex-1">{productError}</p>
              <button onClick={() => setProductError('')} className="text-xs text-red-500 hover:text-red-700 font-semibold">إغلاق</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم المنتج *"
              placeholder="مثال: كوكا كولا"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">الباركود</label>
              <div className="relative">
                <HiQrcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                {barcodeLocked ? (
                  <>
                    <input
                      type="text"
                      value={productForm.barcode}
                      readOnly
                      className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-green-300 bg-green-50/50 text-green-800 font-mono font-semibold text-sm cursor-default"
                    />
                    <button
                      type="button"
                      onClick={() => { setProductForm({ ...productForm, barcode: '' }); setBarcodeLocked(false); }}
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
            <label className="block text-sm font-medium text-gray-700">التصنيف *</label>
            <div className="relative">
              <HiTag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full pr-10 pl-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none"
              >
                <option value="">اختر التصنيف</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <HiChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="سعر الشراء"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={productForm.purchasePrice}
              onChange={(e) => setProductForm({ ...productForm, purchasePrice: e.target.value })}
            />
            <Input
              label="سعر البيع *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={productForm.salePrice}
              onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
            />
            <Input
              label="الكمية"
              type="number"
              placeholder="0"
              value={productForm.quantity}
              onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
            />
            <Input
              label="الحد الأدنى"
              type="number"
              placeholder="0"
              value={productForm.minQuantity}
              onChange={(e) => setProductForm({ ...productForm, minQuantity: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="ghost" className="flex-1" onClick={closeProductForm}>
              إلغاء
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveProduct}
              disabled={savingProduct || !productForm.name.trim() || !productForm.categoryId || !productForm.salePrice}
            >
              {savingProduct ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </div>
              ) : editingProduct ? (
                'حفظ التعديلات'
              ) : (
                'إنشاء وإضافة للفاتورة'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
