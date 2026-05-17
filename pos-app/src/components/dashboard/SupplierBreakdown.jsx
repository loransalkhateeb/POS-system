import { HiTruck } from 'react-icons/hi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6A0DAD', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function SupplierBreakdown({ data = {} }) {
  const suppliers = Object.entries(data).map(([name, info]) => ({
    name: name === 'No Supplier' ? 'بدون مورد' : name,
    purchases: info.purchases,
    totalAmount: info.totalAmount,
  }));

  const totalAmount = suppliers.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-800">تفاصيل الموردين</h3>
          <p className="text-xs text-gray-400 mt-0.5">الإنفاق حسب المورد</p>
        </div>
        <div className="p-2 rounded-xl bg-blue-50">
          <HiTruck className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {suppliers.length > 0 ? (
        <div className="flex flex-col items-center">
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={suppliers}
                  dataKey="totalAmount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {suppliers.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    padding: '10px 14px',
                    direction: 'rtl',
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'المبلغ']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-2 mt-2">
            {suppliers.map((supplier, idx) => (
              <div key={supplier.name} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-sm font-medium text-gray-700">{supplier.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{supplier.purchases} طلب</span>
                  <span className="text-sm font-bold text-gray-800">${supplier.totalAmount.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                    {totalAmount > 0 ? ((supplier.totalAmount / totalAmount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-gray-300">
          <HiTruck className="w-8 h-8 mb-2" />
          <p className="text-sm">لا توجد بيانات موردين</p>
        </div>
      )}
    </div>
  );
}
