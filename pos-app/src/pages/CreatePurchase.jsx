import { useState, useEffect, useCallback } from 'react';
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
} from 'react-icons/hi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const API_BASE = 'http://localhost:5000/api/admin';

export default function CreatePurchase() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0',
  });
  const [savingProduct, setSavingProduct] = useState(false);

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [catRes, supRes, prodRes] = await Promise.all([
        fetch(`${API_BASE}/categories`, { headers }),
        fetch(`${API_BASE}/suppliers`, { headers }),
        fetch(`${API_BASE}/products`, { headers }),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (supRes.ok) setSuppliers(await supRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch {
      setError('فشل في تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch = !productSearch ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode || '').includes(productSearch);
    const notAdded = !items.some((item) => item.productId === p.id);
    return matchesCategory && matchesSearch && notAdded;
  });

  const addItem = (product) => {
    setItems([...items, {
      productId: product.id,
      productName: product.name,
      categoryName: product.category?.name || '—',
      quantity: 1,
      purchasePrice: product.purchasePrice || 0,
    }]);
    setShowProductModal(false);
    setProductSearch('');
    setSelectedCategory('');
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

  const handleCreateProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.categoryId || !newProduct.salePrice) return;
    setSavingProduct(true);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newProduct.name,
          barcode: newProduct.barcode || undefined,
          categoryId: newProduct.categoryId,
          purchasePrice: parseFloat(newProduct.purchasePrice) || 0,
          salePrice: parseFloat(newProduct.salePrice) || 0,
          quantity: parseInt(newProduct.quantity) || 0,
          minQuantity: parseInt(newProduct.minQuantity) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'فشل في إنشاء المنتج');
      }
      const created = await res.json();
      setProducts((prev) => [...prev, created]);
      addItem(created);
      setShowCreateProduct(false);
      setNewProduct({ name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0' });
    } catch (err) {
      setError(err.message);
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
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'فشل في إنشاء عملية الشراء');
      }

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
                  <HiCube className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-800">المنتجات</h2>
                  <p className="text-xs text-gray-400">{items.length} منتج مضاف</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={HiPlus}
                  onClick={() => setShowCreateProduct(true)}
                >
                  منتج جديد
                </Button>
                <Button
                  size="sm"
                  icon={HiPlus}
                  onClick={() => setShowProductModal(true)}
                >
                  إضافة منتج
                </Button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                <HiShoppingBag className="w-14 h-14 mb-3" />
                <p className="text-base font-semibold text-gray-400">لا توجد منتجات مضافة</p>
                <p className="text-sm text-gray-300 mt-1 mb-4">ابدأ بإضافة المنتجات لعملية الشراء</p>
                <Button size="sm" icon={HiPlus} onClick={() => setShowProductModal(true)}>
                  إضافة منتج
                </Button>
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

      {/* Select Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => { setShowProductModal(false); setProductSearch(''); setSelectedCategory(''); }}
        title="اختر منتج"
        size="2xl"
      >
        <div className="space-y-4">
          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الباركود..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="relative">
              <HiTag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pr-10 pl-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none"
              >
                <option value="">جميع التصنيفات</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <HiChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="max-h-80 overflow-y-auto space-y-1.5">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-all text-right group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-sm font-bold text-white">{product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{product.name}</span>
                      <Badge color="purple">{product.category?.name || '—'}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {product.barcode && (
                        <span className="text-xs text-gray-400 font-mono">{product.barcode}</span>
                      )}
                      <span className="text-xs text-gray-400">الكمية: {product.quantity}</span>
                      <span className="text-xs text-gray-400">سعر الشراء: ${parseFloat(product.purchasePrice).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-primary-50 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiPlus className="w-4 h-4" />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <HiCube className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm font-medium">لا توجد منتجات متاحة</p>
                <p className="text-xs mt-1">جرب تعديل البحث أو أنشئ منتج جديد</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              icon={HiPlus}
              onClick={() => { setShowProductModal(false); setShowCreateProduct(true); }}
              className="w-full"
            >
              إنشاء منتج جديد
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Product Modal */}
      <Modal
        isOpen={showCreateProduct}
        onClose={() => { setShowCreateProduct(false); setNewProduct({ name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0' }); }}
        title="إنشاء منتج جديد"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <HiCube className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم المنتج *"
              placeholder="مثال: كوكا كولا"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Input
              label="الباركود"
              placeholder="مثال: 123456"
              value={newProduct.barcode}
              onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">التصنيف *</label>
            <div className="relative">
              <HiTag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
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
              value={newProduct.purchasePrice}
              onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
            />
            <Input
              label="سعر البيع *"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProduct.salePrice}
              onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
            />
            <Input
              label="الكمية"
              type="number"
              placeholder="0"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            />
            <Input
              label="الحد الأدنى"
              type="number"
              placeholder="0"
              value={newProduct.minQuantity}
              onChange={(e) => setNewProduct({ ...newProduct, minQuantity: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button variant="ghost" className="flex-1" onClick={() => {
              setShowCreateProduct(false);
              setNewProduct({ name: '', barcode: '', categoryId: '', purchasePrice: '', salePrice: '', quantity: '0', minQuantity: '0' });
            }}>
              إلغاء
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateProduct}
              disabled={savingProduct || !newProduct.name.trim() || !newProduct.categoryId || !newProduct.salePrice}
            >
              {savingProduct ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإنشاء...
                </div>
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
