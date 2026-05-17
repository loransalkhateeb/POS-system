import { useSelector } from 'react-redux';
import Badge from '../ui/Badge';

const statusColors = {
  completed: 'green',
  pending: 'yellow',
  cancelled: 'red',
};

export default function RecentOrders() {
  const orders = useSelector((state) => state.orders.items);
  const recent = orders.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-base font-bold text-gray-800 mb-4">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Order ID</th>
              <th className="pb-3 pr-4 hidden sm:table-cell">Customer</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recent.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50">
                <td className="py-3 pr-4">
                  <span className="text-sm font-semibold text-primary-600">{order.id}</span>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">{order.customer}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-sm font-semibold text-gray-800">${order.total.toFixed(2)}</span>
                </td>
                <td className="py-3 pr-4">
                  <Badge color={statusColors[order.status]}>{order.status}</Badge>
                </td>
                <td className="py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-400">{order.date.split(' ')[1]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
