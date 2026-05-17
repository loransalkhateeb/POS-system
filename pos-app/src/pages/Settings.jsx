import { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { HiOfficeBuilding, HiCurrencyDollar, HiPrinter, HiUser } from 'react-icons/hi';

export default function Settings() {
  const [settings, setSettings] = useState({
    storeName: 'متجر Havana House',
    currency: 'USD',
    taxRate: '10',
    receiptFooter: 'شكراً لتسوقكم معنا!',
    adminName: 'المسؤول',
    adminEmail: 'admin@quickpos.com',
  });

  const update = (key, value) => setSettings({ ...settings, [key]: value });

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-primary-50">
            <HiOfficeBuilding className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">معلومات المتجر</h3>
            <p className="text-xs text-gray-400">إعدادات المتجر الأساسية</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input
            label="اسم المتجر"
            value={settings.storeName}
            onChange={(e) => update('storeName', e.target.value)}
          />
          <Input
            label="رسالة أسفل الإيصال"
            value={settings.receiptFooter}
            onChange={(e) => update('receiptFooter', e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-blue-50">
            <HiCurrencyDollar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">الضريبة والعملة</h3>
            <p className="text-xs text-gray-400">الإعدادات المالية</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">العملة</label>
            <select
              value={settings.currency}
              onChange={(e) => update('currency', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="USD">دولار ($)</option>
              <option value="EUR">يورو (&euro;)</option>
              <option value="GBP">جنيه إسترليني (&pound;)</option>
              <option value="IQD">دينار عراقي (د.ع)</option>
            </select>
          </div>
          <Input
            label="نسبة الضريبة (%)"
            type="number"
            value={settings.taxRate}
            onChange={(e) => update('taxRate', e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-50">
            <HiUser className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">الملف الشخصي</h3>
            <p className="text-xs text-gray-400">تفاصيل حسابك</p>
          </div>
        </div>
        <div className="space-y-4">
          <Input
            label="الاسم"
            value={settings.adminName}
            onChange={(e) => update('adminName', e.target.value)}
          />
          <Input
            label="البريد الإلكتروني"
            type="email"
            value={settings.adminEmail}
            onChange={(e) => update('adminEmail', e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-orange-50">
            <HiPrinter className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">إعدادات الإيصال</h3>
            <p className="text-xs text-gray-400">إعدادات طباعة الإيصالات</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">طباعة تلقائية للإيصال</p>
            <p className="text-xs text-gray-400">طباعة الإيصال بعد كل عملية بيع</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </Card>

      <div className="flex justify-start">
        <Button size="lg">حفظ التغييرات</Button>
      </div>
    </div>
  );
}
