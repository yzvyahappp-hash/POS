import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  BellRing,
  Volume2,
  Check,
  UtensilsCrossed,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus, RestaurantSettings } from '../types';
import { audioService } from '../services/audioService';
import { receiptService } from '../services/receiptService';

interface KitchenDisplayViewProps {
  orders: Order[];
  settings?: RestaurantSettings;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const KitchenDisplayView: React.FC<KitchenDisplayViewProps> = ({
  orders,
  settings,
  onUpdateOrderStatus,
}) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const cookingOrders = orders.filter(o => o.status === 'Cooking');
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const servedOrders = orders.filter(o => o.status === 'Served').slice(0, 5);

  const getElapsedTimeInMinutes = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  const getTimerColorClass = (mins: number) => {
    if (mins < 10) return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
    if (mins < 20) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse dark:bg-rose-950 dark:text-rose-300';
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === 'Pending') nextStatus = 'Cooking';
    else if (currentStatus === 'Cooking') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'Served';

    onUpdateOrderStatus(orderId, nextStatus);

    if (nextStatus === 'Ready') {
      audioService.playOrderReady();
    }
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* KDS Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <ChefHat className="mr-2 h-6 w-6 text-[#FF8A00]" /> Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time kitchen order queue, preparation timers, and priority indicators
          </p>
        </div>

        <button
          onClick={() => audioService.playKitchenAlert()}
          className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 shadow-2xs"
        >
          <Volume2 className="h-4 w-4 text-[#FF8A00]" />
          <span>Test Bell Sound</span>
        </button>
      </div>

      {/* KDS Columns Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* COLUMN 1: PENDING (NEW INCOMING) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-amber-500 p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <BellRing className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                Incoming ({pendingOrders.length})
              </h3>
            </div>
            <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-black">NEW</span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {pendingOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No incoming orders</p>
            ) : (
              pendingOrders.map(ord => {
                const elapsedMins = getElapsedTimeInMinutes(ord.createdAt);
                return (
                  <div
                    key={ord.id}
                    className="flex flex-col justify-between rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-md dark:border-amber-900 dark:bg-gray-900"
                  >
                    <div>
                      {/* Ticket Top */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <div>
                          <span className="font-black text-gray-900 text-sm dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span className="block text-[10px] font-semibold text-gray-500">
                            {ord.tableName ? `Table ${ord.tableName}` : ord.type}
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

                      {/* Itemized List */}
                      <div className="my-3 space-y-1.5">
                        {ord.items.map(item => (
                          <div key={item.id} className="text-xs font-bold text-gray-800 dark:text-gray-100">
                            <span className="text-[#FF8A00] font-black mr-1">{item.quantity}x</span>
                            <span>{item.name}</span>
                            {item.modifiers.length > 0 && (
                              <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400 pl-4">
                                • {item.modifiers.join(', ')}
                              </p>
                            )}
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

                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, 'Pending')}
                        className="flex-1 flex items-center justify-center space-x-1 rounded-xl bg-[#FF8A00] py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                      >
                        <Flame className="h-4 w-4" />
                        <span>Start Cooking</span>
                      </button>
                      <button
                        onClick={() => receiptService.printReceipt(ord, settings)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        title="Print Kitchen Ticket"
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

        {/* COLUMN 2: COOKING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-[#FF8A00] p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">
                Cooking ({cookingOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {cookingOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No active prep</p>
            ) : (
              cookingOrders.map(ord => {
                const elapsedMins = getElapsedTimeInMinutes(ord.createdAt);
                return (
                  <div
                    key={ord.id}
                    className="flex flex-col justify-between rounded-2xl border border-orange-200 bg-white p-4 shadow-sm dark:border-orange-900/50 dark:bg-gray-900"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <div>
                          <span className="font-black text-gray-900 text-sm dark:text-white">
                            {ord.orderNumber}
                          </span>
                          <span className="block text-[10px] font-semibold text-gray-500">
                            {ord.tableName ? `Table ${ord.tableName}` : ord.type}
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

                      <div className="my-3 space-y-1.5">
                        {ord.items.map(item => (
                          <div key={item.id} className="text-xs font-bold text-gray-800 dark:text-gray-100">
                            <span className="text-[#FF8A00] font-black mr-1">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, 'Cooking')}
                        className="flex-1 flex items-center justify-center space-x-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                      >
                        <Check className="h-4 w-4" />
                        <span>Mark Ready</span>
                      </button>
                      <button
                        onClick={() => receiptService.printReceipt(ord, settings)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        title="Print Kitchen Ticket"
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
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {readyOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No dishes ready</p>
            ) : (
              readyOrders.map(ord => (
                <div
                  key={ord.id}
                  className="flex flex-col justify-between rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900/50 dark:bg-gray-900"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                      <span className="font-black text-gray-900 text-sm dark:text-white">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-indigo-600">
                        {ord.tableName ? `Table ${ord.tableName}` : ord.type}
                      </span>
                    </div>

                    <div className="my-3 space-y-1">
                      {ord.items.map(item => (
                        <div key={item.id} className="text-xs font-bold text-gray-800 dark:text-gray-100">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdvanceStatus(ord.id, 'Ready')}
                    className="mt-2 w-full flex items-center justify-center space-x-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mark Served</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: SERVED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-emerald-600 p-3 text-white shadow-md">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="h-4 w-4" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">Served</h3>
            </div>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {servedOrders.map(ord => (
              <div
                key={ord.id}
                className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3 text-xs dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div className="flex justify-between font-bold text-gray-700 dark:text-gray-300">
                  <span>{ord.orderNumber}</span>
                  <span>{ord.tableName ? `Table ${ord.tableName}` : ord.type}</span>
                </div>
                <p className="mt-1 text-[10px] text-gray-400">
                  Served at {new Date(ord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
