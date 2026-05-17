import { HiCash, HiCreditCard } from 'react-icons/hi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function CheckoutModal({ isOpen, onClose, total, onCheckout }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إتمام الدفع" size="sm">
      <div className="space-y-4">
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
          <p className="text-4xl font-bold text-primary-600 mt-1">
            ${total.toFixed(2)}
          </p>
        </div>

        <p className="text-sm font-medium text-gray-600 text-center">اختر طريقة الدفع</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onCheckout('Cash')}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
          >
            <HiCash className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <span className="text-sm font-semibold text-gray-700">نقداً</span>
          </button>
          <button
            onClick={() => onCheckout('Card')}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
          >
            <HiCreditCard className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <span className="text-sm font-semibold text-gray-700">بطاقة</span>
          </button>
        </div>

        <Button variant="ghost" className="w-full" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
