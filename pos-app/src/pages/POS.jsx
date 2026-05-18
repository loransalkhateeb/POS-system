import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HiShoppingCart,
  HiTrash,
  HiTag,
  HiPlus,
  HiMinus,
  HiCheck,
  HiExclamationCircle,
  HiCurrencyDollar,
  HiQrcode,
  HiX,
  HiCube,
} from 'react-icons/hi';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
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

export default function POS() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('posCart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [barcode, setBarcode] = useState('');
  const [barcodeError, setBarcodeError] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const barcodeRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const apiBase = getApiBase();
      const headers = getHeaders();
      const [catRes, prodRes] = await Promise.all([
        fetch(`${apiBase}/categories`, { headers }),
        fetch(`${apiBase}/products`, { headers }),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch {
      setError('فشل في تحميل البيانات');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    localStorage.setItem('posCart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (!loadingData) barcodeRef.current?.focus();
  }, [loadingData]);

  const processBarcode = useCallback((code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setBarcodeError('');
    const product = products.find((p) => p.barcode === trimmed);
    if (!product) {
      setBarcodeError('لم يتم العثور على منتج بهذا الباركود');
      setBarcode(trimmed);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          setBarcodeError(`الكمية المتاحة غير كافية (المتاح: ${product.quantity})`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.quantity < 1) {
        setBarcodeError('المنتج غير متوفر في المخزون');
        return prev;
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        barcode: product.barcode || '',
        salePrice: parseFloat(product.salePrice),
        quantity: 1,
        stock: product.quantity,
      }];
    });

    setBarcode('');
    barcodeRef.current?.focus();
  }, [products]);

  // Global barcode scanner detection — scanners type rapidly (< 50ms between keys) then send Enter.
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;
    let resetTimer = null;

    const handleKeyDown = (e) => {
      if (receipt) return;
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
          processBarcode(buffer);
          setBarcode('');
          barcodeRef.current?.focus();
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

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      clearTimeout(resetTimer);
    };
  }, [processBarcode, receipt]);

  // Refocus barcode input when clicking outside of input fields
  useEffect(() => {
    const refocus = () => {
      setTimeout(() => {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'SELECT' &&
          !receipt
        ) {
          barcodeRef.current?.focus();
        }
      }, 50);
    };
    window.addEventListener('click', refocus);
    return () => window.removeEventListener('click', refocus);
  }, [receipt]);

  const filteredProducts = products.filter((p) =>
    !selectedCategory || p.categoryId === selectedCategory
  );

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.quantity < 1) return prev;
      return [...prev, {
          productId: product.id,
          name: product.name,
          barcode: product.barcode || '',
          salePrice: parseFloat(product.salePrice),
          quantity: 1,
          stock: product.quantity,
        }];
      });
    barcodeRef.current?.focus();
  };

  const handleBarcodeScan = (e) => {
    e.preventDefault();
    const value = barcodeRef.current?.value || barcode;
    processBarcode(value);
  };

  const updateQuantity = (productId, delta) => {
    if (delta < 0) setBarcodeError('');
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty < 1) return null;
          if (newQty > item.stock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setBarcodeError('');
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAmountPaid('');
    barcodeRef.current?.focus();
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const paidNum = parseFloat(amountPaid) || 0;
  const change = paidNum - totalAmount;

  const handleSubmit = async () => {
    setError('');

    if (cartItems.length === 0) {
      setError('أضف منتج واحد على الأقل');
      return;
    }

    if (paidNum < totalAmount) {
      setError(`المبلغ المدفوع غير كافٍ. المطلوب: $${totalAmount.toFixed(2)}`);
      return;
    }

    const itemsWithoutBarcode = cartItems.filter((item) => !item.barcode);
    if (itemsWithoutBarcode.length > 0) {
      setError(`المنتج "${itemsWithoutBarcode[0].name}" لا يملك باركود`);
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        amountPaid: paidNum,
        items: cartItems.map((item) => ({
          barcode: item.barcode,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`${getApiBase()}/sales`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'فشل في إتمام عملية البيع');
      }

      const data = await res.json();
      setReceipt(data.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const closeReceipt = () => {
    setReceipt(null);
    setCartItems([]);
    setAmountPaid('');
    fetchData();
    barcodeRef.current?.focus();
  };

  if (loadingData) {
    return (
      <div className="flex gap-4 h-[calc(100vh-7.5rem)] animate-pulse">
        <div className="flex-1 space-y-4">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="hidden lg:block w-96">
          <div className="h-full bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-7.5rem)]">
      {/* Left: Products */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barcode Scanner */}
        <form onSubmit={handleBarcodeScan} className="mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <HiQrcode className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  ref={barcodeRef}
                  type="text"
                  placeholder="امسح الباركود أو أدخله هنا..."
                  value={barcode}
                  onChange={(e) => { setBarcode(e.target.value); setBarcodeError(''); }}
                  className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-primary-100 bg-primary-50/30 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
              </button>
            </div>
            {barcodeError && (
              <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                <HiExclamationCircle className="w-3.5 h-3.5" />
                {barcodeError}
              </p>
            )}
          </div>
        </form>

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('')}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
              ${!selectedCategory
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                : 'bg-white text-gray-600 hover:bg-primary-50 border border-gray-200'}
            `}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${selectedCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-white text-gray-600 hover:bg-primary-50 border border-gray-200'}
              `}
            >
              <span className="flex items-center gap-1.5">
                <HiTag className="w-3.5 h-3.5" />
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cartItems.find((item) => item.productId === product.id);
              const outOfStock = product.quantity < 1;
              return (
                <button
                  key={product.id}
                  onClick={() => !outOfStock && addToCart(product)}
                  disabled={outOfStock}
                  className={`
                    relative bg-white rounded-2xl shadow-sm border p-4 text-right transition-all duration-200 group
                    ${outOfStock
                      ? 'border-gray-100 opacity-50 cursor-not-allowed'
                      : inCart
                        ? 'border-primary-300 bg-primary-50/50 shadow-md shadow-primary-500/10'
                        : 'border-gray-100 hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'}
                  `}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-sm mb-3">
                    <span className="text-sm font-bold text-white">{product.name.charAt(0)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1 truncate">{product.name}</h4>
                  <div className="flex items-center gap-1.5 mb-2">
                    {product.barcode && (
                      <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                        {product.barcode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-primary-600">${parseFloat(product.salePrice).toFixed(2)}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      outOfStock ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {outOfStock ? 'نفذ' : `${product.quantity} متاح`}
                    </span>
                  </div>
                  {inCart && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {inCart.quantity}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <HiCube className="w-12 h-12 mb-2" />
              <p className="text-sm font-medium text-gray-400">لا توجد منتجات في هذا التصنيف</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="hidden lg:flex w-96 flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiShoppingCart className="w-5 h-5 text-primary-500" />
              <h3 className="font-bold text-gray-800">الفاتورة</h3>
              {cartItems.length > 0 && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              >
                <HiTrash className="w-3.5 h-3.5" />
                مسح الكل
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <HiShoppingCart className="w-14 h-14 mb-3" />
                <p className="text-sm font-medium text-gray-400">السلة فارغة</p>
                <p className="text-xs text-gray-300 mt-1">امسح الباركود أو اختر منتج</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.barcode && (
                          <span className="text-[10px] text-gray-400 font-mono">{item.barcode}</span>
                        )}
                        <span className="text-xs text-primary-600 font-semibold">${item.salePrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary-300 hover:text-primary-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      ${(item.salePrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-100 space-y-3">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>العناصر</span>
                  <span>{totalItems} عنصر</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-dashed border-gray-200">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Amount Paid */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500">المبلغ المدفوع</label>
                <div className="relative">
                  <HiCurrencyDollar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-lg font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
                  />
                </div>
              </div>

              {/* Change */}
              {paidNum > 0 && (
                <div className={`flex justify-between items-center py-2.5 px-3 rounded-xl ${
                  change >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <span className={`text-sm font-semibold ${change >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {change >= 0 ? 'الباقي' : 'المبلغ المتبقي'}
                  </span>
                  <span className={`text-base font-bold ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${Math.abs(change).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <HiExclamationCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-600 flex-1">{error}</p>
                  <button onClick={() => setError('')} className="text-xs text-red-400 hover:text-red-600">
                    <HiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Submit */}
              <Button
                className="w-full"
                size="lg"
                icon={HiCheck}
                onClick={handleSubmit}
                disabled={submitting || cartItems.length === 0 || paidNum < totalAmount}
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري المعالجة...
                  </div>
                ) : (
                  `تأكيد البيع — $${totalAmount.toFixed(2)}`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Button */}
      <MobileCart
        cartItems={cartItems}
        totalAmount={totalAmount}
        totalItems={totalItems}
        amountPaid={amountPaid}
        setAmountPaid={setAmountPaid}
        paidNum={paidNum}
        change={change}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        error={error}
        setError={setError}
        submitting={submitting}
        handleSubmit={handleSubmit}
      />

      {/* Receipt Modal */}
      <Modal
        isOpen={!!receipt}
        onClose={closeReceipt}
        title="تمت عملية البيع بنجاح"
        size="md"
      >
        {receipt && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-3">
                <HiCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-500">رقم الفاتورة</p>
              <p className="text-lg font-bold text-primary-600">{receipt.invoiceNumber}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">{item.product}</span>
                    <span className="text-xs text-gray-400">×{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-800">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الإجمالي</span>
                <span className="font-bold text-gray-800">${receipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">المبلغ المدفوع</span>
                <span className="font-bold text-gray-800">${receipt.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-dashed border-gray-200">
                <span className="font-bold text-emerald-700">الباقي</span>
                <span className="font-bold text-emerald-600">${receipt.change.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={closeReceipt}>
              عملية بيع جديدة
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MobileCart({
  cartItems, totalAmount, totalItems, amountPaid, setAmountPaid,
  paidNum, change, updateQuantity, removeFromCart, clearCart,
  error, setError, submitting, handleSubmit,
}) {
  const [open, setOpen] = useState(false);

  if (cartItems.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-primary-500 text-white rounded-2xl shadow-xl shadow-primary-500/30 active:scale-95 transition-transform"
      >
        <HiShoppingCart className="w-5 h-5" />
        <span className="font-bold text-sm">${totalAmount.toFixed(2)}</span>
        <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
          {cartItems.length}
        </span>
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl overflow-hidden animate-slideUp flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiShoppingCart className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-800">الفاتورة</h3>
                <Badge color="blue">{cartItems.length}</Badge>
              </div>
              <div className="flex gap-2">
                <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                  <HiTrash className="w-3.5 h-3.5" /> مسح
                </button>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <HiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                      <span className="text-xs text-primary-600 font-semibold">${item.salePrice.toFixed(2)}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-1 text-gray-300 hover:text-red-500">
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} disabled={item.quantity >= item.stock} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40">
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold">${(item.salePrice * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>الإجمالي</span>
                <span className="text-primary-600">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="relative">
                <HiCurrencyDollar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number" step="0.01" min="0" placeholder="المبلغ المدفوع"
                  value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                />
              </div>
              {paidNum > 0 && (
                <div className={`flex justify-between items-center py-2 px-3 rounded-xl ${change >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <span className={`text-sm font-semibold ${change >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {change >= 0 ? 'الباقي' : 'المتبقي'}
                  </span>
                  <span className={`font-bold ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${Math.abs(change).toFixed(2)}
                  </span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50 border border-red-200">
                  <HiExclamationCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-semibold text-red-600 flex-1">{error}</p>
                </div>
              )}
              <Button className="w-full" size="lg" icon={HiCheck} onClick={handleSubmit}
                disabled={submitting || cartItems.length === 0 || paidNum < totalAmount}
              >
                {submitting ? 'جاري المعالجة...' : `تأكيد البيع — $${totalAmount.toFixed(2)}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
