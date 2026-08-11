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
  onAddCustomer?: (customer: Customer) => void;
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
  onAddCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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

  // Auto-select and auto-register customer when table is selected
  React.useEffect(() => {
    if (orderType === 'Dine-in' && selectedTableId) {
      const selectedTbl = tables.find(t => t.id === selectedTableId || t.name === selectedTableId);
      if (selectedTbl && selectedTbl.customerName && selectedTbl.customerName !== 'Walk-in Guest') {
        const targetName = selectedTbl.customerName.trim().toLowerCase();
        const matched = customers.find(
          c => c.name.trim().toLowerCase() === targetName || c.id === selectedTbl.customerName
        );
        if (matched) {
          setSelectedCustomerId(matched.id);
        } else if (onAddCustomer) {
          // Auto-register membership for unlisted table customer
          const newMember: Customer = {
            id: 'cust-' + Date.now(),
            name: selectedTbl.customerName,
            phone: '',
            email: '',
            loyaltyPoints: 100,
            visitCount: 1,
            totalSpent: 0,
            tier: 'Bronze',
            favoriteDishes: [],
            lastVisit: new Date().toISOString().split('T')[0],
          };
          onAddCustomer(newMember);
          setSelectedCustomerId(newMember.id);
        }
      }
    }
  }, [selectedTableId, orderType, tables, customers, onAddCustomer]);

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

  const handleConfirmAddToCart = () => {
    if (!activeMenuItemForModifier) return;

    const newItem: OrderItem = {
      id: 'oi-' + Date.now() + Math.random().toString(36).substring(2, 5),
      menuItemId: activeMenuItemForModifier.id,
      name: activeMenuItemForModifier.name,
      price: activeMenuItemForModifier.price,
      quantity: 1,
      modifiers: selectedModifiers,
      addOns: [],
      kitchenNotes: itemNote,
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
                    src={item.image}
                    alt={item.name}
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
          <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900 lg:col-span-5">
            <div>
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

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {orderType === 'Dine-in' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400">Select Table</label>
                      <select
                        value={selectedTableId}
                        onChange={e => setSelectedTableId(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 p-1.5 text-xs font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        {tables.map(tbl => (
                          <option key={tbl.id} value={tbl.id}>
                            Table {tbl.name} ({tbl.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={orderType !== 'Dine-in' ? 'col-span-2' : ''}>
                    <label className="block text-[10px] font-bold text-gray-400">Customer</label>
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 p-1.5 text-xs font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      <option value="">Walk-in Guest</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>
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

            {/* Financial Totals & Action Buttons */}
            <div className="border-t border-gray-100 pt-3 dark:border-gray-800 space-y-2">
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
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-gray-900 py-3 text-xs font-bold text-white shadow-md hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
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
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#FF8A00] py-3 text-xs font-bold text-white shadow-md hover:bg-[#e07900] disabled:opacity-50"
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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
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
                {orders.map(ord => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODIFIER SELECTION DRAWER MODAL */}
      {activeMenuItemForModifier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  {activeMenuItemForModifier.name}
                </h3>
                <p className="text-xs font-bold text-[#FF8A00]">
                  ${activeMenuItemForModifier.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setActiveMenuItemForModifier(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modifiers checklist */}
            {activeMenuItemForModifier.modifiers && activeMenuItemForModifier.modifiers.length > 0 && (
              <div className="my-4">
                <label className="block text-xs font-bold text-gray-600 mb-2">
                  Select Preparation Preferences
                </label>
                <div className="space-y-1.5">
                  {activeMenuItemForModifier.modifiers.map(mod => (
                    <label
                      key={mod}
                      className="flex items-center space-x-2 rounded-xl border border-gray-200 p-2 text-xs font-semibold hover:border-[#FF8A00] cursor-pointer dark:border-gray-800 dark:text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModifiers.includes(mod)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedModifiers(prev => [...prev, mod]);
                          } else {
                            setSelectedModifiers(prev => prev.filter(m => m !== mod));
                          }
                        }}
                        className="rounded-md text-[#FF8A00]"
                      />
                      <span>{mod}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Item level note */}
            <div className="my-3">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Kitchen Note for Dish
              </label>
              <input
                type="text"
                placeholder="e.g. Extra sauce, no salt..."
                value={itemNote}
                onChange={e => setItemNote(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                onClick={() => setActiveMenuItemForModifier(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
