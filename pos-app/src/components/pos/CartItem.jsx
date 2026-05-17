import { useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, removeFromCart } from '../../features/cart/cartSlice';
import { HiPlus, HiMinus, HiTrash } from 'react-icons/hi';

export default function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 group">
      <img
        src={item.image}
        alt={item.name}
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
        <p className="text-sm text-primary-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => dispatch(decrementQuantity(item.id))}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          <HiMinus className="w-3 h-3 text-gray-500" />
        </button>
        <span className="w-7 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
        <button
          onClick={() => dispatch(incrementQuantity(item.id))}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-primary-50 hover:border-primary-200 transition-colors"
        >
          <HiPlus className="w-3 h-3 text-gray-500" />
        </button>
      </div>
      <button
        onClick={() => dispatch(removeFromCart(item.id))}
        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
      >
        <HiTrash className="w-4 h-4" />
      </button>
    </div>
  );
}
