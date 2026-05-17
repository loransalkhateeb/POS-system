import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data = [], period }) {
  const chartData = data.map((item) => ({
    label: item.day || item.date || item.week || item.month || '',
    amount: item.totalAmount || 0,
    purchases: item.totalPurchases || 0,
    items: item.totalItems || 0,
  }));

  const periodLabel = period === 'daily' ? 'يوم' : period === 'weekly' ? 'أسبوع' : 'شهر';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-800">نظرة عامة على المشتريات</h3>
          <p className="text-xs text-gray-400 mt-0.5">المبلغ المنفق لكل {periodLabel}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span className="text-gray-500">المبلغ ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-200" />
            <span className="text-gray-500">العناصر</span>
          </div>
        </div>
      </div>
      <div className="h-64 md:h-72">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: '12px 16px',
                  direction: 'rtl',
                }}
                formatter={(value, name) => {
                  const labels = { amount: 'المبلغ', items: 'العناصر', purchases: 'المشتريات' };
                  return [name === 'amount' ? `$${value}` : value, labels[name] || name];
                }}
                cursor={{ fill: 'rgba(106,13,173,0.04)', radius: 8 }}
              />
              <Bar dataKey="amount" fill="#6A0DAD" radius={[6, 6, 0, 0]} maxBarSize={40} name="amount" />
              <Bar dataKey="items" fill="#d1a3ee" radius={[6, 6, 0, 0]} maxBarSize={40} name="items" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <p className="text-sm">لا توجد بيانات لهذه الفترة</p>
          </div>
        )}
      </div>
    </div>
  );
}
