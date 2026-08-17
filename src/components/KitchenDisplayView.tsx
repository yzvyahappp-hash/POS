import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Flame,
  BellRing,
  Volume2,
  Check,
  UtensilsCrossed,
  Printer,
  Sparkles,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import { Order, OrderItem, OrderStatus, RestaurantSettings } from '../types';
import { audioService } from '../services/audioService';
import { receiptService } from '../services/receiptService';
import { useTranslation } from '../i18n/useTranslation';

interface KitchenDisplayViewProps {
  orders: Order[];
  settings?: RestaurantSettings;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateOrder?: (order: Order) => void;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  settings,
  onUpdateOrderStatus,
  onUpdateOrder,
}) => {
  const { lang, t } = useTranslation();
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders by item statuses so add-ons show in Incoming without re-showing served items
  const pendingOrders = orders.filter(
    o =>
      o.status !== 'Cancelled' &&
      o.status !== 'Completed' &&
      (o.items.some(i => i.status === 'Pending') ||
        (o.status === 'Pending' && !o.items.some(i => i.status === 'Cooking' || i.status === 'Ready' || i.status === 'Served')))
  );

  const cookingOrders = orders.filter(
    o =>
      o.status !== 'Cancelled' &&
      o.status !== 'Completed' &&
      (o.items.some(i => i.status === 'Cooking') ||
        (o.status === 'Cooking' && !o.items.some(i => i.status === 'Pending')))
  );

  const readyOrders = orders.filter(
    o =>
      o.status !== 'Cancelled' &&
      o.status !== 'Completed' &&
      (o.items.some(i => i.status === 'Ready') ||
        (o.status === 'Ready' && !o.items.some(i => i.status === 'Pending' || i.status === 'Cooking')))
  );

  const servedOrders = orders.filter(
    o =>
      o.status === 'Served' ||
      (o.items.length > 0 && o.items.every(i => i.status === 'Served') && o.status !== 'Cancelled')
  ).slice(0, 8);

  const getElapsedTimeInMinutes = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const getTimerColorClass = (mins: number) => {
    if (mins < 10) return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
    if (mins < 20) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse dark:bg-rose-950 dark:text-rose-300';
  };

  // Advance items and order status seamlessly
  const handleAdvanceStatus = (orderId: string, currentStage: 'Pending' | 'Cooking' | 'Ready') => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      const nextStatus: OrderStatus = currentStage === 'Pending' ? 'Cooking' : currentStage === 'Cooking' ? 'Ready' : 'Served';
      onUpdateOrderStatus(orderId, nextStatus);
      return;
    }

    let updatedItems = [...targetOrder.items];
    let nextOrderStatus: OrderStatus = targetOrder.status;

    if (currentStage === 'Pending') {
      // Advance ONLY pending items to Cooking (keep served/cooking/ready items intact)
      updatedItems = updatedItems.map(item => {
        if (item.status === 'Pending' || (!item.status && targetOrder.status === 'Pending')) {
          return { ...item, status: 'Cooking' as const };
        }
        return item;
      });
      nextOrderStatus = 'Cooking';
    } else if (currentStage === 'Cooking') {
      // Advance ONLY cooking items to Ready
      updatedItems = updatedItems.map(item => {
        if (item.status === 'Cooking' || (!item.status && targetOrder.status === 'Cooking')) {
          return { ...item, status: 'Ready' as const };
        }
        return item;
      });
      nextOrderStatus = 'Ready';
      audioService.playOrderReady();
    } else if (currentStage === 'Ready') {
      // Advance ONLY ready items to Served
      updatedItems = updatedItems.map(item => {
        if (item.status === 'Ready' || (!item.status && targetOrder.status === 'Ready')) {
          return { ...item, status: 'Served' as const };
        }
        return item;
      });
      const allServed = updatedItems.every(item => item.status === 'Served');
      nextOrderStatus = allServed ? 'Served' : 'Cooking';
    }

    const updatedOrder: Order = {
      ...targetOrder,
      items: updatedItems,
      status: nextOrderStatus,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateOrder) {
      onUpdateOrder(updatedOrder);
    } else {
      onUpdateOrderStatus(orderId, nextOrderStatus);
    }
  };

  // Individual item bump action
  const handleBumpItem = (orderId: string, itemId: string, newStatus: OrderItem['status']) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedItems = targetOrder.items.map(i => (i.id === itemId ? { ...i, status: newStatus } : i));
    const hasPending = updatedItems.some(i => i.status === 'Pending');
    const hasCooking = updatedItems.some(i => i.status === 'Cooking');
    const hasReady = updatedItems.some(i => i.status === 'Ready');
    const allServed = updatedItems.every(i => i.status === 'Served');

    let nextOrderStatus: OrderStatus = targetOrder.status;
    if (allServed) nextOrderStatus = 'Served';
    else if (hasReady && !hasCooking && !hasPending) nextOrderStatus = 'Ready';
    else if (hasCooking) nextOrderStatus = 'Cooking';
    else if (hasPending) nextOrderStatus = 'Pending';

    if (newStatus === 'Ready') {
      audioService.playOrderReady();
    }

    const updatedOrder: Order = {
      ...targetOrder,
      items: updatedItems,
      status: nextOrderStatus,
      updatedAt: new Date().toISOString(),
    };

    if (onUpdateOrder) {
      onUpdateOrder(updatedOrder);
    } else {
      onUpdateOrderStatus(orderId, nextOrderStatus);
    }
  };

  // Print incoming/add-on dishes only
  const handlePrintIncomingTicket = (ord: Order, incomingDishes: OrderItem[], isAddon: boolean) => {
    const ticketOrder: Order = {
      ...ord,
      items: incomingDishes,
      kitchenNotes: isAddon
        ? `[加點單 / ADD-ON DISHES ONLY] ${ord.kitchenNotes || ''}`
        : ord.kitchenNotes,
    };
    receiptService.printKitchenTicket(ticketOrder, settings);
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* KDS Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <ChefHat className="mr-2 h-6 w-6 text-[#FF8A00]" /> {t('nav_kds')} (KDS)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lang === 'zh-TW'
              ? '廚房即時接單佇列：加點餐點自動精準過濾，僅顯示新加點待製作餐點，絕不重複列出已出餐項目'
              : lang === 'ja'
              ? '厨房リアルタイム注文キュー：追加注文は未提供分のみを表示、提供済み料理は自動除外'
              : 'Real-time kitchen order queue: Add-on orders strictly display newly ordered items needing preparation'}
          </p>
        </div>

        <button
          onClick={() => audioService.playKitchenAlert()}
          className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 shadow-2xs cursor-pointer"
        >
          <Volume2 className="h-4 w-4 text-[#FF8A00]" />
          <span>{lang === 'zh-TW' ? '測試廚房鈴聲' : lang === 'ja' ? 'ベル音テスト' : 'Test Bell Sound'}</span>
        </button>
      </div>

      {/* KDS Columns Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* COLUMN 1: PENDING (NEW INCOMING DISHES) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-amber-500 p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <BellRing className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                Incoming ({pendingOrders.length})
              </h3>
            </div>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">NEW DISHES</span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-4">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {lang === 'zh-TW' ? '目前無新進待製作餐點' : 'No incoming items'}
                </p>
              </div>
            ) : (
              pendingOrders.map(ord => {
                const elapsedMins = getElapsedTimeInMinutes(ord.createdAt);

                // STRICT FILTER: Only show items that are Pending (ordered later / needing prep)
                const incomingDishes = ord.items.filter(
                  item => item.status === 'Pending' || (!item.status && ord.status === 'Pending')
                );
                const servedDishes = ord.items.filter(item => item.status === 'Served');
                const cookingDishes = ord.items.filter(item => item.status === 'Cooking');
                const readyDishes = ord.items.filter(item => item.status === 'Ready');
                const isAddonOrder = servedDishes.length > 0 || cookingDishes.length > 0 || readyDishes.length > 0;

                // Fallback in case items are not marked individually
                const displayedItems = incomingDishes.length > 0
                  ? incomingDishes
                  : ord.items.filter(i => i.status !== 'Served');

                return (
                  <div
                    key={ord.id}
                    className="flex flex-col justify-between rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-md dark:border-amber-900 dark:bg-gray-900 transition-all"
                  >
                    <div>
                      {/* Ticket Top */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-gray-900 text-sm dark:text-white">
                              {ord.orderNumber}
                            </span>
                            {isAddonOrder && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <PlusCircle className="mr-0.5 h-3 w-3 inline text-amber-600" />
                                {lang === 'zh-TW' ? '加點單' : 'Add-on'}
                              </span>
                            )}
                          </div>
                          <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            {ord.tableName ? `Table ${ord.tableName}` : ord.type}
                            {ord.customerName && ord.customerName !== 'Walk-in Guest' && ` • ${ord.customerName}`}
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getTimerColorClass(
                            elapsedMins
                          )}`}
                        >
                          <Clock className="inline h-3 w-3 mr-0.5" /> {elapsedMins}m
                        </span>
                      </div>

                      {/* Add-on Notification Banner */}
                      {isAddonOrder && (
                        <div className="mt-2 flex items-center justify-between rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-2.5 py-1.5 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                          <span className="flex items-center space-x-1">
                            <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{lang === 'zh-TW' ? '僅顯示新加點餐點' : 'Showing newly added dishes only'}</span>
                          </span>
                          {servedDishes.length > 0 && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              ✓ {servedDishes.length} {lang === 'zh-TW' ? '道已出餐' : 'already served'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Itemized List: ONLY NEW / INCOMING DISHES */}
                      <div className="my-3 space-y-2">
                        {displayedItems.map(item => (
                          <div
                            key={item.id}
                            className="group flex items-start justify-between rounded-xl p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-xs font-black text-gray-900 dark:text-gray-100 flex items-center">
                                <span className="text-[#FF8A00] font-black mr-1.5 text-sm bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-md border border-orange-200 dark:border-orange-900">
                                  {item.quantity}x
                                </span>
                                <span>{item.name}</span>
                              </div>
                              {item.modifiers && item.modifiers.length > 0 && (
                                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 pl-6 mt-0.5">
                                  • {item.modifiers.join(', ')}
                                </p>
                              )}
                              {item.kitchenNotes && (
                                <p className="text-[10px] font-medium text-rose-600 dark:text-rose-400 pl-6 mt-0.5">
                                  📝 {item.kitchenNotes}
                                </p>
                              )}
                            </div>

                            {/* Quick dish bump */}
                            <button
                              onClick={() => handleBumpItem(ord.id, item.id, 'Cooking')}
                              className="opacity-80 hover:opacity-100 text-[10px] font-bold text-orange-600 hover:text-white hover:bg-orange-500 border border-orange-300 dark:border-orange-800 px-2 py-1 rounded-lg transition-all cursor-pointer shrink-0 ml-1"
                              title="Start Cooking this dish"
                            >
                              <Flame className="inline h-3 w-3 mr-0.5" />
                              {lang === 'zh-TW' ? '下鍋' : 'Cook'}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Kitchen Note */}
                      {ord.kitchenNotes && (
                        <div className="mb-3 rounded-lg bg-amber-50 p-2 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          Note: "{ord.kitchenNotes}"
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, 'Pending')}
                        className="flex-1 flex items-center justify-center space-x-1 rounded-xl bg-[#FF8A00] py-2.5 text-xs font-black text-white shadow-md hover:bg-[#e07900] active:scale-98 transition-all cursor-pointer"
                      >
                        <Flame className="h-4 w-4" />
                        <span>{lang === 'zh-TW' ? '開始製作新餐點' : 'Start Cooking All'}</span>
                      </button>
                      <button
                        onClick={() => handlePrintIncomingTicket(ord, displayedItems, isAddonOrder)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer shadow-2xs transition-all"
                        title={lang === 'zh-TW' ? '列印新加點出單小票 (手札體 2X)' : 'Print Kitchen Ticket'}
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: COOKING (ACTIVE PREPARATION) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[#FF8A00] p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                Cooking ({cookingOrders.length})
              </h3>
            </div>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">IN PROGRESS</span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {cookingOrders.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-4">
                <Flame className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {lang === 'zh-TW' ? '目前無烹調中餐點' : 'No active prep'}
                </p>
              </div>
            ) : (
              cookingOrders.map(ord => {
                const elapsedMins = getElapsedTimeInMinutes(ord.createdAt);
                const cookingDishes = ord.items.filter(
                  item => item.status === 'Cooking' || (!item.status && ord.status === 'Cooking')
                );
                const servedDishes = ord.items.filter(item => item.status === 'Served');
                const isAddonOrder = servedDishes.length > 0;

                const displayedItems = cookingDishes.length > 0
                  ? cookingDishes
                  : ord.items.filter(i => i.status !== 'Served');

                return (
                  <div
                    key={ord.id}
                    className="flex flex-col justify-between rounded-2xl border border-orange-200 bg-white p-4 shadow-sm dark:border-orange-900/50 dark:bg-gray-900 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-gray-900 text-sm dark:text-white">
                              {ord.orderNumber}
                            </span>
                            {isAddonOrder && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300">
                                {lang === 'zh-TW' ? '加點製作中' : 'Add-on Prep'}
                              </span>
                            )}
                          </div>
                          <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-300">
                            {ord.tableName ? `Table ${ord.tableName}` : ord.type}
                            {ord.customerName && ord.customerName !== 'Walk-in Guest' && ` • ${ord.customerName}`}
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getTimerColorClass(
                            elapsedMins
                          )}`}
                        >
                          <Clock className="inline h-3 w-3 mr-0.5" /> {elapsedMins}m
                        </span>
                      </div>

                      {/* Itemized List: ONLY CURRENTLY COOKING DISHES */}
                      <div className="my-3 space-y-2">
                        {displayedItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="text-xs font-black text-gray-900 dark:text-gray-100 flex items-center">
                                <span className="text-[#FF8A00] font-black mr-1.5 text-sm bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-md border border-orange-200 dark:border-orange-900">
                                  {item.quantity}x
                                </span>
                                <span>{item.name}</span>
                              </div>
                              {item.modifiers && item.modifiers.length > 0 && (
                                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 pl-6 mt-0.5">
                                  • {item.modifiers.join(', ')}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleBumpItem(ord.id, item.id, 'Ready')}
                              className="text-[10px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-300 dark:border-indigo-800 px-2 py-1 rounded-lg transition-all cursor-pointer shrink-0 ml-1"
                              title="Mark this dish Ready"
                            >
                              <Check className="inline h-3 w-3 mr-0.5" />
                              {lang === 'zh-TW' ? '起鍋' : 'Ready'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, 'Cooking')}
                        className="flex-1 flex items-center justify-center space-x-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        <span>{lang === 'zh-TW' ? '全部餐點製作完成 (Ready)' : 'Mark Ready'}</span>
                      </button>
                      <button
                        onClick={() => receiptService.printKitchenTicket(ord, settings)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer shadow-2xs"
                        title="Print Kitchen Ticket (手札體 2X)"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR SERVING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-indigo-600 p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                Ready ({readyOrders.length})
              </h3>
            </div>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">TO PASS</span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {readyOrders.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-4">
                <CheckCircle2 className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {lang === 'zh-TW' ? '目前無待出餐餐點' : 'No dishes ready'}
                </p>
              </div>
            ) : (
              readyOrders.map(ord => {
                const readyDishes = ord.items.filter(
                  item => item.status === 'Ready' || (!item.status && ord.status === 'Ready')
                );
                const displayedItems = readyDishes.length > 0 ? readyDishes : ord.items;

                return (
                  <div
                    key={ord.id}
                    className="flex flex-col justify-between rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900/50 dark:bg-gray-900 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <div>
                          <span className="font-black text-gray-900 text-sm dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {ord.tableName ? `Table ${ord.tableName}` : ord.type}
                            {ord.customerName && ord.customerName !== 'Walk-in Guest' && ` • ${ord.customerName}`}
                          </span>
                        </div>
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-black text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                          {displayedItems.length} {lang === 'zh-TW' ? '道待送' : 'items'}
                        </span>
                      </div>

                      <div className="my-3 space-y-2">
                        {displayedItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="text-xs font-black text-gray-900 dark:text-gray-100">
                              <span className="text-indigo-600 font-black mr-1.5 text-sm bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md border border-indigo-200">
                                {item.quantity}x
                              </span>
                              <span>{item.name}</span>
                            </div>

                            <button
                              onClick={() => handleBumpItem(ord.id, item.id, 'Served')}
                              className="text-[10px] font-bold text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-300 dark:border-emerald-800 px-2 py-1 rounded-lg transition-all cursor-pointer shrink-0 ml-1"
                              title="Mark this dish as Served"
                            >
                              <CheckCircle className="inline h-3 w-3 mr-0.5" />
                              {lang === 'zh-TW' ? '上菜' : 'Served'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdvanceStatus(ord.id, 'Ready')}
                      className="mt-2 w-full flex items-center justify-center space-x-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{lang === 'zh-TW' ? '全部出餐完成 (Mark Served)' : 'Mark All Served'}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 4: SERVED (RECENT HISTORY) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-emerald-600 p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Served</h3>
            </div>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">DELIVERED</span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {servedOrders.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-4">
                <UtensilsCrossed className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {lang === 'zh-TW' ? '尚無已出餐紀錄' : 'No served orders'}
                </p>
              </div>
            ) : (
              servedOrders.map(ord => (
                <div
                  key={ord.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3.5 text-xs dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <div className="flex justify-between font-bold text-gray-700 dark:text-gray-300">
                    <span className="font-black text-gray-900 dark:text-white">{ord.orderNumber}</span>
                    <span>{ord.tableName ? `Table ${ord.tableName}` : ord.type}</span>
                  </div>
                  <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                    {ord.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span>• {item.quantity}x {item.name}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ {lang === 'zh-TW' ? '已上菜' : 'Served'}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 border-t border-gray-200/50 dark:border-gray-800 pt-1.5">
                    {lang === 'zh-TW' ? '最後更新' : 'Updated at'}{' '}
                    {new Date(ord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
