import React, { useState } from 'react';
import { Search, X, ShoppingBag, Utensils, Grid, Calendar, Users, ArrowRight } from 'lucide-react';
import { Order, MenuItem, Table, Reservation, Customer } from '../types';
import { ActiveTab } from './Sidebar';
import { useTranslation } from '../i18n/useTranslation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  menuItems: MenuItem[];
  tables: Table[];
  reservations: Reservation[];
  customers: Customer[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenTableOrder?: (table: Table) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  orders,
  menuItems,
  tables,
  reservations,
  customers,
  onNavigateTab,
  onOpenTableOrder,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.tableName && o.tableName.toLowerCase().includes(q))
      )
    : [];

  const matchedMenuItems = q
    ? menuItems.filter(
        m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      )
    : [];

  const matchedTables = q
    ? tables.filter(
        tb =>
          tb.name.toLowerCase().includes(q) ||
          String(tb.number).includes(q) ||
          tb.zone.toLowerCase().includes(q)
      )
    : [];

  const matchedReservations = q
    ? reservations.filter(
        r => r.customerName.toLowerCase().includes(q) || r.phone.includes(q)
      )
    : [];

  const matchedCustomers = q
    ? customers.filter(
        c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedOrders.length +
    matchedMenuItems.length +
    matchedTables.length +
    matchedReservations.length +
    matchedCustomers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95">
        {/* Search Bar Input */}
        <div className="flex items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <Search className="mr-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!q && (
            <div className="py-8 text-center text-xs text-gray-400">
              Type to search orders, menu dishes, tables, reservations, and customers...
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
              No matching records found for "{query}".
            </div>
          )}

          {/* Orders */}
          {matchedOrders.length > 0 && (
            <div>
              <div className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <ShoppingBag className="mr-1.5 h-3.5 w-3.5 text-[#FF8A00]" /> Orders ({matchedOrders.length})
              </div>
              <div className="space-y-1.5">
                {matchedOrders.map(o => (
                  <div
                    key={o.id}
                    onClick={() => {
                      onNavigateTab('orders');
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        Order #{o.orderNumber}
                      </span>
                      <span className="ml-2 text-[11px] text-gray-500">
                        {o.tableName || o.type} • ${o.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF8A00] dark:bg-orange-950">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items */}
          {matchedMenuItems.length > 0 && (
            <div>
              <div className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <Utensils className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Menu Catalog ({matchedMenuItems.length})
              </div>
              <div className="space-y-1.5">
                {matchedMenuItems.map(m => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onNavigateTab('menu');
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={m.image} alt={m.name} className="h-8 w-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-xs text-gray-900 dark:text-white">{m.name}</span>
                        <span className="ml-2 text-[11px] text-gray-400">{m.category}</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      ${m.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tables */}
          {matchedTables.length > 0 && (
            <div>
              <div className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <Grid className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> Tables ({matchedTables.length})
              </div>
              <div className="space-y-1.5">
                {matchedTables.map(tb => (
                  <div
                    key={tb.id}
                    onClick={() => {
                      onNavigateTab('floorplan');
                      if (onOpenTableOrder) onOpenTableOrder(tb);
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        Table {tb.name} ({tb.zone})
                      </span>
                      <span className="ml-2 text-[11px] text-gray-500">{tb.seats} Seats</span>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {tb.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reservations */}
          {matchedReservations.length > 0 && (
            <div>
              <div className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <Calendar className="mr-1.5 h-3.5 w-3.5 text-purple-500" /> Bookings ({matchedReservations.length})
              </div>
              <div className="space-y-1.5">
                {matchedReservations.map(r => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onNavigateTab('reservations');
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        {r.customerName} ({r.partySize} guests)
                      </span>
                      <span className="ml-2 text-[11px] text-gray-500">
                        {r.date} @ {r.time}
                      </span>
                    </div>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <Users className="mr-1.5 h-3.5 w-3.5 text-indigo-500" /> Customers ({matchedCustomers.length})
              </div>
              <div className="space-y-1.5">
                {matchedCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onNavigateTab('customers');
                      onClose();
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-2.5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 dark:text-white">{c.name}</span>
                      <span className="ml-2 text-[11px] text-gray-500">{c.phone} • {c.email}</span>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {c.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
