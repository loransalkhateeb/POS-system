import { useState } from 'react';
import Badge from '../ui/Badge';
import { HiChevronDown, HiChevronUp, HiDocumentText, HiDownload } from 'react-icons/hi';
import generateInvoice from '../../utils/generateInvoice';

function PurchaseRow({ purchase, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-primary-50/30 transition-colors cursor-pointer"
        style={{ animationDelay: `${index * 80}ms` }}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <HiDocumentText className="w-4 h-4 text-primary-500" />
            </div>
            <span className="text-sm font-bold text-primary-600">{purchase.invoiceNumber}</span>
          </div>
        </td>
        <td className="px-4 py-3.5 hidden sm:table-cell">
          <span className="text-sm text-gray-600">{purchase.supplier?.name || 'بدون مورد'}</span>
        </td>
        <td className="px-4 py-3.5 hidden md:table-cell">
          <Badge color="purple">{purchase.itemsCount} عنصر</Badge>
        </td>
        <td className="px-4 py-3.5 hidden md:table-cell">
          <span className="text-sm text-gray-600">{purchase.totalQuantity} وحدة</span>
        </td>
        <td className="px-4 py-3.5">
          <span className="text-sm font-bold text-gray-800">${purchase.totalAmount.toFixed(2)}</span>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <div>
            <p className="text-sm text-gray-600">{purchase.createdBy?.name}</p>
            <p className="text-xs text-gray-400">{purchase.createdBy?.email}</p>
          </div>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <span className="text-xs text-gray-400">
            {new Date(purchase.purchaseDate).toLocaleDateString('ar-EG', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                generateInvoice(purchase);
              }}
              className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-all duration-200 group"
              title="تحميل الفاتورة"
            >
              <HiDownload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {expanded ? (
                <HiChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <HiChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="animate-fadeIn">
          <td colSpan="8" className="px-4 py-3">
            <div className="bg-gray-50/80 rounded-xl p-4 mr-10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">تفاصيل العناصر</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateInvoice(purchase);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all active:scale-95 shadow-sm shadow-primary-500/25"
                >
                  <HiDownload className="w-3.5 h-3.5" />
                  تحميل الفاتورة
                </button>
              </div>
              <div className="space-y-2">
                {purchase.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{item.product.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{item.product.name}</p>
                        <p className="text-xs text-gray-400">باركود: {item.product.barcode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">الكمية</p>
                        <p className="text-sm font-bold text-gray-700">{item.quantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">سعر الشراء</p>
                        <p className="text-sm font-bold text-gray-700">${item.purchasePrice.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">الإجمالي</p>
                        <p className="text-sm font-bold text-primary-600">${item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function PurchasesTable({ purchases = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-800">المشتريات الأخيرة</h3>
            <p className="text-xs text-gray-400 mt-0.5">{purchases.length} عملية شراء</p>
          </div>
        </div>
      </div>

      {purchases.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">الفاتورة</th>
                <th className="px-4 py-3 hidden sm:table-cell">المورد</th>
                <th className="px-4 py-3 hidden md:table-cell">العناصر</th>
                <th className="px-4 py-3 hidden md:table-cell">الكمية</th>
                <th className="px-4 py-3">المبلغ</th>
                <th className="px-4 py-3 hidden lg:table-cell">أنشئ بواسطة</th>
                <th className="px-4 py-3 hidden lg:table-cell">التاريخ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {purchases.map((purchase, idx) => (
                <PurchaseRow key={purchase.id} purchase={purchase} index={idx} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
          <HiDocumentText className="w-10 h-10 mb-2" />
          <p className="text-sm font-medium">لا توجد مشتريات</p>
          <p className="text-xs mt-1">جرب تغيير التاريخ أو الفترة</p>
        </div>
      )}
    </div>
  );
}
