const topProducts = [
  { name: 'Cappuccino', sold: 48, revenue: 216.00 },
  { name: 'Latte', sold: 42, revenue: 210.00 },
  { name: 'Club Sandwich', sold: 35, revenue: 262.50 },
  { name: 'Frappuccino', sold: 30, revenue: 180.00 },
  { name: 'Croissant', sold: 28, revenue: 84.00 },
];

export default function TopProducts() {
  const maxSold = Math.max(...topProducts.map((p) => p.sold));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-bold text-gray-800 mb-4">Top Products</h3>
      <div className="space-y-4">
        {topProducts.map((product, idx) => (
          <div key={product.name} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 truncate">{product.name}</span>
                <span className="text-xs text-gray-400 ml-2">{product.sold} sold</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(product.sold / maxSold) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-800 ml-2">${product.revenue.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
