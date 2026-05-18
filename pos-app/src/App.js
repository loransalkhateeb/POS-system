import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import CreatePurchase from './pages/CreatePurchase';
import SalesReport from './pages/SalesReport';
import MyTransactions from './pages/MyTransactions';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="purchases/create" element={<CreatePurchase />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="my-transactions" element={<MyTransactions />} />
          <Route path="users" element={<Users />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
