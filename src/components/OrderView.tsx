import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ChefHat,
  CreditCard,
  Search,
  MessageSquare,
  Percent,
  CheckCircle,
  Clock,
  User,
  X,
  Sparkles,
  Printer,
  Phone,
  Award,
  Link2,
} from 'lucide-react';
import { receiptService } from '../services/receiptService';
import {
  MenuItem,
  Order,
  OrderItem,
  Table,
  OrderType,
  RestaurantSettings,
  Customer,
} from '../types';
import { audioService } from '../services/audioService';
import { useTranslation } from '../i18n/useTranslation';
import { translateCategory, translateOrderStatus, translateOrderType, translateTableStatus } from '../utils/i18nHelpers';
import { isSameCustomer } from '../utils/customerUtils';
import { DishCustomizationModal } from './DishCustomizationModal';

interface OrderViewProps {
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  customers: Customer[];
  settings: RestaurantSettings;
  activeOrderToEdit: Order | null;
  selectedTableForOrder?: Table | null;
  onSaveOrder: (newOrder: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onProceedToCheckout: (order: Order) => void;
  onMergeOrders?: (orderIdsToMerge: string[]) => void;
  onAddCustomer?: (customer: Customer) => void;
  onUpdateCustomer?: (customer: Customer) => void;
}

export const OrderView: React.FC<OrderViewProps> = ({
  menuItems,
  tables,
  orders,
  customers,
  settings,
  activeOrderToEdit,
  selectedTableForOrder,
  onSaveOrder,
  onCancelOrder,
  onProceedToCheckout,
  onMergeOrders,
  onAddCustomer,
  onUpdateCustomer,
}) => {
  const { lang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOrderIdsToMerge, setSelectedOrderIdsToMerge] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart Form State
  const [orderType, setOrderType] = useState<OrderType>(
    activeOrderToEdit ? activeOrderToEdit.type : 'Dine-in'
  );
  const [selectedTableId, setSelectedTableId] = useState<string>(
    activeOrderToEdit?.tableId || selectedTableForOrder?.id || (tables.length > 0 ? tables[0].id : '')
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    activeOrderToEdit?.customerId || ''
  );
  const [cartItems, setCartItems] = useState<OrderItem[]>(
    activeOrderToEdit ? activeOrderToEdit.items : []
  );
  const [kitchenNotes, setKitchenNotes] = useState<string>(
    activeOrderToEdit?.kitchenNotes || ''
  );
  const [discountPercent, setDiscountPercent] = useState<number>(
    activeOrderToEdit?.discountPercentage || 0
  );

  // Sync state when active order or selected table changes
  React.useEffect(() => {
    if (activeOrderToEdit) {
      setOrderType(activeOrderToEdit.type);
      if (activeOrderToEdit.tableId) {
        setSelectedTableId(activeOrderToEdit.tableId);
      }
      setSelectedCustomerId(activeOrderToEdit.customerId || '');
      setCartItems(activeOrderToEdit.items || []);
      setKitchenNotes(activeOrderToEdit.kitchenNotes || '');
      setDiscountPercent(activeOrderToEdit.discountPercentage || 0);
    } else if (selectedTableForOrder) {
      setOrderType('Dine-in');
      setSelectedTableId(selectedTableForOrder.id);
      setSelectedCustomerId('');
      setCartItems([]);
      setKitchenNotes('');
      setDiscountPercent(0);
    }
  }, [activeOrderToEdit, selectedTableForOrder]);

  // Selected Table & Customer objects
  const selectedTable = tables.find(t => t.id === selectedTableId || t.name === selectedTableId);

  const selectedCustomer = React.useMemo(() => {
    if (selectedCustomerId) {
      const direct = customers.find(c => c.id === selectedCustomerId || c.name === selectedCustomerId);
      if (direct) return direct;
    }
    if (orderType === 'Dine-in' && selectedTable) {
      let targetName = selectedTable.customerName?.trim();
      if ((!targetName || targetName === 'Walk-in Guest') && selectedTable.mergedWith && selectedTable.mergedWith.length > 0) {
        for (const partnerId of selectedTable.mergedWith) {
          const partner = tables.find(t => t.id === partnerId);
          if (partner?.customerName && partner.customerName !== 'Walk-in Guest') {
            targetName = partner.customerName.trim();
            break;
          }
        }
      }

      if (targetName && targetName !== 'Walk-in Guest') {
        const matched = customers.find(
          c => c.id === targetName || isSameCustomer({ name: targetName }, c)
        );
        if (matched) return matched;
      }
    }
    return undefined;
  }, [selectedCustomerId, selectedTable, orderType, customers, tables]);

  // Sync customer selection when table selection changes
  React.useEffect(() => {
    if (orderType === 'Dine-in' && selectedTableId) {
      const selectedTbl = tables.find(t => t.id === selectedTableId || t.name === selectedTableId);
      if (selectedTbl) {
        let targetName = selectedTbl.customerName?.trim();
        if ((!targetName || targetName === 'Walk-in Guest') && selectedTbl.mergedWith && selectedTbl.mergedWith.length > 0) {
          for (const partnerId of selectedTbl.mergedWith) {
            const partner = tables.find(t => t.id === partnerId);
            if (partner?.customerName && partner.customerName !== 'Walk-in Guest') {
              targetName = partner.customerName.trim();
              break;
            }
          }
        }

        if (targetName && targetName !== 'Walk-in Guest') {
          const matched = customers.find(
            c => c.id === targetName || isSameCustomer({ name: targetName }, c)
          );
          if (matched) {
            setSelectedCustomerId(matched.id);
            return;
          }
        }
      }
      setSelectedCustomerId('');
    }
  }, [selectedTableId, orderType, tables, customers]);

  // Modifier Selection Drawer State
  const [activeMenuItemForModifier, setActiveMenuItemForModifier] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [itemNote, setItemNote] = useState<string>('');

  const categories = ['All', 'Starters', 'Mains', 'Drinks', 'Desserts', 'Fries', 'Others'];

  const filteredMenuItems = menuItems.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && item.isAvailable;
  });

  const handleOpenModifier = (item: MenuItem) => {
    setActiveMenuItemForModifier(item);
    setSelectedModifiers([]);
    setItemNote('');
  };

  const handleConfirmAddToCart = (chosenModifiers: string[], chosenNote: string, finalCalculatedPrice?: number) => {
    if (!activeMenuItemForModifier) return;

    const unitPrice = finalCalculatedPrice !== undefined ? finalCalculatedPrice : activeMenuItemForModifier.price;

    const newItem: OrderItem = {
      id: 'oi-' + Date.now() + Math.random().toString(36).substring(2, 5),
      menuItemId: activeMenuItemForModifier.id,
      name: activeMenuItemForModifier.name,
      price: unitPrice,
      quantity: 1,
      modifiers: chosenModifiers,
      addOns: [],
      kitchenNotes: chosenNote,
      status: 'Pending',
    };

    setCartItems(prev => [...prev, newItem]);
    setActiveMenuItemForModifier(null);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCartItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Cart financial totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * settings.taxRate) / 100;
  const serviceChargeAmount = (taxableAmount * settings.serviceChargeRate) / 100;
  const totalAmount = taxableAmount + taxAmount + serviceChargeAmount;

  const handleSendToKitchen = () => {
    if (cartItems.length === 0) return;

    const selectedTable = tables.find(t => t.id === selectedTableId);
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

    const newOrder: Order = {
      id: activeOrderToEdit ? activeOrderToEdit.id : 'ord-' + Date.now(),
      orderNumber: activeOrderToEdit ? activeOrderToEdit.orderNumber : 'ORD-' + Math.floor(100 + Math.random() * 900),
      type: orderType,
      tableId: orderType === 'Dine-in' ? selectedTableId : undefined,
      tableName: orderType === 'Dine-in' && selectedTable ? selectedTable.name : undefined,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Guest',
      items: cartItems,
      status: 'Pending',
      kitchenNotes,
      discountPercentage: discountPercent,
      discountAmount,
      taxRate: settings.taxRate,
      taxAmount,
      serviceChargeRate: settings.serviceChargeRate,
      serviceChargeAmount,
      subtotal,
      totalAmount,
      paymentStatus: 'Unpaid',
      createdAt: activeOrderToEdit ? activeOrderToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Active Staff',
    };

    onSaveOrder(newOrder);
    audioService.playKitchenAlert();

    // Reset Form
    setCartItems([]);
    setKitchenNotes('');
    setDiscountPercent(0);
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <ShoppingBag className="mr-2 h-6 w-6 text-[#FF8A00]" /> Order Creation & History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Build POS orders, add modifiers, calculate charges, and route to kitchen
          </p>
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setActiveTab('create')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Create Order
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Order History ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* CREATE ORDER VIEW (2-COLUMN POS LAYOUT) */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Interactive Menu Items Grid (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            {/* Category Pills & Search */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes to add..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#FF8A00] text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[560px] overflow-y-auto p-1">
              {filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOpenModifier(item)}
                  className="cursor-pointer group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-2xs hover:border-[#FF8A00] hover:shadow-md transition-all dark:border-gray-800 dark:bg-gray-900"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="h-28 w-full rounded-xl object-cover mb-2 transition-transform group-hover:scale-105"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="mt-1 text-xs font-black text-[#FF8A00]">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary Cart (5 cols) */}
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900 lg:col-span-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto overscroll-contain touch-pan-y">
            <div className="space-y-3">
              {/* Order Settings Top Bar */}
              <div className="border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-900 text-sm dark:text-white">
                    Order Cart
                  </h3>
                  <div className="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
                    {(['Dine-in', 'Takeaway', 'Delivery'] as OrderType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setOrderType(t)}
                        className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                          orderType === t
                            ? 'bg-[#FF8A00] text-white shadow-2xs'
                            : 'text-gray-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table & Customer Selection Controls */}
                <div className="mt-3 space-y-2.5">
                  {orderType === 'Dine-in' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          {lang === 'zh-TW' ? '選擇桌號 (Select Table)' : 'Select Table'}
                        </label>
                        {selectedTable && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {selectedTable.seats} {lang === 'zh-TW' ? '人座' : 'Seats'} • {translateTableStatus(selectedTable.status, lang)}
                          </span>
                        )}
                      </div>
                      <select
                        value={selectedTableId}
                        onChange={e => setSelectedTableId(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-pointer shadow-2xs transition-all"
                      >
                        {tables.map(tbl => {
                          const isTblMerged = tbl.mergedWith && tbl.mergedWith.length > 0;
                          const partnerNames = isTblMerged
                            ? tables.filter(t => tbl.mergedWith?.includes(t.id)).map(t => t.name)
                            : [];
                          return (
                            <option key={tbl.id} value={tbl.id}>
                              Table {tbl.name}{isTblMerged ? ` (併 ${partnerNames.join('+')})` : ''} ({tbl.seats} {lang === 'zh-TW' ? '人座' : 'seats'}) - {translateTableStatus(tbl.status, lang)}
                            </option>
                          );
                        })}
                      </select>

                      {selectedTable?.mergedWith && selectedTable.mergedWith.length > 0 && (
                        <div className="mt-1.5 flex items-center space-x-1 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-1.5 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Link2 className="h-3 w-3 shrink-0" />
                          <span>
                            {lang === 'zh-TW'
                              ? `已與 ${tables.filter(t => selectedTable.mergedWith?.includes(t.id)).map(t => `Table ${t.name}`).join(', ')} 併桌用餐`
                              : `Merged dining with ${tables.filter(t => selectedTable.mergedWith?.includes(t.id)).map(t => `Table ${t.name}`).join(', ')}`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Select Dropdown (Moved Downward) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        {lang === 'zh-TW' ? '會員顧客綁定 (Customer)' : 'Customer Profile'}
                      </label>
                      {selectedCustomer && (
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerId('')}
                          className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          {lang === 'zh-TW' ? '取消綁定' : 'Unlink Customer'}
                        </button>
                      )}
                    </div>
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-pointer shadow-2xs transition-all"
                    >
                      <option value="">{lang === 'zh-TW' ? '散客 / 臨客 (Walk-in Guest)' : 'Walk-in Guest'}</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : '(無電話)'} {c.tier ? `• [${c.tier}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Info Card */}
                  {selectedCustomer ? (
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 dark:border-amber-900/40 dark:bg-amber-950/20 shadow-2xs animate-in fade-in transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF8A00] text-white font-black text-sm shadow-xs">
                            {selectedCustomer.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">
                                {selectedCustomer.name}
                              </h4>
                              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                                selectedCustomer.tier === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                                selectedCustomer.tier === 'Gold' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                selectedCustomer.tier === 'Silver' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
                                'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                              }`}>
                                <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                                {selectedCustomer.tier || 'Bronze'}
                              </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
                              <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-bold">
                                <Phone className="mr-0.5 h-3 w-3" />
                                {selectedCustomer.phone || (lang === 'zh-TW' ? '尚未建檔電話' : 'No Phone Number')}
                              </span>
                              <span>•</span>
                              <span>{selectedCustomer.loyaltyPoints || 0} pts</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newPhone = prompt(
                              lang === 'zh-TW' ? `請輸入 ${selectedCustomer.name} 的手機號碼:` : `Enter phone number for ${selectedCustomer.name}:`,
                              selectedCustomer.phone || '0912-345-678'
                            );
                            if (newPhone !== null) {
                              const updated = { ...selectedCustomer, phone: newPhone.trim() };
                              if (onUpdateCustomer) {
                                onUpdateCustomer(updated);
                              } else if (onAddCustomer) {
                                onAddCustomer(updated);
                              }
                            }
                          }}
                          className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-[10px] font-bold text-amber-900 shadow-2xs hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-200 dark:border-amber-700 cursor-pointer shrink-0"
                          title="修改或新增顧客手機號碼"
                        >
                          {selectedCustomer.phone ? (lang === 'zh-TW' ? '修改電話' : 'Edit Phone') : (lang === 'zh-TW' ? '+ 補電話' : '+ Add Phone')}
                        </button>
                      </div>

                      {selectedCustomer.notes && (
                        <div className="mt-2 text-[10px] font-medium text-amber-900/90 dark:text-amber-200/90 bg-amber-100/60 dark:bg-amber-900/30 p-1.5 rounded-lg border border-amber-200/50">
                          📌 {selectedCustomer.notes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-2 text-center text-[10px] font-medium text-gray-400 dark:border-gray-800 dark:bg-gray-900/30">
                      {lang === 'zh-TW' ? '未選擇會員，本筆訂單將登記為散客' : 'Walk-in guest selected'}
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="my-3 max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1 dark:divide-gray-800">
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    <UtensilsCrossed className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <span>Click dishes on the left to add to cart</span>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex-1 pr-2">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100">
                          {item.name}
                        </p>
                        {item.modifiers.length > 0 && (
                          <p className="text-[10px] text-[#FF8A00]">
                            • {item.modifiers.join(', ')}
                          </p>
                        )}
                        {item.kitchenNotes && (
                          <p className="text-[10px] text-gray-400 italic">"{item.kitchenNotes}"</p>
                        )}
                        <p className="text-xs font-semibold text-gray-500">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="rounded-lg border border-gray-200 p-1 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-black px-1">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="rounded-lg border border-gray-200 p-1 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          className="ml-1 rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Kitchen Notes Input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Kitchen Notes for entire order..."
                  value={kitchenNotes}
                  onChange={e => setKitchenNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between mb-3 text-xs font-semibold">
                <span className="text-gray-500">Apply Discount %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                  className="w-16 rounded-lg border border-gray-200 p-1 text-center text-xs font-bold dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Financial Totals & Action Buttons - Sticky Bottom */}
            <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border-t border-gray-100 pt-3 dark:border-gray-800 space-y-2 mt-auto">
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({settings.taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Charge ({settings.serviceChargeRate}%):</span>
                  <span>${serviceChargeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-1 border-t border-dashed">
                  <span>TOTAL:</span>
                  <span className="text-[#FF8A00]">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleSendToKitchen}
                  disabled={cartItems.length === 0}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-gray-900 py-3 text-xs font-bold text-white shadow-md hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 cursor-pointer transition-all"
                >
                  <ChefHat className="h-4 w-4 text-[#FF8A00]" />
                  <span>Send to Kitchen</span>
                </button>

                <button
                  onClick={() => {
                    handleSendToKitchen();
                    // trigger checkout for recent order
                    const selectedTable = tables.find(t => t.id === selectedTableId);
                    const orderToCheckout: Order = {
                      id: 'ord-' + Date.now(),
                      orderNumber: 'ORD-' + Math.floor(100 + Math.random() * 900),
                      type: orderType,
                      tableId: selectedTableId,
                      tableName: selectedTable?.name,
                      items: cartItems,
                      status: 'Pending',
                      discountPercentage: discountPercent,
                      discountAmount,
                      taxRate: settings.taxRate,
                      taxAmount,
                      serviceChargeRate: settings.serviceChargeRate,
                      serviceChargeAmount,
                      subtotal,
                      totalAmount,
                      paymentStatus: 'Unpaid',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      createdBy: 'Staff',
                    };
                    onProceedToCheckout(orderToCheckout);
                  }}
                  disabled={cartItems.length === 0}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#FF8A00] py-3 text-xs font-bold text-white shadow-md hover:bg-[#e07900] active:scale-98 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ORDER HISTORY TAB */
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
          {onMergeOrders && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-50/80 p-3 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300">Merge Orders Tool:</span> Select 2 or more unpaid orders below to combine them into one order.
              </div>
              <button
                type="button"
                disabled={selectedOrderIdsToMerge.length < 2}
                onClick={() => {
                  if (onMergeOrders && selectedOrderIdsToMerge.length >= 2) {
                    onMergeOrders(selectedOrderIdsToMerge);
                    setSelectedOrderIdsToMerge([]);
                  }
                }}
                className={`rounded-xl px-4 py-1.5 text-xs font-extrabold transition-all ${
                  selectedOrderIdsToMerge.length >= 2
                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed'
                }`}
              >
                🔀 Merge Selected Orders ({selectedOrderIdsToMerge.length})
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                  <th className="py-3 px-2">Select</th>
                  <th className="py-3">Order Number</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Table / Customer</th>
                  <th className="py-3">Items Summary</th>
                  <th className="py-3">Total Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                {orders.map(ord => {
                  const isChecked = selectedOrderIdsToMerge.includes(ord.id);
                  const isUnpaid = ord.paymentStatus !== 'Paid' && ord.status !== 'Cancelled';
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-2">
                        {isUnpaid ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedOrderIdsToMerge(prev => [...prev, ord.id]);
                              } else {
                                setSelectedOrderIdsToMerge(prev => prev.filter(id => id !== ord.id));
                              }
                            }}
                            className="rounded-md text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                        ) : (
                          <span className="text-gray-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-3 font-extrabold text-gray-900 dark:text-white">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3">{ord.type}</td>
                      <td className="py-3">{ord.tableName ? `Table ${ord.tableName}` : ord.customerName}</td>
                      <td className="py-3 max-w-xs truncate text-gray-500">
                        {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="py-3 font-black text-[#FF8A00]">${ord.totalAmount.toFixed(2)}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => receiptService.printReceipt(ord, settings)}
                          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          title="Print order thermal receipt"
                        >
                          <Printer className="mr-1 h-3 w-3 inline" />
                          Print
                        </button>
                        <button
                          onClick={() => onProceedToCheckout(ord)}
                          className="rounded-lg bg-[#FF8A00] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#e07900]"
                        >
                          Checkout
                        </button>
                        <button
                          onClick={() => onCancelOrder(ord.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISH CUSTOMIZATION MODAL WITH CHECKBOXES FOR EVERY DISH */}
      <DishCustomizationModal
        isOpen={!!activeMenuItemForModifier}
        onClose={() => setActiveMenuItemForModifier(null)}
        item={activeMenuItemForModifier}
        initialModifiers={selectedModifiers}
        initialKitchenNote={itemNote}
        onConfirm={handleConfirmAddToCart}
        lang={lang}
      />
    </div>
  );
};
