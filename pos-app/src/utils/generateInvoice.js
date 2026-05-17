export default function generateInvoice(purchase) {
  const date = new Date(purchase.purchaseDate);
  const formattedDate = date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsRows = purchase.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;text-align:center;color:#6b7280;">${i + 1}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;">
          <div style="font-weight:600;color:#1f2937;">${item.product.name}</div>
          <div style="font-size:11px;color:#9ca3af;margin-top:2px;">باركود: ${item.product.barcode}</div>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151;">${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151;">$${item.purchasePrice.toFixed(2)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;text-align:center;font-weight:700;color:#6A0DAD;">$${item.totalPrice.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>فاتورة ${purchase.invoiceNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Cairo',sans-serif; background:#f8f9fc; padding:0; }
    @media print {
      body { background:#fff; padding:0; }
      .no-print { display:none !important; }
      .invoice-container { box-shadow:none !important; margin:0 !important; border-radius:0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;padding:20px;">
    <button onclick="window.print()" style="
      background:#6A0DAD;color:#fff;border:none;padding:12px 32px;border-radius:12px;
      font-family:'Cairo',sans-serif;font-size:14px;font-weight:700;cursor:pointer;
      box-shadow:0 4px 12px rgba(106,13,173,0.3);
    ">طباعة / تحميل PDF</button>
  </div>

  <div class="invoice-container" style="
    max-width:800px;margin:0 auto 40px;background:#fff;border-radius:16px;
    box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;
  ">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a0330,#6A0DAD);padding:40px;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            </div>
            <div>
              <h1 style="font-size:24px;font-weight:800;letter-spacing:-0.5px;">Havana House</h1>
              <p style="font-size:12px;opacity:0.7;">نظام إدارة المبيعات</p>
            </div>
          </div>
        </div>
        <div style="text-align:left;">
          <div style="background:rgba(255,255,255,0.15);padding:8px 16px;border-radius:10px;margin-bottom:8px;">
            <p style="font-size:11px;opacity:0.7;">رقم الفاتورة</p>
            <p style="font-size:20px;font-weight:800;letter-spacing:1px;">${purchase.invoiceNumber}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div style="padding:30px 40px;display:flex;justify-content:space-between;border-bottom:1px solid #f3f4f6;flex-wrap:wrap;gap:20px;">
      <div>
        <p style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">معلومات الفاتورة</p>
        <table style="font-size:13px;color:#374151;">
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">التاريخ:</td>
            <td style="padding:4px 0;font-weight:600;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">الوقت:</td>
            <td style="padding:4px 0;font-weight:600;">${formattedTime}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">المورد:</td>
            <td style="padding:4px 0;font-weight:600;">${purchase.supplier?.name || 'بدون مورد'}</td>
          </tr>
        </table>
      </div>
      <div>
        <p style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">أنشئ بواسطة</p>
        <table style="font-size:13px;color:#374151;">
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">الاسم:</td>
            <td style="padding:4px 0;font-weight:600;">${purchase.createdBy?.name || '-'}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">البريد:</td>
            <td style="padding:4px 0;font-weight:600;">${purchase.createdBy?.email || '-'}</td>
          </tr>
        </table>
      </div>
      <div>
        <p style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">ملخص</p>
        <table style="font-size:13px;color:#374151;">
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">عدد العناصر:</td>
            <td style="padding:4px 0;font-weight:600;">${purchase.itemsCount}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;padding-left:16px;color:#9ca3af;">إجمالي الكمية:</td>
            <td style="padding:4px 0;font-weight:600;">${purchase.totalQuantity} وحدة</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Items Table -->
    <div style="padding:30px 40px;">
      <p style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">تفاصيل العناصر</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:12px 16px;text-align:center;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">#</th>
            <th style="padding:12px 16px;text-align:right;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">المنتج</th>
            <th style="padding:12px 16px;text-align:center;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">الكمية</th>
            <th style="padding:12px 16px;text-align:center;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">سعر الوحدة</th>
            <th style="padding:12px 16px;text-align:center;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- Total Section -->
    <div style="padding:0 40px 40px;">
      <div style="display:flex;justify-content:flex-start;">
        <div style="min-width:280px;background:#f9fafb;border-radius:12px;padding:20px 24px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:13px;color:#6b7280;">المجموع الفرعي</span>
            <span style="font-size:13px;font-weight:600;color:#374151;">$${purchase.totalAmount.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <span style="font-size:13px;color:#6b7280;">الضريبة</span>
            <span style="font-size:13px;font-weight:600;color:#374151;">$0.00</span>
          </div>
          <div style="border-top:2px dashed #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:15px;font-weight:700;color:#1f2937;">المبلغ الإجمالي</span>
            <span style="font-size:22px;font-weight:800;color:#6A0DAD;">$${purchase.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="font-size:12px;color:#9ca3af;">شكراً لتعاملكم معنا - Havana House</p>
      <p style="font-size:11px;color:#d1d5db;margin-top:4px;">تم إنشاء هذه الفاتورة تلقائياً بواسطة نظام Havana House</p>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
}
