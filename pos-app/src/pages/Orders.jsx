import { useSelector, useDispatch } from 'react-redux';
import { selectFilteredOrders, setOrderFilter, updateOrderStatus } from '../features/orders/ordersSlice';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { HiCheck, HiX } from 'react-icons/hi';

const filters = [
  { value: 'all', label: 'جميع الطلبات' },
  { value: 'completed', label: 'مكتملة' },
  { value: 'pending', label: 'قيد الانتظار' },
];

const statusColors = {
  completed: 'green',
  pending: 'yellow',
  cancelled: 'red',
};

const statusLabels = {
  completed: 'مكتمل',
  pending: 'قيد الانتظار',
  cancelled: 'ملغي',
};

const paymentLabels = {
  Cash: 'نقداً',
  Card: 'بطاقة',
};

export default function Orders() {
  const dispatch = useDispatch();
  const orders = useSelector(selectFilteredOrders);
  const currentFilter = useSelector((state) => state.orders.filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => dispatch(setOrderFilter(f.value))}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
              ${
                currentFilter === f.value
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-white text-gray-600 hover:bg-primary-50 border border-gray-200'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {orders.map((order) => (
          <Card key={order.id} className="!p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-600">#</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-800">{order.id}</h4>
                    <Badge color={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                    <Badge color="blue">{paymentLabels[order.paymentMethod] || order.paymentMethod}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.customer} &middot; {order.date}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {order.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
                      >
                        {item.qty}× {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span className="text-lg font-bold text-gray-800">${order.total.toFixed(2)}</span>
                {order.status === 'pending' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => dispatch(updateOrderStatus({ id: order.id, status: 'completed' }))}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                      title="إكمال"
                    >
                      <HiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => dispatch(updateOrderStatus({ id: order.id, status: 'cancelled' }))}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="إلغاء"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">لا توجد طلبات</p>
          <p className="text-sm mt-1">ستظهر الطلبات هنا بعد إنشائها</p>
        </div>
      )}
    </div>
  );
}
