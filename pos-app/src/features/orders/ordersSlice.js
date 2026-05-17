import { createSlice } from '@reduxjs/toolkit';
import { sampleOrders } from '../../data/sampleData';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: sampleOrders,
    filter: 'all',
  },
  reducers: {
    addOrder: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.items.find((o) => o.id === id);
      if (order) order.status = status;
    },
    setOrderFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { addOrder, updateOrderStatus, setOrderFilter } = ordersSlice.actions;

export const selectFilteredOrders = (state) => {
  const { items, filter } = state.orders;
  if (filter === 'all') return items;
  return items.filter((order) => order.status === filter);
};

export const selectTodayStats = (state) => {
  const orders = state.orders.items;
  const completed = orders.filter((o) => o.status === 'completed');
  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    totalRevenue: completed.reduce((sum, o) => sum + o.total, 0),
    averageOrder: completed.length > 0
      ? completed.reduce((sum, o) => sum + o.total, 0) / completed.length
      : 0,
  };
};

export default ordersSlice.reducer;
