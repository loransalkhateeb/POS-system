import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, deleteProduct } from '../features/products/productsSlice';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

export default function Products() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 'Hot Drinks', stock: '', image: '' });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    dispatch(
      addProduct({
        id: Date.now(),
        name: form.name,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        image: form.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200',
      })
    );
    setForm({ name: '', price: '', category: 'Hot Drinks', stock: '', image: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <Button icon={HiPlus} onClick={() => setShowForm(true)}>
          Add Product
        </Button>
      </div>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3 hidden sm:table-cell">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3 hidden md:table-cell">Stock</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="text-sm font-semibold text-gray-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <Badge color="purple">{product.category}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-gray-800">${product.price.toFixed(2)}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-sm font-medium ${product.stock < 20 ? 'text-red-500' : 'text-gray-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors">
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => dispatch(deleteProduct(product.id))}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Product">
        <div className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Caramel Macchiato"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Stock"
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option>Hot Drinks</option>
              <option>Cold Drinks</option>
              <option>Pastries</option>
              <option>Food</option>
            </select>
          </div>
          <Input
            label="Image URL (optional)"
            placeholder="https://..."
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Add Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
