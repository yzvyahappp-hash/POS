import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Grid,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  Plus,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Table, Order, Reservation, MenuItem, RestaurantSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/mockData';
import { useTranslation } from '../i18n/useTranslation';
import { translateCategory, translateOrderStatus } from '../utils/i18nHelpers';

interface DashboardViewProps {
  tables?: Table[];
  orders?: Order[];
  reservations?: Reservation[];
  menuItems?: MenuItem[];
  settings?: RestaurantSettings;
  onNavigateTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onNewOrder?: () => void;
  onOpenTableOrder?: (table: Table) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tables = [],
  orders = [],
  reservations = [],
  menuItems = [],
  settings = INITIAL_SETTINGS,
  onNavigateTab,
  onNavigate,
  onNewOrder,
  onOpenTableOrder,
}) => {
  const { lang, t } = useTranslation();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' • ' +
          now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const safeTables = tables || [];
  const safeOrders = orders || [];
  const safeReservations = reservations || [];
  const safeMenuItems = menuItems || [];
  const safeSettings = settings || INITIAL_SETTINGS;

  const navigateTab = (tab: string) => {
    if (onNavigateTab) onNavigateTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  // Calculations
  const occupiedTables = safeTables.filter(t => t.status === 'Occupied');
  const availableTables = safeTables.filter(t => t.status === 'Available');
  const pendingOrders = safeOrders.filter(o => o.status === 'Pending' || o.status === 'Cooking');
  const todayReservations = safeReservations.filter(r => r.status === 'Upcoming');

  const dailyRevenue = safeOrders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const occupancyRate = safeTables.length > 0 ? Math.round((occupiedTables.length / safeTables.length) * 100) : 0;

  // Chart Mock Data for hourly revenue
  const revenueChartData = [
    { time: '10:00', revenue: 120 },
    { time: '12:00', revenue: 480 },
    { time: '14:00', revenue: 750 },
    { time: '16:00', revenue: 390 },
    { time: '18:00', revenue: 1120 },
    { time: '20:00', revenue: 1680 },
    { time: '22:00', revenue: 920 },
  ];

  const popularItems = menuItems.filter(m => m.isPopular).slice(0, 4);

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 text-white shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF8A00]/20 px-3 py-1 text-xs font-bold text-[#FF8A00] border border-[#FF8A00]/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {lang === 'zh-TW' ? '餐廳即時營運總覽' : lang === 'ja' ? '店舗リアルタイム概況' : 'Live Restaurant Overview'}
            </span>
            {currentTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800/80 px-3 py-1 text-xs font-semibold text-amber-300 border border-gray-700/60">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {currentTime}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {lang === 'zh-TW' ? `歡迎使用 ${settings.restaurantName}` : lang === 'ja' ? `ようこそ ${settings.restaurantName}` : `Welcome to ${settings.restaurantName}`}
          </h1>
          <p className="mt-1 text-xs text-gray-300">
            {lang === 'zh-TW' ? `${occupiedTables.length} 桌入座中 • 廚房尚有 ${pendingOrders.length} 筆待處理訂單` : lang === 'ja' ? `${occupiedTables.length} テーブル使用中 • 厨房調理中 ${pendingOrders.length} 件` : `${occupiedTables.length} tables active now • ${pendingOrders.length} orders in kitchen`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onNewOrder}
            className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-[#e07900] active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t('new_order')}</span>
          </button>
          <button
            onClick={() => onNavigateTab('reservations')}
            className="flex items-center space-x-2 rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-xs font-bold text-gray-200 hover:bg-gray-700 transition-all cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>{t('nav_reservations')}</span>
          </button>
          <button
            onClick={() => onNavigateTab('floorplan')}
            className="flex items-center space-x-2 rounded-xl border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-xs font-bold text-gray-200 hover:bg-gray-700 transition-all cursor-pointer"
          >
            <Grid className="h-4 w-4 text-emerald-400" />
            <span>{t('nav_floorplan')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Revenue Card */}
        <div className="stat-card-sleek dark:bg-gray-900 dark:border-gray-800">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {t('daily_revenue')}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white my-1">
            {settings?.currencySymbol || '$'}
            {dailyRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] font-semibold text-[#10B981] flex items-center">
            ↑ 12.4% {lang === 'zh-TW' ? '較昨日提升' : lang === 'ja' ? '前日比' : 'from yesterday'}
          </div>
        </div>

        {/* Occupied Tables Card */}
        <div className="stat-card-sleek dark:bg-gray-900 dark:border-gray-800">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {t('occupied_tables')}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white my-1">
            {occupiedTables.length} / {safeTables.length}
          </div>
          <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
            {occupancyRate}% {lang === 'zh-TW' ? '目前入座率' : lang === 'ja' ? '現在の稼働率' : 'current capacity'}
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="stat-card-sleek dark:bg-gray-900 dark:border-gray-800">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {t('pending_orders')}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white my-1">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] font-semibold text-[#F59E0B]">
            {pendingOrders.length > 0 ? (lang === 'zh-TW' ? `${pendingOrders.length} 筆廚房製作中` : lang === 'ja' ? `${pendingOrders.length} 件調理中` : `${pendingOrders.length} priority tickets`) : (lang === 'zh-TW' ? '出餐完畢' : lang === 'ja' ? '調理完了' : 'All clear')}
          </div>
        </div>

        {/* Reservations Today Card */}
        <div className="stat-card-sleek dark:bg-gray-900 dark:border-gray-800">
          <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
            {t('upcoming_bookings')}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white my-1">
            {todayReservations.length}
          </div>
          <div className="text-[11px] font-semibold text-[#3B82F6]">
            {lang === 'zh-TW' ? '今日尚有訂位需求' : lang === 'ja' ? '本日ご来店予定' : 'For today'}
          </div>
        </div>
      </div>

      {/* Middle Grid: Revenue Chart & Table Floor Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-gray-900 text-sm dark:text-white">
                {lang === 'zh-TW' ? '時段營業額走勢圖' : lang === 'ja' ? '時間帯別売上推移' : 'Hourly Revenue Flow'}
              </h3>
              <p className="text-xs text-gray-400">
                {lang === 'zh-TW' ? '即時每小時營業趨勢分析' : lang === 'ja' ? 'リアルタイム時間帯別売上分析' : 'Real-time hourly sales progression'}
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50">
              {lang === 'zh-TW' ? '高峰時段：20:00' : lang === 'ja' ? 'ピーク: 20:00' : 'Peak: 8:00 PM'}
            </span>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`$${val}`, 'Revenue']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#eee',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF8A00"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Floor Status Matrix */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="font-extrabold text-gray-900 text-sm dark:text-white">
              Table Matrix
            </h3>
            <button
              onClick={() => navigateTab('floorplan')}
              className="text-xs font-bold text-[#FF8A00] hover:underline"
            >
              Interactive Floor &rarr;
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {safeTables.slice(0, 9).map(tbl => {
              const statusColors = {
                Available: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
                Occupied: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
                Reserved: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
                Cleaning: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
              };

              return (
                <div
                  key={tbl.id}
                  onClick={() => navigateTab('floorplan')}
                  className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all hover:scale-105 ${
                    statusColors[tbl.status]
                  }`}
                >
                  <span className="block text-xs font-black">{tbl.name}</span>
                  <span className="block text-[9px] font-semibold opacity-80 mt-0.5">
                    {tbl.seats} Seats • {tbl.status}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-around text-[10px] font-semibold text-gray-500 border-t border-gray-100 pt-3 dark:border-gray-800">
            <span className="flex items-center">
              <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500" /> Available ({availableTables.length})
            </span>
            <span className="flex items-center">
              <span className="mr-1 h-2 w-2 rounded-full bg-rose-500" /> Occupied ({occupiedTables.length})
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Orders & Top Dishes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Orders Stream */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="font-extrabold text-gray-900 text-sm dark:text-white">
              Active Orders Flow
            </h3>
            <button
              onClick={() => navigateTab('orders')}
              className="text-xs font-bold text-[#FF8A00] hover:underline"
            >
              All Orders ({safeOrders.length}) &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-gray-100 overflow-x-auto dark:divide-gray-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2">Order</th>
                  <th className="py-2">Table / Type</th>
                  <th className="py-2">Items</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {safeOrders.slice(0, 5).map(ord => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-3 font-bold text-gray-900 dark:text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">
                      {ord.tableName ? `Table ${ord.tableName}` : ord.type}
                    </td>
                    <td className="py-3 text-gray-500 max-w-xs truncate">
                      {(ord.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 font-bold text-gray-900 dark:text-white">
                      ${ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ord.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Ready'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ord.status === 'Cooking'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#FF8A00]/20 text-[#FF8A00]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <h3 className="font-extrabold text-gray-900 text-sm dark:text-white flex items-center">
              <Award className="mr-1.5 h-4 w-4 text-[#FF8A00]" /> Popular Dishes
            </h3>
            <button
              onClick={() => navigateTab('menu')}
              className="text-xs font-bold text-[#FF8A00] hover:underline"
            >
              Menu Catalog
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {safeMenuItems.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
                  }}
                  className="h-12 w-12 rounded-xl object-cover border border-gray-100"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-bold text-gray-800 dark:text-gray-100">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.category}</p>
                </div>
                <span className="text-xs font-extrabold text-[#FF8A00]">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
