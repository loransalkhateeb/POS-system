import { useState, useEffect } from 'react';
import { HiCube } from 'react-icons/hi';

export default function TopProducts({ data = {} }) {
  const [animateProgress, setAnimateProgress] = useState(false);
  const products = Object.entries(data).map(([name, info]) => ({
    name,
    quantity: info.quantity,
    totalSpent: info.totalSpent,
  }));

  products.sort((a, b) => b.totalSpent - a.totalSpent);
  const maxSpent = Math.max(...products.map((p) => p.totalSpent), 1);

  useEffect(() => {
    setAnimateProgress(false);
    const timer = setTimeout(() => setAnimateProgress(true), 300);
    return () => clearTimeout(timer);
  }, [data]);

  const colors = [
    'from-primary-500 to-primary-400',
    'from-blue-500 to-blue-400',
    'from-emerald-500 to-emerald-400',
    'from-amber-500 to-amber-400',
    'from-pink-500 to-pink-400',
    'from-indigo-500 to-indigo-400',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-800">تفاصيل المنتجات</h3>
          <p className="text-xs text-gray-400 mt-0.5">المنتجات المشتراة حسب الكمية</p>
        </div>
        <div className="p-2 rounded-xl bg-primary-50">
          <HiCube className="w-4 h-4 text-primary-500" />
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, idx) => (
            <div
              key={product.name}
              className="p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} flex items-center justify-center shadow-sm`}>
                  <span className="text-sm font-bold text-white">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{product.name}</h4>
                  <p className="text-xs text-gray-400">المنتج #{idx + 1}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">{product.quantity}</p>
                  <p className="text-xs text-gray-400">الكمية</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-600">${product.totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">إجمالي التكلفة</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-600">${(product.totalSpent / product.quantity).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">سعر الوحدة</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full bg-gradient-to-l ${colors[idx % colors.length]} transition-all duration-1000 ease-out`}
                  style={{ width: animateProgress ? `${(product.totalSpent / maxSpent) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-gray-300">
          <HiCube className="w-8 h-8 mb-2" />
          <p className="text-sm">لا توجد بيانات منتجات</p>
        </div>
      )}
    </div>
  );
}
