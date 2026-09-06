import React, { useState } from 'react';
import {
  Grid,
  Plus,
  Trash2,
  Edit3,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRightLeft,
  Minimize2,
  Maximize2,
  Info,
  QrCode,
  Printer,
  ExternalLink,
  Copy,
  Check,
  X,
  Share2,
  User,
  Phone,
  Link2,
  Unlink,
  Receipt,
  Utensils,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Table, TableStatus, TableShape, FloorZone, Order, Customer, Reservation } from '../types';
import { copyToClipboard } from '../utils/clipboard';
import { useTranslation } from '../i18n/useTranslation';
import { translateTableStatus } from '../utils/i18nHelpers';

interface FloorPlanViewProps {
  tables: Table[];
  orders: Order[];
  customers?: Customer[];
  reservations?: Reservation[];
  onUpdateTable: (table: Table) => void;
  onAddTable: (newTable: Table) => void;
  onDeleteTable: (tableId: string) => void;
  onOpenTableOrder: (table: Table) => void;
  onTransferTableOrder: (fromTableId: string, toTableId: string) => void;
  onMergeTables: (tableId1: string, tableId2: string) => void;
  onUnmergeTable?: (tableId: string) => void;
  onUpdateCustomer?: (customer: Customer) => void;
}

export const FloorPlanView: React.FC<FloorPlanViewProps> = ({
  tables,
  orders,
  customers = [],
  reservations = [],
  onUpdateTable,
  onAddTable,
  onDeleteTable,
  onOpenTableOrder,
  onTransferTableOrder,
  onMergeTables,
  onUnmergeTable,
  onUpdateCustomer,
}) => {
  const { lang, t } = useTranslation();
  const [selectedZone, setSelectedZone] = useState<FloorZone | 'All'>('All');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [targetTableId, setTargetTableId] = useState<string>('');
  
  // QR Code Modals
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [showAllQrModal, setShowAllQrModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Helper to resolve customer info for a table (checking direct table, merged partner tables, active orders, and reservations)
  const getTableCustomerInfo = (tbl: Table) => {
    const isMerged = !!(tbl.mergedWith && tbl.mergedWith.length > 0);
    const partnerTables = tbl.mergedWith
      ? tables.filter(t => tbl.mergedWith?.includes(t.id))
      : [];
    const mergedTableNames = partnerTables.map(t => t.name);
    const allClusterTables = [tbl, ...partnerTables];
    const combinedSeats = allClusterTables.reduce((sum, t) => sum + (t.seats || 0), 0);

    // 1. Check direct table customer
    let name = tbl.customerName && tbl.customerName !== 'Walk-in Guest' ? tbl.customerName : undefined;

    // 2. Check partner merged tables
    if (!name && partnerTables.length > 0) {
      for (const pt of partnerTables) {
        if (pt.customerName && pt.customerName !== 'Walk-in Guest') {
          name = pt.customerName;
          break;
        }
      }
    }

    // 3. Check active orders across this table or merged tables
    const clusterIds = allClusterTables.map(t => t.id);
    const clusterNames = allClusterTables.map(t => t.name.trim().toLowerCase());
    
    const activeOrder = orders.find(
      o =>
        o.status !== 'Completed' &&
        o.status !== 'Cancelled' &&
        ((o.tableId && clusterIds.includes(o.tableId)) ||
          (o.tableName && clusterNames.includes(o.tableName.trim().toLowerCase())) ||
          (o.tableName && clusterNames.some(cn => o.tableName.toLowerCase().includes(cn))))
    );

    let phone = activeOrder?.customerPhone || '';
    if (!name && activeOrder?.customerName && activeOrder.customerName !== 'Walk-in Guest') {
      name = activeOrder.customerName;
    }

    // 4. Check today's active reservations
    const activeRes = reservations.find(
      r =>
        r.status === 'Seated' &&
        ((r.tableId && clusterIds.includes(r.tableId)) ||
          (r.tableName && clusterNames.includes(r.tableName.trim().toLowerCase())) ||
          (r.tableName && clusterNames.some(cn => r.tableName.toLowerCase().includes(cn))))
    );

    if (!name && activeRes?.customerName) {
      name = activeRes.customerName;
      phone = activeRes.phone || phone;
    }

    // 5. Match customer profile from customers database
    let customerObj: Customer | undefined;
    if (name) {
      customerObj = customers.find(
        c =>
          c.name.trim().toLowerCase() === name?.trim().toLowerCase() ||
          (phone && c.phone === phone)
      );
      if (customerObj && customerObj.phone) {
        phone = customerObj.phone;
      }
    }

    return {
      customerName: name,
      customerPhone: phone,
      customer: customerObj,
      activeOrder,
      activeRes,
      isMerged,
      partnerTables,
      mergedTableNames,
      allClusterTables,
      combinedSeats,
    };
  };

  // New Table Form state
  const [newNumber, setNewNumber] = useState<number>(tables.length + 1);
  const [newName, setNewName] = useState<string>(`T${tables.length + 1}`);
  const [newSeats, setNewSeats] = useState<number>(4);
  const [newZone, setNewZone] = useState<FloorZone>('Main Hall');
  const [newShape, setNewShape] = useState<TableShape>('square');

  const filteredTables = selectedZone === 'All' ? tables : tables.filter(t => t.zone === selectedZone);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const table: Table = {
      id: 'tbl-' + Date.now(),
      number: newNumber,
      name: newName || `T${newNumber}`,
      seats: newSeats,
      status: 'Available',
      zone: newZone,
      x: 20 + (tables.length % 4) * 20,
      y: 20 + Math.floor(tables.length / 4) * 20,
      shape: newShape,
    };
    onAddTable(table);
    setShowAddModal(false);
  };

  const handleStatusChange = (status: TableStatus) => {
    if (selectedTable) {
      const updated = { ...selectedTable, status };
      onUpdateTable(updated);
      setSelectedTable(updated);
    }
  };

  const handleTransfer = () => {
    if (selectedTable && targetTableId) {
      onTransferTableOrder(selectedTable.id, targetTableId);
      setShowTransferModal(false);
      setSelectedTable(null);
    }
  };

  const handleMerge = () => {
    if (selectedTable && targetTableId) {
      onMergeTables(selectedTable.id, targetTableId);
      setShowMergeModal(false);
      setSelectedTable(null);
    }
  };

  const handlePrintSingleQr = (tbl: Table) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const oldTitle = document.title;
    const cleanName = (tbl.name || `table-${tbl.number}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    document.title = `table-${cleanName}-qr-stand-${dateStr}`;

    window.print();

    setTimeout(() => {
      document.title = oldTitle;
    }, 1500);
  };

  const handlePrintAllQr = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const oldTitle = document.title;
    document.title = `all-tables-qr-stands-${dateStr}`;

    window.print();

    setTimeout(() => {
      document.title = oldTitle;
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Main Floor Plan Content - Hidden when printing QR modals */}
      <div className="space-y-6 no-print">
        {/* Top Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <Grid className="mr-2 h-6 w-6 text-[#FF8A00]" /> Floor Plan & Table Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time interactive dining room layout and seating status
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAllQrModal(true)}
            className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition-all"
          >
            <Printer className="h-4 w-4 text-[#FF8A00]" />
            <span className="hidden sm:inline">All Table QR Stands</span>
            <span className="sm:hidden">QR Stands</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      {/* Zone Filters & Legend */}
      <div className="flex flex-col justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800 lg:flex-row lg:items-center">
        {/* Zone Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Main Hall', 'Patio', 'VIP Room', 'Bar Area'] as const).map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedZone === zone
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <span className="flex items-center">
            <span className="mr-1.5 h-3 w-3 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center">
            <span className="mr-1.5 h-3 w-3 rounded-full bg-rose-500" /> Occupied
          </span>
          <span className="flex items-center">
            <span className="mr-1.5 h-3 w-3 rounded-full bg-amber-500" /> Reserved
          </span>
          <span className="flex items-center">
            <span className="mr-1.5 h-3 w-3 rounded-full bg-indigo-500" /> Cleaning
          </span>
        </div>
      </div>

      {/* Interactive Floor Layout Canvas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Floor Canvas Pane */}
        <div className="relative min-h-[480px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 p-6 dark:border-gray-800 dark:bg-gray-900/60 lg:col-span-2 overflow-hidden shadow-inner">
          <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 pointer-events-none">
            {selectedZone === 'All' ? 'Full Dining Floor' : `${selectedZone} Area`}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-6">
            {filteredTables.map(tbl => {
              const info = getTableCustomerInfo(tbl);
              const activeOrder = info.activeOrder;
              const isSelected = selectedTable?.id === tbl.id;

              const statusStyles = {
                Available: 'border-[#E5E7EB] bg-white text-gray-800 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200',
                Occupied: 'border-[#FF8A00] bg-[#FF8A00]/10 text-gray-900 dark:bg-[#FF8A00]/20 dark:border-[#FF8A00] dark:text-white',
                Reserved: 'border-blue-500 bg-blue-50/50 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
                Cleaning: 'border-indigo-400 bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-200',
              };

              const shapeStyles = {
                circle: 'rounded-full aspect-square',
                square: 'rounded-xl aspect-square',
                rectangle: 'rounded-xl col-span-2 aspect-[2/1]',
              };

              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl)}
                  className={`group relative flex flex-col items-center justify-center p-3.5 border-2 cursor-pointer shadow-2xs transition-all transform hover:scale-[1.02] ${
                    statusStyles[tbl.status]
                  } ${shapeStyles[tbl.shape]} ${isSelected ? 'ring-2 ring-[#FF8A00] scale-[1.02] shadow-md' : ''}`}
                >
                  {/* Quick Table QR Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrModalTable(tbl);
                    }}
                    title="Generate & View Table Ordering QR Code"
                    className="absolute top-1.5 left-1.5 rounded-lg bg-white/90 p-1 text-gray-600 shadow-2xs hover:bg-white hover:text-[#FF8A00] dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#FF8A00] transition-all"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                  </button>

                  {/* Merged Table Tag Badge */}
                  {info.isMerged && (
                    <span className="absolute top-1.5 right-1.5 flex items-center space-x-0.5 rounded-md bg-purple-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                      <Link2 className="h-2.5 w-2.5" />
                      <span>併 {info.mergedTableNames.join('+')}</span>
                    </span>
                  )}

                  {/* Table Name & Seats */}
                  <div className="flex items-center space-x-1">
                    <span className="text-base font-black text-gray-900 dark:text-white">{tbl.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">({tbl.seats}座)</span>
                  </div>
                  
                  {/* Order Total or Status Label */}
                  {tbl.status === 'Occupied' && activeOrder ? (
                    <span className="text-[11px] uppercase font-black text-[#FF8A00] mt-0.5">
                      ${(activeOrder.totalAmount || 0).toFixed(2)}
                    </span>
                  ) : (
                    <span className={`text-[10px] uppercase font-bold mt-0.5 ${
                      tbl.status === 'Available' ? 'text-gray-400' : tbl.status === 'Reserved' ? 'text-blue-600' : 'text-indigo-600'
                    }`}>
                      {tbl.status}
                    </span>
                  )}

                  {/* Customer Card Tag on Table (Visible for Occupied, Reserved, or Merged tables) */}
                  {info.customerName && (
                    <div className="mt-1 flex items-center space-x-1 max-w-[95%] px-1.5 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800 text-amber-950 dark:text-amber-200 shadow-2xs animate-in fade-in">
                      <User className="h-2.5 w-2.5 text-[#FF8A00] shrink-0" />
                      <span className="truncate text-[9px] font-black">{info.customerName}</span>
                      {info.customer?.tier && (
                        <span className={`text-[8px] font-black px-1 rounded shrink-0 ${
                          info.customer.tier === 'VIP' ? 'bg-purple-600 text-white' :
                          info.customer.tier === 'Gold' ? 'bg-amber-500 text-white' :
                          info.customer.tier === 'Silver' ? 'bg-slate-500 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {info.customer.tier}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Table Inspector Drawer */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-800 dark:bg-gray-900">
          {selectedTable ? (() => {
            const selectedInfo = getTableCustomerInfo(selectedTable);
            const activeOrder = selectedInfo.activeOrder;
            const customerObj = selectedInfo.customer;

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>Table {selectedTable.name}</span>
                      {selectedInfo.isMerged && (
                        <span className="inline-flex items-center space-x-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-black text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Link2 className="h-3 w-3" />
                          <span>已併桌 (+{selectedInfo.mergedTableNames.join(', ')})</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Zone: {selectedTable.zone} • {selectedTable.seats} Seats {selectedInfo.isMerged ? `(群組共 ${selectedInfo.combinedSeats} 座)` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selectedTable.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedTable.status === 'Occupied'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedTable.status === 'Reserved'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {selectedTable.status}
                  </span>
                </div>

                {/* Merged Tables Cluster Banner */}
                {selectedInfo.isMerged && (
                  <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 dark:border-purple-900/40 dark:bg-purple-950/20 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
                          <Link2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-purple-950 dark:text-purple-200">
                            併桌群組 (Merged Tables)
                          </div>
                          <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                            {selectedInfo.allClusterTables.map(t => `${t.name} (${t.seats}人)`).join(' + ')} • 共 {selectedInfo.combinedSeats} 席
                          </div>
                        </div>
                      </div>
                      {onUnmergeTable && (
                        <button
                          type="button"
                          onClick={() => {
                            onUnmergeTable(selectedTable.id);
                            setSelectedTable({ ...selectedTable, mergedWith: undefined });
                          }}
                          className="flex items-center space-x-1 rounded-lg border border-purple-300 bg-white px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-300 dark:border-purple-700 cursor-pointer shadow-2xs"
                          title="解除此桌的併桌關聯"
                        >
                          <Unlink className="h-3 w-3" />
                          <span>解除併桌</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Info Card */}
                {selectedInfo.customerName ? (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 shadow-2xs animate-in fade-in transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF8A00] text-white font-black text-base shadow-xs">
                          {selectedInfo.customerName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-black text-sm text-gray-900 dark:text-white">
                              {selectedInfo.customerName}
                            </h4>
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                              customerObj?.tier === 'VIP' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                              customerObj?.tier === 'Gold' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              customerObj?.tier === 'Silver' ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
                              'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                            }`}>
                              <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                              {customerObj?.tier || 'Bronze'}
                            </span>
                            {selectedInfo.isMerged && (
                              <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-1 py-0.2 rounded">
                                併桌顧客
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-600 dark:text-gray-300 font-semibold">
                            <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-bold">
                              <Phone className="mr-1 h-3 w-3" />
                              {selectedInfo.customerPhone || customerObj?.phone || (lang === 'zh-TW' ? '尚未建檔電話' : 'No Phone')}
                            </span>
                            {customerObj && (
                              <>
                                <span>•</span>
                                <span>{customerObj.loyaltyPoints || 0} pts</span>
                                <span>•</span>
                                <span>{customerObj.visitCount || 1} 次到店</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {customerObj && onUpdateCustomer && (
                        <button
                          type="button"
                          onClick={() => {
                            const newPhone = prompt(
                              lang === 'zh-TW' ? `請輸入 ${customerObj.name} 的手機號碼:` : `Enter phone number for ${customerObj.name}:`,
                              customerObj.phone || '0912-345-678'
                            );
                            if (newPhone !== null) {
                              const updated = { ...customerObj, phone: newPhone.trim() };
                              onUpdateCustomer(updated);
                            }
                          }}
                          className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-[10px] font-bold text-amber-900 shadow-2xs hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-200 dark:border-amber-700 cursor-pointer shrink-0"
                          title="修改顧客電話"
                        >
                          {customerObj.phone ? (lang === 'zh-TW' ? '修改電話' : 'Edit') : (lang === 'zh-TW' ? '+ 補電話' : '+ Add')}
                        </button>
                      )}
                    </div>

                    {customerObj?.notes && (
                      <div className="mt-2 text-[11px] font-medium text-amber-900/90 dark:text-amber-200/90 bg-amber-100/60 dark:bg-amber-900/30 p-2 rounded-lg border border-amber-200/50">
                        📌 {customerObj.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-3 text-center dark:border-gray-800 dark:bg-gray-900/30">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {lang === 'zh-TW' ? '此桌目前登記為散客 (未綁定會員卡)' : 'Walk-in guest (No member linked)'}
                    </p>
                    {customers.length > 0 && (
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <select
                          onChange={e => {
                            if (!e.target.value) return;
                            const cust = customers.find(c => c.id === e.target.value);
                            if (cust) {
                              const updated = { ...selectedTable, customerName: cust.name };
                              onUpdateTable(updated);
                              setSelectedTable(updated);
                            }
                          }}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 shadow-2xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {lang === 'zh-TW' ? '+ 綁定顧客會員卡' : '+ Link Member Card'}
                          </option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.phone ? `(${c.phone})` : ''} [{c.tier || 'Bronze'}]
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Order Card */}
                {activeOrder && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3 dark:border-orange-900/40 dark:bg-orange-950/20 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-[#FF8A00]" />
                        <span className="text-xs font-black text-gray-900 dark:text-white">
                          訂單 #{activeOrder.orderNumber || activeOrder.id.slice(-6)}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {activeOrder.items?.length || 0} 品項
                        </span>
                      </div>
                      <span className="text-sm font-black text-[#FF8A00]">
                        ${(activeOrder.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status Updater */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    Change Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Available', 'Occupied', 'Reserved', 'Cleaning'] as TableStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`rounded-xl border py-1.5 text-xs font-bold transition-all ${
                          selectedTable.status === st
                            ? 'border-[#FF8A00] bg-orange-50 text-[#FF8A00] dark:bg-orange-950/40'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onOpenTableOrder(selectedTable)}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#FF8A00] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedTable.status === 'Occupied' || activeOrder ? 'View / Edit Order in POS' : 'Create Table Order'}
                    </span>
                  </button>

                  <button
                    onClick={() => setQrModalTable(selectedTable)}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 transition-all cursor-pointer"
                  >
                    <QrCode className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Table Ordering QR Stand</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="flex items-center justify-center space-x-1 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-[#FF8A00]" />
                      <span>Transfer Table</span>
                    </button>

                    <button
                      onClick={() => setShowMergeModal(true)}
                      className="flex items-center justify-center space-x-1 rounded-xl border border-gray-200 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                      <Minimize2 className="h-3.5 w-3.5 text-purple-600" />
                      <span>Merge Tables</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete Table ${selectedTable.name}?`)) {
                        onDeleteTable(selectedTable.id);
                        setSelectedTable(null);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-1 rounded-xl border border-rose-200 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Table</span>
                  </button>
                </div>
              </div>
            );
          })() : (
            <div className="py-12 text-center text-gray-400">
              <Info className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-xs font-semibold">Select any table on the floor layout to inspect details, customer cards, or manage orders</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD TABLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Table to Floor</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Table Number</label>
                <input
                  type="number"
                  value={newNumber}
                  onChange={e => setNewNumber(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Table Name / Identifier</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newSeats}
                  onChange={e => setNewSeats(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Dining Zone</label>
                <select
                  value={newZone}
                  onChange={e => setNewZone(e.target.value as FloorZone)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Patio">Patio</option>
                  <option value="VIP Room">VIP Room</option>
                  <option value="Bar Area">Bar Area</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Table Shape</label>
                <select
                  value={newShape}
                  onChange={e => setNewShape(e.target.value as TableShape)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="rectangle">Rectangle (Large)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Transfer Table {selectedTable.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Move order to another available table</p>

            <label className="block text-xs font-bold text-gray-600 mb-1">Select Target Table</label>
            <select
              value={targetTableId}
              onChange={e => setTargetTableId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:bg-gray-800 dark:text-white mb-4"
            >
              <option value="">Select a table...</option>
              {tables
                .filter(t => t.id !== selectedTable.id && t.status === 'Available')
                .map(t => (
                  <option key={t.id} value={t.id}>
                    Table {t.name} ({t.zone} - {t.seats} seats)
                  </option>
                ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTransferModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={!targetTableId}
                className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                Transfer Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MERGE MODAL */}
      {showMergeModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Merge Table {selectedTable.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Combine seating and bill with another table</p>

            <label className="block text-xs font-bold text-gray-600 mb-1">Select Table to Merge With</label>
            <select
              value={targetTableId}
              onChange={e => setTargetTableId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs dark:bg-gray-800 dark:text-white mb-4"
            >
              <option value="">Select table...</option>
              {tables
                .filter(t => t.id !== selectedTable.id)
                .map(t => (
                  <option key={t.id} value={t.id}>
                    Table {t.name} ({t.status})
                  </option>
                ))}
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowMergeModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                disabled={!targetTableId}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-50"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* SINGLE TABLE QR CODE MODAL */}
      {qrModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in print-qr-modal-overlay">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 print-qr-card-wrapper">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800 no-print">
              <div className="flex items-center space-x-2">
                <div className="rounded-xl bg-orange-100 p-2 text-[#FF8A00] dark:bg-orange-950/60 dark:text-amber-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">
                    Table {qrModalTable.name} QR Code Stand
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Self-Service ordering & digital menu QR stand
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQrModalTable(null)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Acrylic Tent Card Graphic Container (PRINT TARGET) */}
            <div className="my-5 flex flex-col items-center print-break-inside-avoid print-qr-tent-card">
              <div className="w-full max-w-xs rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-500 to-orange-600 p-1 shadow-xl text-center text-white">
                <div className="rounded-xl bg-white p-5 text-gray-900 dark:bg-gray-950 dark:text-white flex flex-col items-center shadow-inner print-qr-card-inner">
                  {/* Top Header */}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8A00]">
                    Grand Bistro & Grill
                  </span>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mt-0.5 mb-1">
                    SCAN TO ORDER
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                    View Digital Menu & Send Orders to Kitchen
                  </p>

                  {/* QR Code SVG */}
                  <div className="rounded-xl bg-white p-3 shadow-md border border-gray-100">
                    <QRCodeSVG
                      value={`${window.location.origin}/?table=${qrModalTable.number}&tablename=${encodeURIComponent(qrModalTable.name)}`}
                      size={170}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  {/* Table Label Footer */}
                  <div className="mt-4 rounded-xl bg-amber-50 px-4 py-2 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60">
                    <span className="text-sm font-black text-amber-900 dark:text-amber-300">
                      TABLE {qrModalTable.name}
                    </span>
                    <span className="block text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                      {qrModalTable.zone} • {qrModalTable.seats} Seats
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* URL Input & Copy / Direct Link (NO PRINT) */}
            <div className="space-y-3 no-print">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Direct Table Ordering URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?table=${qrModalTable.number}&tablename=${encodeURIComponent(qrModalTable.name)}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-mono text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(`${window.location.origin}/?table=${qrModalTable.number}&tablename=${encodeURIComponent(qrModalTable.name)}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex items-center space-x-1 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 shrink-0"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <a
                  href={`/?table=${qrModalTable.number}&tablename=${encodeURIComponent(qrModalTable.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Test Customer Order Link</span>
                </a>
                <button
                  type="button"
                  onClick={() => handlePrintSingleQr(qrModalTable)}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Table Stand</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALL TABLES QR CODE STANDS MODAL */}
      {showAllQrModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white p-6 dark:bg-gray-900 overflow-y-auto animate-in fade-in print-qr-all-modal">
          {/* Top Control Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800 no-print">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                <QrCode className="mr-2 h-6 w-6 text-[#FF8A00]" /> Printable Table Ordering QR Code Stands
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Print or download standing QR acrylic tent cards for all {tables.length} restaurant tables
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrintAllQr}
                className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
              >
                <Printer className="h-4 w-4" />
                <span>Print All Stands</span>
              </button>
              <button
                onClick={() => setShowAllQrModal(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Grid of QR Stands */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6 print-qr-stands-grid">
            {tables.map(tbl => (
              <div
                key={tbl.id}
                className="flex flex-col items-center rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-500 to-orange-600 p-1 shadow-lg text-center print-break-inside-avoid"
              >
                <div className="w-full rounded-xl bg-white p-4 text-gray-900 dark:bg-gray-950 dark:text-white flex flex-col items-center shadow-xs">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#FF8A00]">
                    Grand Bistro & Grill
                  </span>
                  <h4 className="text-base font-black text-gray-900 dark:text-white mt-0.5 mb-1">
                    SCAN TO ORDER
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                    Self-Service Customer Ordering
                  </p>

                  <div className="rounded-lg bg-white p-2 border border-gray-100 shadow-2xs">
                    <QRCodeSVG
                      value={`${window.location.origin}/?table=${tbl.number}&tablename=${encodeURIComponent(tbl.name)}`}
                      size={130}
                      level="M"
                      includeMargin={true}
                    />
                  </div>

                  <div className="mt-3 w-full rounded-lg bg-amber-50 py-1.5 dark:bg-amber-950/60 border border-amber-200/50">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                      TABLE {tbl.name}
                    </span>
                    <span className="block text-[9px] font-semibold text-amber-700 dark:text-amber-400">
                      {tbl.zone} • {tbl.seats} Seats
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
