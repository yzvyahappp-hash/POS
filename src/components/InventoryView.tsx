import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Truck,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
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
                  <th className="py-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium dark:divide-gray-800">
                {filteredInventory.map(item => {
                  const isLow = item.stockQuantity <= item.minStockAlert;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 font-extrabold text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 text-gray-500">{item.category}</td>
                      <td className="py-3 font-bold text-gray-900 dark:text-white">
                        {item.stockQuantity} {item.unit}
                      </td>
                      <td className="py-3">${item.costPerUnit.toFixed(2)}</td>
                      <td className="py-3">{item.supplierName}</td>
                      <td className="py-3 text-gray-400">{item.lastRestocked}</td>
                      <td className="py-3">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
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
                      <td className="py-3 text-right space-x-1">
                        <button
                          onClick={() => onUpdateStock(item.id, item.stockQuantity + 5)}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                        >
                          +5 Restock
                        </button>
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
