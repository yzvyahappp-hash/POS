import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  ExternalLink,
  CreditCard,
  User,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ChevronRight,
  Download,
  ShoppingBag,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { Order, RestaurantSettings, Table, Customer } from '../types';
import {
  receiptService,
  translateOrderType,
  translatePaymentMethod,
  translatePaymentStatus,
  translateText,
} from '../services/receiptService';

interface ReceiptsViewProps {
  orders: Order[];
  tables: Table[];
  settings: RestaurantSettings;
  customers?: Customer[];
  onUpdateCustomer?: (customer: Customer) => void;
  onUpdateOrder?: (order: Order) => void;
  onOpenReceiptModal: (order: Order) => void;
  onProceedToCheckout?: (order: Order) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  orders,
  tables,
  settings,
  customers = [],
  onUpdateCustomer,
  onUpdateOrder,
  onOpenReceiptModal,
  onProceedToCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPayMethod, setSelectedPayMethod] = useState<string>('ALL');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('ALL');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('ALL');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'createdAt' | 'totalAmount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - now.getDay() * 86400000;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const numMatch = (order.orderNumber || '').toLowerCase().includes(q);
        const custMatch = (order.customerName || '').toLowerCase().includes(q);
        const tblMatch = (order.tableName || '').toLowerCase().includes(q);
        const itemMatch = (order.items || []).some(i => i.name.toLowerCase().includes(q));
        if (!numMatch && !custMatch && !tblMatch && !itemMatch) {
          return false;
        }
      }

      // Payment Status
      if (selectedStatus !== 'ALL') {
        const isPaid = order.paymentStatus === 'Paid';
        if (selectedStatus === 'PAID' && !isPaid) return false;
        if (selectedStatus === 'UNPAID' && isPaid) return false;
      }

      // Payment Method
      if (selectedPayMethod !== 'ALL') {
        const pm = (order.paymentMethod || '').toLowerCase();
        if (selectedPayMethod === 'Cash' && !pm.includes('cash') && !pm.includes('現金')) return false;
        if (selectedPayMethod === 'Card' && !pm.includes('card') && !pm.includes('信用卡')) return false;
        if (selectedPayMethod === 'QR' && !pm.includes('qr') && !pm.includes('pay') && !pm.includes('wallet')) return false;
      }

      // Order Type
      if (selectedOrderType !== 'ALL') {
        if (selectedOrderType === 'Dine-in' && order.type !== 'Dine-in') return false;
        if ((selectedOrderType === 'Takeout' || selectedOrderType === 'Takeaway') && (order.type !== 'Takeaway' && (order.type as string) !== 'Takeout')) return false;
        if (selectedOrderType === 'Delivery' && order.type !== 'Delivery') return false;
      }

      // Date Range
      if (selectedDateRange !== 'ALL' && order.createdAt) {
        const t = new Date(order.createdAt).getTime();
        if (selectedDateRange === 'TODAY' && t < startOfToday) return false;
        if (selectedDateRange === 'YESTERDAY' && (t < startOfYesterday || t >= startOfToday)) return false;
        if (selectedDateRange === 'THIS_WEEK' && t < startOfWeek) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'createdAt') {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else {
        valA = a.totalAmount || 0;
        valB = b.totalAmount || 0;
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [
    orders,
    searchQuery,
    selectedStatus,
    selectedPayMethod,
    selectedOrderType,
    selectedDateRange,
    sortField,
    sortOrder,
    startOfToday,
    startOfYesterday,
    startOfWeek,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = filteredOrders.length;
    const paidOrders = filteredOrders.filter(
      o => o.paymentStatus === 'Paid'
    );
    const paidCount = paidOrders.length;
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const avgSpend = paidCount > 0 ? totalRevenue / paidCount : 0;

    return {
      totalCount,
      paidCount,
      unpaidCount: totalCount - paidCount,
      totalRevenue,
      avgSpend,
    };
  }, [filteredOrders]);

  const currencySymbol = settings.currencySymbol || '$';

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 dark:bg-gray-950 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl text-[#FF8A00]">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  顧客消費明細紀錄
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  完整檢視每一筆顧客餐點消費、桌號、結帳方式與即時金額明細
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedPayMethod('ALL');
                setSelectedOrderType('ALL');
                setSelectedDateRange('ALL');
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
              <span>重設篩選</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">總交易筆數</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {stats.totalCount} <span className="text-xs font-normal text-gray-400">筆</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {stats.paidCount} 已結帳 · {stats.unpaidCount} 待付款
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">已入帳消費總額</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {currencySymbol}{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
                累計完成結帳之實收金額
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">平均單筆消費 (客單價)</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {currencySymbol}{stats.avgSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-medium">
                根據 {stats.paidCount} 筆已結帳計算
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">結帳達成率</p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.totalCount > 0 ? Math.round((stats.paidCount / stats.totalCount) * 100) : 0}%
              </h3>
              <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 font-medium">
                {stats.paidCount} / {stats.totalCount} 筆單據完結
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜尋單號、顧客姓名、桌號、餐點名稱..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
              />
            </div>

            {/* Date filter */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">日期：</span>
              {[
                { id: 'ALL', label: '全部時間' },
                { id: 'TODAY', label: '今日消費' },
                { id: 'YESTERDAY', label: '昨日消費' },
                { id: 'THIS_WEEK', label: '本週累積' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDateRange(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDateRange === d.id
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters: Status, Payment Method, Order Type */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Payment status filter */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <span className="px-2 font-bold text-gray-500 text-[11px]">狀態：</span>
                {[
                  { id: 'ALL', label: '全部' },
                  { id: 'PAID', label: '已付款' },
                  { id: 'UNPAID', label: '待結帳' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStatus(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedStatus === s.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Payment method filter */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <span className="px-2 font-bold text-gray-500 text-[11px]">方式：</span>
                {[
                  { id: 'ALL', label: '全部' },
                  { id: 'Cash', label: '現金' },
                  { id: 'Card', label: '信用卡' },
                  { id: 'QR', label: '行動支付' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPayMethod(p.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedPayMethod === p.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Order type filter */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <span className="px-2 font-bold text-gray-500 text-[11px]">型態：</span>
                {[
                  { id: 'ALL', label: '全部' },
                  { id: 'Dine-in', label: '內用' },
                  { id: 'Takeout', label: '外帶' },
                  { id: 'Delivery', label: '外送' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedOrderType(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedOrderType === t.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-gray-400 text-[11px]">排序方式：</span>
              <button
                onClick={() => {
                  if (sortField === 'createdAt') {
                    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('createdAt');
                    setSortOrder('desc');
                  }
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  sortField === 'createdAt'
                    ? 'border-[#FF8A00] text-[#FF8A00] bg-amber-50 dark:bg-amber-950/30'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>時間 {sortField === 'createdAt' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
              </button>

              <button
                onClick={() => {
                  if (sortField === 'totalAmount') {
                    setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
                  } else {
                    setSortField('totalAmount');
                    setSortOrder('desc');
                  }
                }}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  sortField === 'totalAmount'
                    ? 'border-[#FF8A00] text-[#FF8A00] bg-amber-50 dark:bg-amber-950/30'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <DollarSign className="h-3 w-3" />
                <span>金額 {sortField === 'totalAmount' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Receipts Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500">
              <Receipt className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">尚無符合條件的顧客消費明細</p>
              <p className="text-xs text-gray-400 mt-1">請嘗試調整搜尋關鍵字或篩選條件</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">訂單編號 / 時間</th>
                    <th className="py-3 px-4">顧客姓名</th>
                    <th className="py-3 px-4">桌號 / 型態</th>
                    <th className="py-3 px-4">餐點明細摘要</th>
                    <th className="py-3 px-4">結帳方式</th>
                    <th className="py-3 px-4">付款狀態</th>
                    <th className="py-3 px-4 text-right">消費總額</th>
                    <th className="py-3 px-4 text-center">明細操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredOrders.map(order => {
                    const formattedDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A';

                    const isPaid = order.paymentStatus === 'Paid';
                    const formattedPayStatus = translatePaymentStatus(order.paymentStatus);
                    const formattedPayMethod = translatePaymentMethod(order.paymentMethod);
                    const formattedOrderType = translateOrderType(order.type);
                    const customerName = order.customerName || '散客 / 現場顧客';
                    const tableName = order.tableName || (order.type === 'Dine-in' ? '未指定桌位' : '非內用');

                    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                    const remainingItemCount = (order.items || []).length - 1;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors group"
                      >
                        {/* Order # & Time */}
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-gray-900 dark:text-white flex items-center space-x-1.5">
                            <Receipt className="h-3.5 w-3.5 text-[#FF8A00]" />
                            <span>{order.orderNumber}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                          <div className="flex items-center space-x-1.5">
                            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[120px]">{customerName}</span>
                          </div>
                          {order.createdBy && (
                            <span className="text-[10px] text-gray-400 block font-normal">
                              服務員: {order.createdBy}
                            </span>
                          )}
                        </td>

                        {/* Table / Order Type */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            <MapPin className="h-3 w-3 mr-1 text-amber-500" />
                            {tableName}
                          </span>
                          <span className="text-[10px] text-gray-400 block mt-0.5 ml-1">
                            {formattedOrderType}
                          </span>
                        </td>

                        {/* Items Summary */}
                        <td className="py-3 px-4 max-w-[200px]">
                          {firstItem ? (
                            <div className="text-gray-800 dark:text-gray-200 font-medium truncate">
                              <span className="font-bold text-[#FF8A00] mr-1">
                                {firstItem.quantity}x
                              </span>
                              {translateText(firstItem.name)}
                              {remainingItemCount > 0 && (
                                <span className="ml-1 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                  +{remainingItemCount} 項
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">無餐點項目</span>
                          )}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <CreditCard className="h-3 w-3" />
                            <span>{formattedPayMethod}</span>
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                            )}
                            <span>{formattedPayStatus}</span>
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-4 text-right">
                          <div className="text-sm font-black text-gray-900 dark:text-white">
                            {currencySymbol}{(order.totalAmount || 0).toFixed(2)}
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="text-[10px] text-rose-500 font-bold">
                              省 ${order.discountAmount.toFixed(2)} ({order.discountPercentage}%)
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {/* Open Thermal Receipt Modal */}
                            <button
                              onClick={() => onOpenReceiptModal(order)}
                              title="檢視與列印熱感應明細"
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all shadow-2xs"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>

                            {/* Open Printable in New Tab */}
                            <button
                              onClick={() => receiptService.openReceiptNewWindow(order, settings)}
                              title="在新分頁開啟全頁明細單"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-500 hover:text-white transition-all shadow-2xs"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>

                            {/* Proceed to Checkout if Unpaid */}
                            {!isPaid && onProceedToCheckout && (
                              <button
                                onClick={() => onProceedToCheckout(order)}
                                title="進行結帳"
                                className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 transition-all shadow-2xs"
                              >
                                結帳
                              </button>
                            )}

                            {/* Detail Drawer Button */}
                            <button
                              onClick={() => setSelectedOrderForDetail(order)}
                              title="查看詳細內容"
                              className="p-1.5 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Slide-over Modal */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-[#FF8A00]" />
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    消費明細詳情 #{selectedOrderForDetail.orderNumber}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {selectedOrderForDetail.createdAt
                      ? new Date(selectedOrderForDetail.createdAt).toLocaleString('zh-TW')
                      : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Customer & Table */}
              {(() => {
                const ord = selectedOrderForDetail;
                const isGenericName = !ord.customerName || ['guest', 'walk-in guest', '散客', '現場顧客', '內用賓客'].includes(ord.customerName.trim().toLowerCase());
                
                const matchedCust = customers?.find(c =>
                  (ord.customerId && c.id === ord.customerId) ||
                  (ord.customerPhone && c.phone && c.phone.replace(/\D/g, '').endsWith(ord.customerPhone.replace(/\D/g, ''))) ||
                  (!isGenericName && ord.customerName && c.name.trim().toLowerCase() === ord.customerName.trim().toLowerCase())
                );

                const currentPoints = matchedCust ? matchedCust.loyaltyPoints : ord.customerPointsBalance;

                return (
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-gray-400 block text-[11px]">顧客姓名</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {ord.customerName || '散客 / 現場顧客'}
                        </span>
                        {matchedCust?.tier && (
                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                            {matchedCust.tier}
                          </span>
                        )}
                      </div>
                      {ord.customerPhone && (
                        <span className="text-[10px] font-mono text-gray-400 block">{ord.customerPhone}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">桌號與型態</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {ord.tableName || '未指定'} ({translateOrderType(ord.type)})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">付款方式</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {translatePaymentMethod(ord.paymentMethod)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">付款狀態</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {translatePaymentStatus(ord.paymentStatus)}
                      </span>
                    </div>

                    {/* Member & Points Status */}
                    <div className="col-span-2 pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-bold">
                          <span>⭐ 本次獲得點數:</span>
                          <span className="bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300">
                            +{Math.max(1, Math.floor(ord.totalAmount || 0))} pts
                          </span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 text-xs">
                          <span className="text-gray-400">會員帳戶餘額: </span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {currentPoints !== undefined ? `${currentPoints} pts` : '已入帳'}
                          </span>
                        </div>
                      </div>

                      {matchedCust && (
                        <div className="flex items-center justify-between text-[11px] bg-white dark:bg-gray-900/80 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                          <span className="text-gray-500 dark:text-gray-400">
                            累計消費總額: <strong className="text-[#FF8A00]">${matchedCust.totalSpent.toFixed(2)}</strong>
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            來訪次數: <strong className="text-gray-900 dark:text-white">{matchedCust.visitCount} 次</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Items List */}
              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">點餐品項明細</h4>
                <div className="space-y-2 border border-gray-100 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-900">
                  {(selectedOrderForDetail.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start border-b border-gray-50 dark:border-gray-800/50 pb-2 last:border-none last:pb-0"
                    >
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          <span className="text-[#FF8A00] mr-1">{item.quantity || 1}x</span>
                          {translateText(item.name || '')}
                        </div>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-[10px] text-gray-400 pl-4">
                            • {item.modifiers.map(m => translateText(m)).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Calculations */}
              {(() => {
                const ord = selectedOrderForDetail;
                const subtotal = ord.subtotal || ord.totalAmount || 0;
                const promoDiscount =
                  ord.promoDiscountAmount ||
                  (ord.appliedPromos && ord.appliedPromos.length > 0
                    ? ord.appliedPromos.reduce((s, p) => s + (p.discountAmount || 0), 0)
                    : 0);

                const pointsDiscount = ord.pointsDiscountAmount || 0;

                const couponDiscount =
                  ord.couponDiscountAmount ||
                  (ord.couponCode && (ord.discountAmount || 0) > 0 && !promoDiscount && !pointsDiscount
                    ? ord.discountAmount
                    : 0);

                const percentageDiscount =
                  ord.percentageDiscountAmount ||
                  ((ord.discountPercentage || 0) > 0
                    ? (subtotal * ord.discountPercentage) / 100
                    : 0);

                const manualDiscount =
                  (ord.discountAmount || 0) > 0 &&
                  !(promoDiscount || pointsDiscount || couponDiscount || percentageDiscount)
                    ? ord.discountAmount || 0
                    : 0;

                const computedSum = promoDiscount + pointsDiscount + couponDiscount + percentageDiscount + manualDiscount;
                const totalCombinedDiscount = Math.max(ord.discountAmount || 0, computedSum);

                return (
                  <div className="space-y-2 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300 font-semibold">
                      <span>小計金額</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {/* 完整的折抵明細 */}
                    <div className="pt-2 border-t border-gray-200/80 dark:border-gray-700/80">
                      <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center justify-between">
                        <span>完整的折抵明細</span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {totalCombinedDiscount > 0 ? `已折抵 -$${totalCombinedDiscount.toFixed(2)}` : '折扣記錄'}
                        </span>
                      </div>

                      {totalCombinedDiscount > 0 ? (
                        <div className="space-y-1 pl-1">
                          {ord.appliedPromos && ord.appliedPromos.length > 0 ? (
                            ord.appliedPromos.map((p, idx) => (
                              <div key={idx} className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                                <span>🎁 優惠: {p.title} ({p.reason})</span>
                                <span>-${p.discountAmount.toFixed(2)}</span>
                              </div>
                            ))
                          ) : promoDiscount > 0 ? (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>🎁 自動組合/滿額特惠</span>
                              <span>-${promoDiscount.toFixed(2)}</span>
                            </div>
                          ) : null}

                          {pointsDiscount > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>🌟 會員點數折抵 ({ord.pointsRedeemed || 0} pts)</span>
                              <span>-${pointsDiscount.toFixed(2)}</span>
                            </div>
                          )}

                          {(couponDiscount > 0 || (ord.couponCode && ord.couponCode.trim() !== '')) && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>🏷️ 優惠券折抵 ({ord.couponCode || '折價券'})</span>
                              <span>-${(couponDiscount || (ord.discountAmount && !promoDiscount && !pointsDiscount ? ord.discountAmount : 0)).toFixed(2)}</span>
                            </div>
                          )}

                          {(percentageDiscount > 0 || manualDiscount > 0 || (ord.discountPercentage || 0) > 0) && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                              <span>✂️ 整單折扣 ({ord.discountPercentage || 0}%)</span>
                              <span>-${(percentageDiscount || manualDiscount || ord.discountAmount || 0).toFixed(2)}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-rose-500 font-bold pt-1 pb-1 border-t border-b border-dashed border-gray-200 dark:border-gray-700">
                            <span>合計總折扣金額</span>
                            <span>-${totalCombinedDiscount.toFixed(2)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-[11px] font-medium flex justify-between items-center">
                          <span>折抵套用結果</span>
                          <span className="text-gray-400 dark:text-gray-500 italic font-semibold">未使用任何折抵</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-[11px] pt-1">
                      <span>營業稅金 ({ord.taxRate || 0}%)</span>
                      <span>${(ord.taxAmount || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-[11px]">
                      <span>服務費 ({ord.serviceChargeRate || 0}%)</span>
                      <span>${(ord.serviceChargeAmount || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between font-black text-sm text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>總計金額</span>
                      <span className="text-[#FF8A00]">
                        ${(ord.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex space-x-2">
              <button
                onClick={() => {
                  onOpenReceiptModal(selectedOrderForDetail);
                  setSelectedOrderForDetail(null);
                }}
                className="flex-1 py-2.5 bg-[#FF8A00] text-white rounded-xl font-bold text-xs hover:bg-[#e07900] transition-all flex items-center justify-center space-x-1.5 shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>開啟與列印明細</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
