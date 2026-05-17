import { useSelector } from 'react-redux';
import { selectTodayStats } from '../features/orders/ordersSlice';
import { HiCurrencyDollar, HiShoppingBag, HiTrendingUp, HiUsers } from 'react-icons/hi';
import StatCard from '../components/dashboard/StatCard';
import SalesChart from '../components/dashboard/SalesChart';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopProducts from '../components/dashboard/TopProducts';

export default function Dashboard() {
  const stats = useSelector(selectTodayStats);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={HiCurrencyDollar}
          trend={12.5}
          color="primary"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={HiShoppingBag}
          trend={8.2}
          color="blue"
        />
        <StatCard
          title="Avg. Order Value"
          value={`$${stats.averageOrder.toFixed(2)}`}
          icon={HiTrendingUp}
          trend={-2.4}
          color="green"
        />
        <StatCard
          title="Customers Today"
          value={stats.completedOrders}
          icon={HiUsers}
          trend={5.1}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <TopProducts />
      </div>

      <RecentOrders />
    </div>
  );
}
