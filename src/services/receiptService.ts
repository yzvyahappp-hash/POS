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

export const RECEIPT_FONTS = [
  {
    id: 'handwriting',
    name: '✍️ 手札體 (日系隨筆手寫風)',
    family: "'Zen Kurenaido', 'Caveat', 'DFKai-SB', '標楷體', cursive",
  },
  {
    id: 'longcang',
    name: '✒️ 狂草隨筆 (行書手寫風)',
    family: "'Long Cang', 'Caveat', 'DFKai-SB', cursive",
  },
  {
    id: 'mono',
    name: '🖨️ 經典熱感應等寬體 (Courier)',
    family: "'Courier New', Courier, 'Consolas', monospace",
  },
  {
    id: 'sans',
    name: '📱 現代極簡黑體 (Noto Sans)',
    family: "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif",
  },
  {
    id: 'serif',
    name: '📖 典雅復古明體 (Noto Serif)',
    family: "'Noto Serif TC', 'PMingLiU', '新細明體', serif",
  },
  {
    id: 'rounded',
    name: '🎈 日系可愛圓體 (Zen Maru)',
    family: "'Zen Maru Gothic', 'M PLUS Rounded 1c', sans-serif",
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

  generateReceiptHTML(order: Order, settings: RestaurantSettings, fontFamily?: string): string {
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

    const chosenFont = fontFamily || RECEIPT_FONTS[0].family;
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

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentTitle}</title>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Long+Cang&family=Ma+Shan+Zheng&family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@400;700&family=Zen+Kurenaido&family=Zen+Maru+Gothic:wght@500;700&family=Zhi+Mang+Xing&display=swap" rel="stylesheet">
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
            <td>小計金額:</td>
            <td class="text-right">$${(order.subtotal || 0).toFixed(2)}</td>
          </tr>
          ${
            (order.discountAmount || 0) > 0
              ? `<tr>
            <td>折扣優惠 (${order.discountPercentage || 0}%):</td>
            <td class="text-right">-$${(order.discountAmount || 0).toFixed(2)}</td>
          </tr>`
              : ''
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
};

