import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Clock,
  Flame,
  ChevronRight,
  BellRing,
  Sparkles,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Receipt,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { Table, MenuItem, Order, RestaurantSettings } from '../types';
import { audioService } from '../services/audioService';
import { gasService } from '../services/gasService';
import { useTranslation } from '../i18n/useTranslation';
import { Language } from '../i18n/translations';
import {
  getCategoryLabel,
  getDishName,
  getDishDescription,
  getModifierLabel,
} from '../i18n/publicI18n';

interface CustomerOrderingViewProps {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  settings: RestaurantSettings;
  initialTableNumber?: number | string | null;
  onPlaceOrder: (newOrder: Order) => Order | void;
  onExitCustomerMode: () => void;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  modifiers: string[];
  notes: string;
}

export const CustomerOrderingView: React.FC<CustomerOrderingViewProps> = ({
  tables,
  menuItems,
  orders,
  settings,
  initialTableNumber,
  onPlaceOrder,
  onExitCustomerMode,
}) => {
  const { lang, changeLanguage } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);

  // Table Selection & Lock
  const isTableLocked = Boolean(initialTableNumber);
  const [selectedTable, setSelectedTable] = useState<Table | null>(() => {
    if (initialTableNumber) {
      const match = tables.find(t => t.number === Number(initialTableNumber) || t.name === String(initialTableNumber));
      if (match) return match;
    }
    return tables.length > 0 ? tables[0] : null;
  });

  const [customerName, setCustomerName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);

  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);

  // Staff exit PIN modal
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Service Request Feedback
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);

  // Order Submitted confirmation banner
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

  // Categories list
  const categories = ['All', 'Starters', 'Mains', 'Fries', 'Drinks', 'Desserts', 'Combos'];

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const translatedName = getDishName(item.name, lang).toLowerCase();
    const origName = item.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      translatedName.includes(query) ||
      origName.includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Check active orders for the selected table
  const activeTableOrder = selectedTable
    ? orders.find(
        o =>
          (o.tableId === selectedTable.id || o.tableName === selectedTable.name) &&
          o.status !== 'Served' &&
          o.status !== 'Cancelled'
      )
    : null;

  // Add item to cart
  const handleOpenCustomization = (item: MenuItem) => {
    setCustomizingItem(item);
    setSelectedModifiers([]);
    setItemNotes('');
    setItemQty(1);
  };

  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;

    const newItem: CartItem = {
      menuItem: customizingItem,
      quantity: itemQty,
      modifiers: selectedModifiers,
      notes: itemNotes,
    };

    setCart(prev => [...prev, newItem]);
    setCustomizingItem(null);
    audioService.playClick();
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.modifiers && item.modifiers.length > 0) {
      handleOpenCustomization(item);
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.menuItem.id === item.id && ci.modifiers.length === 0);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { menuItem: item, quantity: 1, modifiers: [], notes: '' }];
    });
    audioService.playClick();
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart(prev => {
      const copy = [...prev];
      const newQty = copy[index].quantity + delta;
      if (newQty <= 0) {
        return copy.filter((_, i) => i !== index);
      }
      copy[index].quantity = newQty;
      return copy;
    });
  };

  // Subtotal & Totals
  const subtotal = cart.reduce((acc, ci) => acc + ci.menuItem.price * ci.quantity, 0);
  const taxRate = settings.taxRate ?? 8.5;
  const serviceChargeRate = settings.serviceChargeRate ?? 10;
  const taxAmount = (subtotal * taxRate) / 100;
  const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
  const totalAmount = subtotal + taxAmount + serviceChargeAmount;

  // Submit Order
  const handleSubmitOrder = () => {
    if (!selectedTable) return;
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: '#' + Math.floor(1000 + Math.random() * 9000),
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      customerName: customerName.trim() || (lang === 'zh-TW' ? '內用賓客' : 'Guest'),
      type: 'Dine-in',
      status: 'Pending',
      paymentStatus: 'Unpaid',
      items: cart.map(ci => ({
        id: 'oi-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        menuItemId: ci.menuItem.id,
        name: ci.menuItem.name,
        price: ci.menuItem.price,
        quantity: ci.quantity,
        modifiers: ci.modifiers,
        addOns: [],
        kitchenNotes: ci.notes,
        status: 'Pending',
      })),
      subtotal,
      taxRate,
      taxAmount,
      serviceChargeRate,
      serviceChargeAmount,
      discountPercentage: 0,
      discountAmount: 0,
      totalAmount,
      createdBy: 'Customer QR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kitchenNotes: `Self-Service QR Order for Table ${selectedTable.name}`,
    };

    const savedOrder = onPlaceOrder(newOrder);
    setSubmittedOrder(savedOrder || newOrder);
    setCart([]);
    setShowCartDrawer(false);
    audioService.playNewOrder();

    if (settings.gasWebAppUrl) {
      gasService.syncOrder(newOrder);
    }
  };

  const handleStaffPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '0537' || pinInput === '1234') {
      setShowExitModal(false);
      onExitCustomerMode();
    } else {
      setPinError(lang === 'zh-TW' ? '店員 PIN 碼不正確' : 'Invalid Staff PIN Code.');
    }
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || '繁體中文';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans pb-24 text-gray-900 dark:text-white">
      {/* BRANDING & TABLE HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-2.5 text-white shadow-md">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                {settings.restaurantName || 'Grand Bistro & Grill'}
              </h1>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
                {lang === 'zh-TW' ? '數位掃碼自助點餐系統' : lang === 'ja' ? 'セルフ注文ポータル' : 'Digital Self-Ordering Portal'}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector, Table Badge & Staff Exit */}
          <div className="flex items-center space-x-2">
            {/* Language Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1 rounded-xl border border-gray-200 bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-amber-500" />
                <span>{currentLangLabel}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-gray-200 bg-white shadow-2xl py-2 z-50 dark:border-gray-700 dark:bg-gray-900 animate-in fade-in">
                  {languages.map(item => (
                    <button
                      key={item.code}
                      onClick={() => {
                        changeLanguage(item.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all text-left cursor-pointer ${
                        lang === item.code ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <span>{item.flag}</span>
                        <span>{item.label}</span>
                      </span>
                      {lang === item.code && <Check className="h-3.5 w-3.5 text-amber-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Table Selector / Locked Badge */}
            {isTableLocked ? (
              <div className="flex items-center space-x-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
                <Lock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                <span>{lang === 'zh-TW' ? '桌號: ' : 'Table: '}{selectedTable?.name || `Table ${initialTableNumber}`}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase">{lang === 'zh-TW' ? '桌號:' : 'Table:'}</span>
                <select
                  value={selectedTable?.id || ''}
                  onChange={e => {
                    const t = tables.find(tbl => tbl.id === e.target.value);
                    if (t) setSelectedTable(t);
                  }}
                  className="bg-transparent font-black text-amber-900 dark:text-amber-300 focus:outline-hidden cursor-pointer"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id} className="dark:bg-gray-900 dark:text-white">
                      {t.name} ({t.zone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                setPinInput('');
                setPinError('');
                setShowExitModal(true);
              }}
              title={lang === 'zh-TW' ? '店員權限離開' : 'Staff Exit'}
              className="rounded-xl border border-gray-200 bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-5">
        {/* ACTIVE TABLE ORDER TRACKER BANNER */}
        {(activeTableOrder || submittedOrder) && (
          <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm dark:border-amber-800/80 dark:from-amber-950/40 dark:to-orange-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="rounded-xl bg-amber-500 p-2 text-white shadow-xs shrink-0 mt-0.5">
                  <ChefHat className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      {(activeTableOrder || submittedOrder)?.orderNumber}
                    </span>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      {lang === 'zh-TW'
                        ? `桌號 ${selectedTable?.name} 的餐點已成功送往廚房！`
                        : `Order sent to kitchen for Table ${selectedTable?.name}`}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {lang === 'zh-TW' ? '狀態: ' : 'Status: '}
                    <span className="font-extrabold text-[#FF8A00]">
                      {(activeTableOrder || submittedOrder)?.status}
                    </span>{' '}
                    • {lang === 'zh-TW' ? '總金額: ' : 'Total: '}${((activeTableOrder || submittedOrder)?.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Quick Call Service Actions */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => {
                    setServiceMessage(
                      lang === 'zh-TW'
                        ? `已通知服務員！稍後將至桌號 ${selectedTable?.name} 為您服務。`
                        : `Server notified! A waiter will visit Table ${selectedTable?.name} shortly.`
                    );
                    setTimeout(() => setServiceMessage(null), 4000);
                  }}
                  className="flex items-center space-x-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-gray-900 dark:text-amber-300 cursor-pointer"
                >
                  <BellRing className="h-3.5 w-3.5 text-amber-600" />
                  <span>{lang === 'zh-TW' ? '呼叫服務員' : 'Call Waiter'}</span>
                </button>
                <button
                  onClick={() => {
                    setServiceMessage(
                      lang === 'zh-TW'
                        ? `已發送結帳通知！服務員稍後將帶明細至桌號 ${selectedTable?.name}。`
                        : `Bill requested! Your server will bring the receipt to Table ${selectedTable?.name}.`
                    );
                    setTimeout(() => setServiceMessage(null), 4000);
                  }}
                  className="flex items-center space-x-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>{lang === 'zh-TW' ? '索取帳單' : 'Request Bill'}</span>
                </button>
              </div>
            </div>

            {serviceMessage && (
              <p className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 p-2 rounded-xl text-center animate-in fade-in">
                {serviceMessage}
              </p>
            )}
          </div>
        )}

        {/* CUSTOMER NAME INPUT & QUICK HELP */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
              {lang === 'zh-TW' ? '顧客稱呼 / 姓名 (選填)' : 'Your Name (Optional)'}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder={lang === 'zh-TW' ? '例: 陳先生 / Alex' : 'e.g. Alex'}
              className="w-full rounded-xl border border-gray-200 p-2 text-xs focus:border-[#FF8A00] focus:ring-[#FF8A00] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {lang === 'zh-TW' ? `正在瀏覽桌位 ${selectedTable?.name} 之菜單` : `Browsing Menu as Table ${selectedTable?.name}`}
            </p>
            <p className="text-[11px]">
              {lang === 'zh-TW' ? '點擊餐點即可加點或客製化偏好' : 'Tap items to add & customize your order'}
            </p>
          </div>
        </div>

        {/* SEARCH BAR & CATEGORIES */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'zh-TW' ? '搜尋餐點名稱、描述或食材...' : 'Search dishes, drinks, ingredients...'}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-xs font-medium shadow-xs focus:border-[#FF8A00] focus:ring-2 focus:ring-[#FF8A00]/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#FF8A00] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300'
                }`}
              >
                {getCategoryLabel(cat, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* MENU ITEMS GRID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMenuItems.map(item => (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs hover:border-[#FF8A00]/50 hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 mb-3">
                  <img
                    src={item.image}
                    alt={getDishName(item.name, lang)}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.isPopular && (
                    <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                      {lang === 'zh-TW' ? '人氣熱銷' : 'Popular'}
                    </span>
                  )}
                  {item.isCombo && (
                    <span className="absolute top-2 right-2 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                      {lang === 'zh-TW' ? '超值套餐' : 'Combo'}
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-snug">
                    {getDishName(item.name, lang)}
                  </h3>
                  <span className="font-black text-sm text-[#FF8A00] shrink-0">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {getDishDescription(item, lang)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                {item.modifiers && item.modifiers.length > 0 ? (
                  <button
                    onClick={() => handleOpenCustomization(item)}
                    className="w-full flex items-center justify-center space-x-1 rounded-xl border border-[#FF8A00] bg-orange-50 px-3 py-2 text-xs font-bold text-[#FF8A00] hover:bg-[#FF8A00] hover:text-white dark:bg-orange-950/40 transition-all cursor-pointer"
                  >
                    <span>{lang === 'zh-TW' ? '客製化與選購' : 'Customize & Add'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleQuickAdd(item)}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-[#FF8A00] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e07900] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{lang === 'zh-TW' ? '加入購物車' : 'Add to Order'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FLOATING CART BUTTON BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setShowCartDrawer(true)}
              className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 text-white shadow-2xl hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="relative rounded-xl bg-white/20 p-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-amber-900 shadow-xs">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-100 uppercase">
                    {lang === 'zh-TW' ? '檢視點餐購物車' : 'View Order Basket'}
                  </p>
                  <p className="text-sm font-black">
                    {lang === 'zh-TW' ? `已選擇 ${cart.length} 項餐點，點擊下單` : `${cart.length} items ready to order`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-base font-black">${totalAmount.toFixed(2)}</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ITEM CUSTOMIZATION MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                {lang === 'zh-TW' ? `客製化：${getDishName(customizingItem.name, lang)}` : `Customize ${customizingItem.name}`}
              </h3>
              <button
                onClick={() => setCustomizingItem(null)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {/* Modifiers Selection */}
              {customizingItem.modifiers && customizingItem.modifiers.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {lang === 'zh-TW' ? '客製選項與偏好' : 'Preferences / Options'}
                  </label>
                  <div className="space-y-2">
                    {customizingItem.modifiers.map(mod => {
                      const isChecked = selectedModifiers.includes(mod);
                      return (
                        <label
                          key={mod}
                          onClick={() => {
                            setSelectedModifiers(prev =>
                              isChecked ? prev.filter(m => m !== mod) : [...prev, mod]
                            );
                          }}
                          className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#FF8A00] bg-orange-50/60 dark:bg-orange-950/30 text-gray-900 dark:text-white font-bold'
                              : 'border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-xs">{getModifierLabel(mod, lang)}</span>
                          <div
                            className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                              isChecked ? 'bg-[#FF8A00] border-[#FF8A00] text-white' : 'border-gray-300'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'zh-TW' ? '廚房特別交代 (備註)' : 'Special Kitchen Request'}
                </label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                  placeholder={lang === 'zh-TW' ? '例: 醬料分裝、去蔥、少鹽...' : 'e.g. Extra sauce on the side, no onion'}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs focus:border-[#FF8A00] focus:ring-[#FF8A00] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {lang === 'zh-TW' ? '點餐數量' : 'Quantity'}
                </span>
                <div className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                  <button
                    onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                    className="rounded-lg p-1 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-black text-sm px-2 text-gray-900 dark:text-white">{itemQty}</span>
                  <button
                    onClick={() => setItemQty(itemQty + 1)}
                    className="rounded-lg p-1 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                onClick={() => setCustomizingItem(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {lang === 'zh-TW' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="rounded-xl bg-[#FF8A00] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] cursor-pointer"
              >
                {lang === 'zh-TW'
                  ? `加入購物車 ($${(customizingItem.price * itemQty).toFixed(2)})`
                  : `Add to Basket ($${(customizingItem.price * itemQty).toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART BASKET DRAWER / MODAL */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-[#FF8A00]" />
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  {lang === 'zh-TW'
                    ? `桌號 ${selectedTable?.name} 之購物車 (${cart.length} 項)`
                    : `Table ${selectedTable?.name} Basket (${cart.length} items)`}
                </h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 max-h-[50vh] overflow-y-auto pr-1">
              {cart.map((ci, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                      {getDishName(ci.menuItem.name, lang)}
                    </h4>
                    {ci.modifiers.length > 0 && (
                      <p className="text-[10px] text-gray-500 font-medium">
                        • {ci.modifiers.map(m => getModifierLabel(m, lang)).join(', ')}
                      </p>
                    )}
                    {ci.notes && (
                      <p className="text-[10px] text-amber-600 font-semibold italic">
                        {lang === 'zh-TW' ? '備註: ' : 'Note: '}{ci.notes}
                      </p>
                    )}
                    <span className="text-xs font-black text-[#FF8A00] mt-0.5 block">
                      ${(ci.menuItem.price * ci.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 rounded-xl bg-white p-1 border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                    <button
                      onClick={() => handleUpdateQty(idx, -1)}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-extrabold px-1 dark:text-white">{ci.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(idx, 1)}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs text-gray-600 dark:border-gray-800 dark:text-gray-300">
              <div className="flex justify-between">
                <span>{lang === 'zh-TW' ? '餐點小計' : 'Subtotal'}</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{lang === 'zh-TW' ? `營業稅 (${taxRate}%)` : `Tax (${taxRate}%)`}</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>{lang === 'zh-TW' ? `服務費 (${serviceChargeRate}%)` : `Service Charge (${serviceChargeRate}%)`}</span>
                <span>${serviceChargeAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-black text-gray-900 dark:border-gray-800 dark:text-white">
                <span>{lang === 'zh-TW' ? '應付總金額' : 'Total Due'}</span>
                <span className="text-[#FF8A00]">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowCartDrawer(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {lang === 'zh-TW' ? '返回菜單' : 'Back to Menu'}
              </button>
              <button
                onClick={handleSubmitOrder}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-700 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{lang === 'zh-TW' ? '確認送出訂單至廚房' : 'Confirm & Send Order to Kitchen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF EXIT PIN MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm">
                <Lock className="h-4 w-4" />
                <span>{lang === 'zh-TW' ? '店員權限切換' : 'Staff POS Switch'}</span>
              </div>
              <button
                onClick={() => setShowExitModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
              {lang === 'zh-TW'
                ? <>請輸入店員 PIN 碼 (預設: <code className="font-mono font-bold text-amber-600">0537</code>) 以返回 POS 管理系統。</>
                : <>Enter Staff Security PIN (Default: <code className="font-mono font-bold text-amber-600">0537</code>) to return to POS administration.</>}
            </p>

            <form onSubmit={handleStaffPinSubmit} className="space-y-4">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder={lang === 'zh-TW' ? '請輸入 PIN 碼' : 'Enter Staff PIN'}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-center text-sm font-mono tracking-widest focus:border-amber-500 focus:ring-amber-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              {pinError && (
                <p className="text-xs font-bold text-rose-600 flex items-center justify-center">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" /> {pinError}
                </p>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {lang === 'zh-TW' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 cursor-pointer"
                >
                  {lang === 'zh-TW' ? '解鎖 POS' : 'Unlock POS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
