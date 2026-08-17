import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Truck,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Sliders,
  X,
} from 'lucide-react';
import { InventoryItem, Supplier } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  suppliers,
  onAddInventoryItem,
  onUpdateStock,
}) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'suppliers'>('ingredients');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal State for Custom Adjustments
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<'deduct' | 'restock' | 'set'>('deduct');
  const [adjustAmount, setAdjustAmount] = useState<number>(1);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Meat & Seafood');
  const [unit, setUnit] = useState<InventoryItem['unit']>('kg');
  const [stockQuantity, setStockQuantity] = useState(10);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [costPerUnit, setCostPerUnit] = useState(12.0);
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || '');

  const filteredInventory = inventory.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      id: 'inv-' + Date.now(),
      name,
      category,
      unit,
      stockQuantity: Number(stockQuantity),
      minStockAlert: Number(minStockAlert),
      costPerUnit: Number(costPerUnit),
      supplierName: supplierName || 'General Supplier',
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    onAddInventoryItem(item);
    setShowAddModal(false);
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;

    let finalStock = adjustItem.stockQuantity;
    const qty = Number(adjustAmount) || 0;

    if (adjustMode === 'deduct') {
      finalStock = adjustItem.stockQuantity - qty;
    } else if (adjustMode === 'restock') {
      finalStock = adjustItem.stockQuantity + qty;
    } else {
      finalStock = qty;
    }

    onUpdateStock(adjustItem.id, Number(finalStock.toFixed(2)));
    setAdjustItem(null);
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <Package className="mr-2 h-6 w-6 text-[#FF8A00]" /> Raw Ingredient Inventory & Suppliers
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Real-time stock quantities, low inventory warning alerts, and purchase orders
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'ingredients'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-900 dark:text-white'
                  : 'text-gray-500'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'suppliers'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-900 dark:text-white'
                  : 'text-gray-500'
              }`}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {activeTab === 'ingredients' ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:border-gray-800">
                  <th className="py-3">Ingredient Name</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Current Stock</th>
                  <th className="py-3">Cost / Unit</th>
                  <th className="py-3">Supplier</th>
                  <th className="py-3">Last Restocked</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Stock Actions & Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                {filteredInventory.map(item => {
                  const isDeficit = item.stockQuantity < 0;
                  const isLow = !isDeficit && item.stockQuantity <= item.minStockAlert;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 font-extrabold text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 text-gray-500">{item.category}</td>
                      <td className="py-3 font-bold">
                        <span className={isDeficit ? 'text-rose-600 font-black dark:text-rose-400' : 'text-gray-900 dark:text-white'}>
                          {item.stockQuantity} {item.unit}
                        </span>
                        {isDeficit && (
                          <span className="ml-1.5 rounded-sm bg-rose-100 px-1 py-0.5 text-[9px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            DEFICIT
                          </span>
                        )}
                      </td>
                      <td className="py-3">${item.costPerUnit.toFixed(2)}</td>
                      <td className="py-3">{item.supplierName}</td>
                      <td className="py-3 text-gray-400">{item.lastRestocked}</td>
                      <td className="py-3">
                        {isDeficit ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Deficit</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle className="h-3 w-3" />
                            <span>Sufficient</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {/* Quick Deduction / Usage Buttons */}
                          <button
                            type="button"
                            onClick={() => onUpdateStock(item.id, Number((item.stockQuantity - 1).toFixed(2)))}
                            className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 shadow-xs hover:bg-amber-100 active:scale-95 transition-all dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
                            title="Deduct 1 unit (used)"
                          >
                            -1 Use
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(item.id, Number((item.stockQuantity - 5).toFixed(2)))}
                            className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-800 shadow-xs hover:bg-rose-100 active:scale-95 transition-all dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                            title="Deduct 5 units (used)"
                          >
                            -5 Use
                          </button>

                          {/* Quick Restock Buttons */}
                          <button
                            type="button"
                            onClick={() => onUpdateStock(item.id, Number((item.stockQuantity + 5).toFixed(2)))}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                            title="Add 5 units to stock"
                          >
                            +5 Restock
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStock(item.id, Number((item.stockQuantity + 10).toFixed(2)))}
                            className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
                            title="Add 10 units to stock"
                          >
                            +10 Restock
                          </button>

                          {/* Detailed Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustItem(item);
                              setAdjustMode('deduct');
                              setAdjustAmount(1);
                            }}
                            className="flex items-center space-x-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-[10px] font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            title="Custom usage or restock adjustment"
                          >
                            <Sliders className="h-3 w-3" />
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SUPPLIERS LIST */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map(sup => (
            <div
              key={sup.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <h3 className="font-extrabold text-gray-900 text-sm dark:text-white flex items-center">
                  <Truck className="mr-2 h-4 w-4 text-[#FF8A00]" /> {sup.name}
                </h3>
              </div>
              <div className="mt-3 text-xs space-y-1 text-gray-600 dark:text-gray-300">
                <p><strong>Contact:</strong> {sup.contactPerson}</p>
                <p><strong>Phone:</strong> {sup.phone}</p>
                <p><strong>Email:</strong> {sup.email}</p>
                <p className="mt-2 text-[10px] text-gray-400">
                  Supplies: {sup.itemsSupplied.join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CUSTOM STOCK ADJUSTMENT & USAGE MODAL */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Stock Adjustment
                </h3>
                <p className="text-xs font-semibold text-[#FF8A00]">{adjustItem.name}</p>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="mt-4 space-y-4">
              {/* Current Stock Banner */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Current Stock</span>
                <span className={`text-sm font-black ${adjustItem.stockQuantity < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                  {adjustItem.stockQuantity} {adjustItem.unit}
                </span>
              </div>

              {/* Adjustment Mode selector */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setAdjustMode('deduct')}
                    className={`flex items-center justify-center space-x-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      adjustMode === 'deduct'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
                    }`}
                  >
                    <TrendingDown className="h-3.5 w-3.5" />
                    <span>Use / Deduct</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustMode('restock')}
                    className={`flex items-center justify-center space-x-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      adjustMode === 'restock'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Restock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustMode('set')}
                    className={`flex items-center justify-center space-x-1 rounded-lg py-2 text-xs font-bold transition-all ${
                      adjustMode === 'set'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Set Exact</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  {adjustMode === 'deduct' && `Quantity Used (${adjustItem.unit})`}
                  {adjustMode === 'restock' && `Quantity Added (${adjustItem.unit})`}
                  {adjustMode === 'set' && `New Stock Quantity (${adjustItem.unit}) — can be negative`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Live Preview Result */}
              {(() => {
                const qty = Number(adjustAmount) || 0;
                let calculated = adjustItem.stockQuantity;
                if (adjustMode === 'deduct') calculated -= qty;
                else if (adjustMode === 'restock') calculated += qty;
                else calculated = qty;
                calculated = Number(calculated.toFixed(2));

                const isNeg = calculated < 0;

                return (
                  <div className={`flex items-center justify-between rounded-xl p-3 text-xs font-bold border ${
                    isNeg
                      ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300'
                  }`}>
                    <span>Resulting Stock:</span>
                    <span className="text-sm font-black">
                      {calculated} {adjustItem.unit} {isNeg && '(Deficit)'}
                    </span>
                  </div>
                );
              })()}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all ${
                    adjustMode === 'deduct'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : adjustMode === 'restock'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Apply {adjustMode === 'deduct' ? 'Usage' : adjustMode === 'restock' ? 'Restock' : 'Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD INVENTORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Inventory Ingredient</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wagyu Beef Patties"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as InventoryItem['unit'])}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="liters">liters</option>
                    <option value="boxes">boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={e => setMinStockAlert(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
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
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
