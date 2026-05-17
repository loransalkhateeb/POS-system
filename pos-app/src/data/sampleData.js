export const sampleProducts = [
  { id: 1, name: 'Espresso', price: 3.50, category: 'Hot Drinks', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=200', stock: 100 },
  { id: 2, name: 'Cappuccino', price: 4.50, category: 'Hot Drinks', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200', stock: 80 },
  { id: 3, name: 'Latte', price: 5.00, category: 'Hot Drinks', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200', stock: 90 },
  { id: 4, name: 'Mocha', price: 5.50, category: 'Hot Drinks', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=200', stock: 70 },
  { id: 5, name: 'Iced Americano', price: 4.00, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200', stock: 60 },
  { id: 6, name: 'Iced Latte', price: 5.50, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=200', stock: 55 },
  { id: 7, name: 'Frappuccino', price: 6.00, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200', stock: 45 },
  { id: 8, name: 'Smoothie Berry', price: 6.50, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=200', stock: 40 },
  { id: 9, name: 'Croissant', price: 3.00, category: 'Pastries', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=200', stock: 50 },
  { id: 10, name: 'Muffin', price: 3.50, category: 'Pastries', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200', stock: 45 },
  { id: 11, name: 'Bagel', price: 4.00, category: 'Pastries', image: 'https://images.unsplash.com/photo-1585535936944-ae57e8e9a52e?w=200', stock: 35 },
  { id: 12, name: 'Cheesecake', price: 5.50, category: 'Pastries', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200', stock: 25 },
  { id: 13, name: 'Club Sandwich', price: 7.50, category: 'Food', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200', stock: 30 },
  { id: 14, name: 'Caesar Salad', price: 8.00, category: 'Food', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200', stock: 20 },
  { id: 15, name: 'Pasta Bowl', price: 9.50, category: 'Food', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200', stock: 25 },
  { id: 16, name: 'Chicken Wrap', price: 7.00, category: 'Food', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200', stock: 30 },
];

export const sampleOrders = [
  { id: 'ORD-001', items: [{ name: 'Espresso', qty: 2, price: 3.50 }, { name: 'Croissant', qty: 1, price: 3.00 }], total: 10.00, status: 'completed', date: '2026-05-17 09:15', customer: 'Walk-in', paymentMethod: 'Cash' },
  { id: 'ORD-002', items: [{ name: 'Latte', qty: 1, price: 5.00 }, { name: 'Muffin', qty: 2, price: 3.50 }], total: 12.00, status: 'completed', date: '2026-05-17 09:45', customer: 'Walk-in', paymentMethod: 'Card' },
  { id: 'ORD-003', items: [{ name: 'Club Sandwich', qty: 1, price: 7.50 }, { name: 'Iced Latte', qty: 1, price: 5.50 }], total: 13.00, status: 'completed', date: '2026-05-17 10:30', customer: 'John D.', paymentMethod: 'Card' },
  { id: 'ORD-004', items: [{ name: 'Cappuccino', qty: 3, price: 4.50 }], total: 13.50, status: 'pending', date: '2026-05-17 11:00', customer: 'Walk-in', paymentMethod: 'Cash' },
  { id: 'ORD-005', items: [{ name: 'Frappuccino', qty: 2, price: 6.00 }, { name: 'Cheesecake', qty: 1, price: 5.50 }], total: 17.50, status: 'completed', date: '2026-05-17 11:30', customer: 'Sarah M.', paymentMethod: 'Card' },
  { id: 'ORD-006', items: [{ name: 'Pasta Bowl', qty: 1, price: 9.50 }, { name: 'Smoothie Berry', qty: 1, price: 6.50 }], total: 16.00, status: 'completed', date: '2026-05-17 12:00', customer: 'Walk-in', paymentMethod: 'Cash' },
  { id: 'ORD-007', items: [{ name: 'Caesar Salad', qty: 1, price: 8.00 }, { name: 'Iced Americano', qty: 1, price: 4.00 }], total: 12.00, status: 'pending', date: '2026-05-17 12:30', customer: 'Mike R.', paymentMethod: 'Card' },
  { id: 'ORD-008', items: [{ name: 'Chicken Wrap', qty: 2, price: 7.00 }, { name: 'Mocha', qty: 2, price: 5.50 }], total: 25.00, status: 'completed', date: '2026-05-17 13:00', customer: 'Walk-in', paymentMethod: 'Cash' },
];

export const categories = ['All', 'Hot Drinks', 'Cold Drinks', 'Pastries', 'Food'];
