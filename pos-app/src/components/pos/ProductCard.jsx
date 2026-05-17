import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { HiPlus } from 'react-icons/hi';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(addToCart(product))}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-200 active:scale-[0.97] text-left group"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <HiPlus className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-bold text-primary-600">${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-400">{product.stock} in stock</span>
        </div>
      </div>
    </button>
  );
}
