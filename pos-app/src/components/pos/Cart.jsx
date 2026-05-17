import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearCart,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
} from '../../features/cart/cartSlice';
import { addOrder } from '../../features/orders/ordersSlice';
import { HiShoppingCart, HiTrash } from 'react-icons/hi';
import CartItem from './CartItem';
import Button from '../ui/Button';
import CheckoutModal from './CheckoutModal';

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const subtotal = useSelector(selectCartSubtotal);
  const tax = useSelector(selectCartTax);
  const total = useSelector(selectCartTotal);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = (paymentMethod) => {
    const order = {
      id: `ORD-${String(Date.now()).slice(-6)}`,
      items: cartItems.map((item) => ({ name: item.name, qty: item.quantity, price: item.price })),
      total: Number(total.toFixed(2)),
      status: 'completed',
      date: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
      customer: 'Walk-in',
      paymentMethod,
    };
    dispatch(addOrder(order));
    dispatch(clearCart());
    setShowCheckout(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiShoppingCart className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-gray-800">Current Order</h3>
            {cartItems.length > 0 && (
              <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <HiTrash className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <HiShoppingCart className="w-12 h-12 mb-2" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Add items to get started</p>
            </div>
          ) : (
            cartItems.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-dashed border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowCheckout(true)}
            >
              Charge ${total.toFixed(2)}
            </Button>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        total={total}
        onCheckout={handleCheckout}
      />
    </>
  );
}
