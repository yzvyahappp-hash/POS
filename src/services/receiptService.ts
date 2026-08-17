import { Order, RestaurantSettings } from '../types';
import { formatDateUTC8, formatDateTimeUTC8 } from '../utils/dateUtils';

type PrintListener = (order: Order, settings: RestaurantSettings) => void;
const listeners: PrintListener[] = [];

const DISH_TRANSLATIONS: Record<string, string> = {
  'Truffle Mushroom Bruschetta': '黑松露野菇普斯凱塔',
  'Crispy Calamari Rings': '金黃酥炸香酥魷魚圈',
  'Caprese Salad Skewers': '卡布里義式莫札瑞拉番茄串',
  'Prime Ribeye Steak (300g)': '頂級肋眼牛排 (300g)',
  'Artisanal Wagyu Burger': '手作頂級和牛漢堡',
  'Pan-Seared Atlantic Salmon': '香煎大西洋尊爵鮭魚排',
  'Classic Creamy Carbonara': '經典羅馬奶油培根蛋黃麵',
  'Truffle Parmesan Fries': '黑松露帕瑪森起司薯條',
  'Loaded Sweet Potato Fries': '熔岩雙起司烤地瓜條',
  'Signature Citrus Passion Mocktail': '招牌百香柑橘特調氣泡飲',
  'Iced Vanilla Oat Matcha Latte': '靜岡香草燕麥奶抹茶拿鐵',
  'Craft IPA Amber Ale': '精釀 IPA 琥珀啤酒',
  'Molten Belgian Chocolate Lava Cake': '比利時黑巧克力熔岩蛋糕',
  'Classic Espresso Tiramisu': '主廚經典義式提拉米蘇',
  'Gourmet Steak & Wine Combo': '豪華肋眼牛排佐紅酒套餐',
  'Wild Garlic & Herb Roasted Chicken': '普羅旺斯大蒜香草烤半雞',
  'Charred Octopus & Potato Salad': '炭烤章魚溫洋芋沙拉',
  'Wild Mushroom Truffle Risotto': '黑松露野菇牛肝菌燉飯',
  'Smoked Jalapeño Queso Fries': '煙燻墨西哥切達起司醬薯條',
  'Wild Berry Hibiscus Sangria': '野莓洛神花桑格利亞特調',
  'Artisan Mango Coconut Panna Cotta': '手作芒果椰奶奶酪',
  'Seafood Paella & Sangria Combo': '西班牙海鮮燉飯雙人套餐',
  // Modifiers & Addons
  'Extra Truffle Oil': '加濃黑松露油',
  'Gluten Free Bread': '換無麩質麵包',
  'No Cheese': '去起司',
  'Add Poached Egg': '加水波蛋',
  'Extra Garlic Aioli': '加大蒜蛋黃醬',
  'Spicy Marinara': '附辣味番茄醬',
  'Extra Lemon': '加檸檬角',
  'Rare': '一分熟 (Rare)',
  'Medium Rare': '三分熟 (Medium Rare)',
  'Medium': '五分熟 (Medium)',
  'Medium Well': '七分熟 (Medium Well)',
  'Well Done': '全熟 (Well Done)',
  'Peppercorn Sauce': '經典黑胡椒醬',
  'Mushroom Gravy': '濃郁野菇醬',
  'No Onions': '去洋蔥',
  'Gluten-Free Bun': '換無麩質漢堡包',
  'Medium Rare Patty': '肉排三分熟',
  'Well Done Patty': '肉排全熟',
  'Extra Crispy Bacon': '加香脆培根',
  'Fried Egg': '加太陽煎蛋',
  'Crispy Skin': '鮭魚皮煎酥脆',
  'Soft Skin': '去鮭魚皮',
  'Dill Cream Sauce on Side': '茴香酸奶油醬分裝',
  'Penne Pasta': '換斜管筆管麵',
  'Spaghetti': '標準直條麵',
  'Extra Pecorino Cheese': '加佩克里諾起司',
  'Extra Cheese': '加起司絲',
  'Ranch Sauce on Side': '鄉村醬分裝',
  'Ketchup': '附番茄醬',
  'Less Ice': '少冰',
  'No Ice': '去冰',
  'Extra Mint': '加薄荷葉',
  'Less Sugar': '微糖',
  'Oat Milk': '燕麥奶',
  'Almond Milk': '換杏仁奶',
  'Whole Milk': '換全脂鮮奶',
  'No Syrup': '不加糖漿',
  'Extra Gelato Scoop': '加一球香草冰淇淋',
  'Extra Garlic Butter': '加蒜香奶油',
  'No Skin': '去雞皮',
  'Skin On Crispy': '雞皮煎酥脆',
  'No Paprika': '去紅椒粉',
  'Gluten Free': '無麩質',
  'Extra Parmesan Crisp': '加起司薄餅',
  'No Dairy': '去乳製品',
  'Extra Berries': '加綜合野莓',
  'No Sugar Added': '不加糖',
};

export function translateText(str?: string): string {
  if (!str) return '';
  return DISH_TRANSLATIONS[str] || str;
}

export function translateOrderType(type?: string): string {
  if (!type) return '內用';
  const lower = type.toLowerCase();
  if (lower.includes('dine') || lower.includes('內用')) return '內用';
  if (lower.includes('take') || lower.includes('pick') || lower.includes('外帶')) return '外帶';
  if (lower.includes('delivery') || lower.includes('外送')) return '外送';
  return type;
}

export function translatePaymentMethod(method?: string): string {
  if (!method) return '尚未付款';
  if (method === 'Paid') return '已付款';
  if (method === 'Unpaid') return '未付款';
  if (method.toLowerCase().includes('cash') || method.includes('現金')) return '現金付款';
  if (method.toLowerCase().includes('credit') || method.includes('信用卡')) return '信用卡';
  if (method.toLowerCase().includes('line')) return 'LINE Pay';
  if (method.toLowerCase().includes('apple')) return 'Apple Pay';
  if (method.toLowerCase().includes('qr')) return 'QR 碼支付';
  return method;
}

export function translatePaymentStatus(status?: string): string {
  if (status === 'Paid' || status === '已付款') return '已結帳';
  if (status === 'Unpaid' || status === '未付款') return '待結帳';
  if (status === 'Refunded' || status === '已退款') return '已退款';
  return status || '待結帳';
}

export const HANDWRITING_FONT = "'手札體', 'Zen Kurenaido', 'DFKai-SB', '標楷體', 'Caveat', cursive, sans-serif";

export const RECEIPT_FONTS = [
  {
    id: 'handwriting',
    name: '✍️ 手札體',
    family: HANDWRITING_FONT,
  },
];

export const receiptService = {
  subscribe(listener: PrintListener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },

  generateReceiptHTML(order: Order, settings: RestaurantSettings, _fontFamily?: string): string {
    const safeSettings = settings || {
      restaurantName: 'Grand Bistro & Grill 格蘭小酒館＆炭烤餐廳',
      logoUrl: '',
      address: '桃園市桃園區中正路 368 號',
      phone: '03-356-7284',
      email: 'info@grandbistro.com',
      currency: 'TWD',
      taxRate: 8,
      serviceChargeRate: 5,
      receiptHeader: '感謝光臨 Grand Bistro 美食餐廳！',
      receiptFooter: '歡迎再次光臨！顧客 Wi-Fi: BistroGuest2026',
      tableCount: 16,
      autoKdsSync: true,
    };

    const chosenFont = HANDWRITING_FONT;
    const dateStr = formatDateUTC8(order.createdAt);
    const cleanOrderNum = order.orderNumber || '0000';
    const documentTitle = `訂單-${cleanOrderNum}-明細-${dateStr}`;

    const itemsHTML = (order.items || [])
      .map(
        item => {
          const translatedName = translateText(item.name);
          const translatedMods = (item.modifiers || []).map(m => translateText(m));
          const translatedAddOns = (item.addOns || []).map(a => ({ ...a, name: translateText(a.name) }));

          return `
      <tr>
        <td style="padding: 4px 0; text-align: left; vertical-align: top;">
          <strong>${item.quantity}x ${translatedName}</strong>
          ${translatedMods && translatedMods.length ? `<div style="font-size: 11px; color: #555; margin-left: 8px;">• ${translatedMods.join(', ')}</div>` : ''}
          ${translatedAddOns && translatedAddOns.length ? `<div style="font-size: 11px; color: #555; margin-left: 8px;">+ ${translatedAddOns.map(a => a.name).join(', ')}</div>` : ''}
        </td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `;
        }
      )
      .join('');

    const formattedOrderType = translateOrderType(order.type);
    const formattedCustomer = order.customerName || '散客 / 現場顧客';
    const formattedServer = order.createdBy || '門市服務員';
    const formattedPayMethod = translatePaymentMethod(order.paymentMethod);
    const formattedPayStatus = translatePaymentStatus(order.paymentStatus);

    // Calculate detailed discount components and total combined discount
    const subtotal = order.subtotal || order.totalAmount || 0;
    const promoDiscount =
      order.promoDiscountAmount ||
      (order.appliedPromos && order.appliedPromos.length > 0
        ? order.appliedPromos.reduce((sum, p) => sum + (p.discountAmount || 0), 0)
        : 0);

    const pointsDiscount = order.pointsDiscountAmount || 0;

    const couponDiscount =
      order.couponDiscountAmount ||
      (order.couponCode && (order.discountAmount || 0) > 0 && !promoDiscount && !pointsDiscount
        ? order.discountAmount
        : 0);

    const percentageDiscount =
      order.percentageDiscountAmount ||
      ((order.discountPercentage || 0) > 0
        ? (subtotal * order.discountPercentage) / 100
        : 0);

    const manualDiscount =
      (order.discountAmount || 0) > 0 &&
      !(promoDiscount || pointsDiscount || couponDiscount || percentageDiscount)
        ? order.discountAmount || 0
        : 0;

    const computedSum = promoDiscount + pointsDiscount + couponDiscount + percentageDiscount + manualDiscount;
    const totalCombinedDiscount = Math.max(order.discountAmount || 0, computedSum);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentTitle}</title>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Zen+Kurenaido&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: ${chosenFont};
            width: 300px;
            margin: 0 auto;
            padding: 16px;
            color: #111;
            background: #fff;
            font-size: 13px;
            line-height: 1.4;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .divider { border-bottom: 1px dashed #333; margin: 8px 0; }
          .double-divider { border-bottom: 2px double #333; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          .bold { font-weight: bold; }
          .receipt-header { margin-bottom: 12px; }
          .receipt-header img { max-height: 50px; margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="receipt-header text-center">
          ${safeSettings.logoUrl ? `<img src="${safeSettings.logoUrl}" alt="Logo" /><br/>` : ''}
          <div style="font-size: 18px;" class="bold">${safeSettings.restaurantName}</div>
          <div>${safeSettings.address}</div>
          <div>電話: ${safeSettings.phone}</div>
          <div style="font-size: 11px; margin-top: 4px;">${safeSettings.receiptHeader || '感謝光臨！'}</div>
        </div>

        <div class="divider"></div>

        <div>
          <div><strong>訂單編號:</strong> ${order.orderNumber} (${formattedOrderType})</div>
          <div><strong>桌號:</strong> ${order.tableName || '未指定'}</div>
          <div><strong>顧客:</strong> ${formattedCustomer}</div>
          <div><strong>日期時間:</strong> ${formatDateTimeUTC8(order.createdAt)}</div>
          <div><strong>服務員:</strong> ${formattedServer}</div>
        </div>

        ${
          order.customerName && order.customerName.toLowerCase() !== 'guest'
            ? `<div style="margin: 8px 0; padding: 6px; border: 1px dashed #555; background: #fafafa; font-size: 11px; border-radius: 4px;">
                <div class="bold" style="font-size: 11px; margin-bottom: 2px; color: #222;">⭐ 會員點數明細 (Loyalty Points)</div>
                <div>目前累積點數餘額 (Balance): <strong>${order.customerPointsBalance !== undefined ? order.customerPointsBalance : '---'} pts</strong></div>
                ${(order.pointsRedeemed || 0) > 0 ? `<div style="color: #c53030; font-weight: bold;">本次使用點數 (Redeemed): -${order.pointsRedeemed} pts (-$${(order.pointsDiscountAmount || 0).toFixed(2)})</div>` : '<div style="color: #666;">本次未折抵點數 (No Points Used)</div>'}
              </div>`
            : ''
        }

        <div class="divider"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px solid #333;">
              <th style="text-align: left; padding-bottom: 4px;">餐點品項</th>
              <th style="text-align: right; padding-bottom: 4px;">金額</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="divider"></div>

        <table>
          <tr>
            <td>小計金額 (Subtotal):</td>
            <td class="text-right">$${subtotal.toFixed(2)}</td>
          </tr>
          ${
            totalCombinedDiscount > 0
              ? `${
                  order.appliedPromos && order.appliedPromos.length > 0
                    ? order.appliedPromos
                        .map(
                          p => `<tr style="color: #047857;">
                  <td>🎁 優惠: ${p.title} (${p.reason})</td>
                  <td class="text-right">-$${p.discountAmount.toFixed(2)}</td>
                </tr>`
                        )
                        .join('')
                    : promoDiscount > 0
                    ? `<tr style="color: #047857;">
                  <td>🎁 自動組合/滿額特惠 (Auto Promo):</td>
                  <td class="text-right">-$${promoDiscount.toFixed(2)}</td>
                </tr>`
                    : ''
                }
                ${
                  pointsDiscount > 0
                    ? `<tr>
                  <td>🌟 會員點數折抵 (${order.pointsRedeemed || 0} pts):</td>
                  <td class="text-right">-$${pointsDiscount.toFixed(2)}</td>
                </tr>`
                    : ''
                }
                ${
                  couponDiscount > 0 || (order.couponCode && order.couponCode.trim() !== '')
                    ? `<tr>
                  <td>🏷️ 優惠券折抵 (${order.couponCode || '折價券'}):</td>
                  <td class="text-right">-$${(couponDiscount || (order.discountAmount && !promoDiscount && !pointsDiscount ? order.discountAmount : 0)).toFixed(2)}</td>
                </tr>`
                    : ''
                }
                ${
                  percentageDiscount > 0 || manualDiscount > 0 || (order.discountPercentage || 0) > 0 || (order.discountAmount && !promoDiscount && !pointsDiscount && !couponDiscount ? order.discountAmount > 0 : false)
                    ? `<tr>
                  <td>✂️ ${order.discountPercentage && order.discountPercentage > 0 ? `整單折扣 (${order.discountPercentage}%)` : '折扣優惠'}:</td>
                  <td class="text-right">-$${(percentageDiscount || manualDiscount || order.discountAmount || 0).toFixed(2)}</td>
                </tr>`
                    : ''
                }
                <tr class="bold" style="color: #c53030; font-weight: bold; border-top: 1px dashed #666; border-bottom: 1px dashed #666;">
                  <td style="padding: 3px 0;">合計總折扣 (Total Discount):</td>
                  <td class="text-right" style="padding: 3px 0;">-$${totalCombinedDiscount.toFixed(2)}</td>
                </tr>`
              : `<tr style="color: #777; font-style: italic;">
                  <td>折抵明細 (Discounts):</td>
                  <td class="text-right">未使用任何折抵</td>
                </tr>`
          }
          <tr>
            <td>營業稅金 (${order.taxRate || safeSettings.taxRate}%):</td>
            <td class="text-right">$${(order.taxAmount || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>服務費 (${order.serviceChargeRate || safeSettings.serviceChargeRate}%):</td>
            <td class="text-right">$${(order.serviceChargeAmount || 0).toFixed(2)}</td>
          </tr>
          <tr class="bold" style="font-size: 16px;">
            <td style="padding-top: 6px;">總計金額:</td>
            <td class="text-right" style="padding-top: 6px;">$${(order.totalAmount || 0).toFixed(2)}</td>
          </tr>
        </table>

        <div class="double-divider"></div>

        <div>
          <div><strong>付款方式:</strong> ${formattedPayMethod}</div>
          <div><strong>付款狀態:</strong> ${formattedPayStatus}</div>
        </div>

        <div class="divider"></div>

        <div class="text-center" style="margin-top: 16px; font-size: 12px;">
          <div>${safeSettings.receiptFooter || '歡迎再次光臨！'}</div>
          <div style="font-size: 10px; color: #666; margin-top: 8px;">系統提供：POS 智慧餐飲管理系統</div>
        </div>
      </body>
      </html>
    `;
  },

  printReceipt(order: Order, settings: RestaurantSettings, fontFamily?: string) {
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const dateStr = orderDate.toISOString().split('T')[0];
    const cleanOrderNum = order.orderNumber || '0000';
    const printDocTitle = `order-${cleanOrderNum}-receipt-${dateStr}`;
    const oldDocumentTitle = document.title;
    document.title = printDocTitle;

    // 1. Notify modal listeners to display interactive thermal receipt preview modal
    const orderWithTs = { ...order, _printTs: Date.now() };
    listeners.forEach(fn => {
      try {
        fn(orderWithTs, settings);
      } catch (err) {
        console.warn('Listener error in receiptService:', err);
      }
    });

    // 2. Trigger robust print preview via dedicated printing iframe
    this.executeIframePrint(order, settings, fontFamily);

    setTimeout(() => {
      document.title = oldDocumentTitle;
    }, 4000);
  },

  executeIframePrint(order: Order, settings: RestaurantSettings, fontFamily?: string) {
    const html = this.generateReceiptHTML(order, settings, fontFamily);
    
    let printIframe = document.getElementById('receipt-print-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'receipt-print-iframe';
      printIframe.setAttribute('style', 'position: absolute; width: 0; height: 0; left: -9999px; top: -9999px; border: none;');
      document.body.appendChild(printIframe);
    }

    try {
      const iframeDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
          } catch (err) {
            console.warn('Iframe print failed, falling back to window.print():', err);
            window.focus();
            window.print();
          }
        }, 300);
      } else {
        window.focus();
        window.print();
      }
    } catch (err) {
      console.warn('Direct iframe write error, falling back to window.print():', err);
      window.focus();
      window.print();
    }
  },

  openReceiptNewWindow(order: Order, settings: RestaurantSettings, fontFamily?: string) {
    const html = this.generateReceiptHTML(order, settings, fontFamily);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  },

  generateKitchenTicketHTML(order: Order, _settings?: RestaurantSettings): string {
    const formattedTable = order.tableName
      ? `桌號 Table: ${order.tableName}`
      : order.type
      ? translateOrderType(order.type)
      : '外帶 Takeout';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>KDS Kitchen Ticket - ${order.orderNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Zen+Kurenaido&family=Caveat:wght@700&family=Kalam:wght@700&display=swap');
          
          @page {
            size: 80mm auto;
            margin: 3mm;
          }
          body {
            font-family: '手札體', 'Zen Kurenaido', 'DFKai-SB', '標楷體', 'Caveat', 'Kalam', cursive, sans-serif;
            width: 100%;
            max-width: 350px;
            margin: 0 auto;
            padding: 6px;
            color: #000;
            background: #fff;
            font-size: 26px; /* 2X font size for fast kitchen visibility */
            line-height: 1.35;
            font-weight: 900;
            -webkit-print-color-adjust: exact;
          }
          .ticket-header {
            text-align: center;
            border-bottom: 4px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .order-num {
            font-size: 42px; /* 2X Order Number */
            font-weight: 900;
            line-height: 1.1;
            letter-spacing: -1px;
          }
          .table-badge {
            font-size: 34px; /* 2X Table Badge */
            font-weight: 900;
            margin-top: 8px;
            background: #000;
            color: #fff;
            display: inline-block;
            padding: 4px 14px;
            border-radius: 8px;
          }
          .dishes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .dish-item {
            border-bottom: 2px dashed #000;
            padding: 12px 0;
          }
          .dish-line {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 28px; /* 2X Dish Name */
            font-weight: 900;
          }
          .qty {
            font-size: 38px;
            font-weight: 900;
            margin-right: 8px;
            display: inline-block;
          }
          .dish-name {
            flex: 1;
            word-break: break-word;
          }
          .modifiers-box {
            font-size: 22px;
            font-weight: 800;
            margin-top: 4px;
            padding-left: 20px;
            color: #111;
          }
          .kitchen-note-box {
            margin-top: 14px;
            padding: 10px 12px;
            border: 3px solid #000;
            font-size: 24px;
            font-weight: 900;
            background: #f4f4f4;
            border-radius: 6px;
          }
          .divider {
            border-top: 4px solid #000;
            margin: 14px 0;
          }
        </style>
      </head>
      <body>
        <!-- 1. Order No. -->
        <div class="ticket-header">
          <div class="order-num">單號 ${order.orderNumber}</div>
          <!-- 2. Table -->
          <div class="table-badge">${formattedTable}</div>
          ${
            order.kitchenNotes && (order.kitchenNotes.includes('加點') || order.kitchenNotes.includes('ADD-ON'))
              ? `<div style="background:#d97706; color:#fff; font-size:24px; font-weight:900; margin-top:8px; display:inline-block; padding:4px 14px; border-radius:8px;">⚡ 加點單 (ADD-ON DISHES ONLY)</div>`
              : ''
          }
        </div>

        <!-- 3. Dishes -->
        <div class="dishes-table">
          ${(order.items || [])
            .map(
              item => `
            <div class="dish-item">
              <div class="dish-line">
                <div>
                  <span class="qty">${item.quantity}x</span>
                  <span class="dish-name">${translateText(item.name)}</span>
                </div>
              </div>
              ${
                item.modifiers && item.modifiers.length > 0
                  ? `
                <div class="modifiers-box">
                  ${item.modifiers.map(m => `• ${translateText(m)}`).join('<br/>')}
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>

        ${
          order.kitchenNotes
            ? `
          <div class="kitchen-note-box">
            ⚠️ 廚房備註: ${order.kitchenNotes}
          </div>
        `
            : ''
        }

        <div class="divider"></div>
      </body>
      </html>
    `;
  },

  printKitchenTicket(order: Order, settings?: RestaurantSettings) {
    const html = this.generateKitchenTicketHTML(order, settings);

    let kdsIframe = document.getElementById('kds-ticket-print-iframe') as HTMLIFrameElement;
    if (!kdsIframe) {
      kdsIframe = document.createElement('iframe');
      kdsIframe.id = 'kds-ticket-print-iframe';
      kdsIframe.setAttribute(
        'style',
        'position: absolute; width: 0; height: 0; left: -9999px; top: -9999px; border: none;'
      );
      document.body.appendChild(kdsIframe);
    }

    try {
      const iframeDoc = kdsIframe.contentWindow?.document || kdsIframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        setTimeout(() => {
          try {
            kdsIframe.contentWindow?.focus();
            kdsIframe.contentWindow?.print();
          } catch (err) {
            console.warn('KDS Iframe print failed:', err);
            window.focus();
            window.print();
          }
        }, 300);
      } else {
        window.focus();
        window.print();
      }
    } catch (err) {
      console.warn('Direct KDS iframe write error:', err);
      window.focus();
      window.print();
    }
  },
};

