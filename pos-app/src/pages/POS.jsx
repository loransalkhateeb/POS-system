import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../features/cart/cartSlice';
import { HiShoppingCart } from 'react-icons/hi';
import ProductGrid from '../components/pos/ProductGrid';
import Cart from '../components/pos/Cart';

export default function POS() {
  const [showMobileCart, setShowMobileCart] = useState(false);
  const cartCount = useSelector(selectCartItemCount);

  return (
    <div className="flex gap-4 h-[calc(100vh-7.5rem)]">
      <div className="flex-1 min-w-0">
        <ProductGrid />
      </div>

      <div className="hidden lg:block w-96">
        <Cart />
      </div>

      <button
        onClick={() => setShowMobileCart(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-500 text-white rounded-full shadow-xl shadow-primary-500/30 flex items-center justify-center active:scale-95 transition-transform"
      >
        <HiShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
      </button>

      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-gray-50 rounded-t-3xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="p-4 h-full">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <Cart />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
