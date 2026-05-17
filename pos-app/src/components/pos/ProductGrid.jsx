import { useSelector, useDispatch } from 'react-redux';
import { selectFilteredProducts, setSearchQuery, setSelectedCategory } from '../../features/products/productsSlice';
import { categories } from '../../data/sampleData';
import ProductCard from './ProductCard';
import SearchBar from '../ui/SearchBar';

const categoryLabels = {
  'All': 'الكل',
  'Hot Drinks': 'مشروبات ساخنة',
  'Cold Drinks': 'مشروبات باردة',
  'Pastries': 'معجنات',
  'Food': 'طعام',
};

export default function ProductGrid() {
  const dispatch = useDispatch();
  const products = useSelector(selectFilteredProducts);
  const { searchQuery, selectedCategory } = useSelector((state) => state.products);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={(val) => dispatch(setSearchQuery(val))}
          placeholder="ابحث عن المنتجات..."
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => dispatch(setSelectedCategory(cat))}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
              ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-white text-gray-600 hover:bg-primary-50 border border-gray-200'
              }
            `}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-lg font-medium">لا توجد منتجات</p>
            <p className="text-sm mt-1">جرب تعديل البحث أو الفئة</p>
          </div>
        )}
      </div>
    </div>
  );
}
