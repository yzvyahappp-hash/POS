import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Sparkles,
  Layers,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { MenuItem, MenuItemAddOn } from '../types';

interface MenuViewProps {
  menuItems: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuItem['category']>('Mains');
  const [price, setPrice] = useState<number>(15.0);
  const [cost, setCost] = useState<number>(4.5);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [isCombo, setIsCombo] = useState(false);
  const [modifiersText, setModifiersText] = useState('');

  const categories = ['All', 'Starters', 'Mains', 'Drinks', 'Desserts', 'Fries', 'Others'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Mains');
    setPrice(15.0);
    setCost(4.5);
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80');
    setDescription('');
    setIsAvailable(true);
    setIsPopular(false);
    setIsCombo(false);
    setModifiersText('');
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setCost(item.cost);
    setImage(item.image);
    setDescription(item.description);
    setIsAvailable(item.isAvailable);
    setIsPopular(!!item.isPopular);
    setIsCombo(!!item.isCombo);
    setModifiersText(item.modifiers ? item.modifiers.join(', ') : '');
    setShowItemModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modifiers = modifiersText
      ? modifiersText.split(',').map(m => m.trim()).filter(Boolean)
      : [];

    const itemData: MenuItem = {
      id: editingItem ? editingItem.id : 'm-' + Date.now(),
      name,
      category,
      price: Number(price),
      cost: Number(cost),
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      description,
      isAvailable,
      isPopular,
      isCombo,
      modifiers,
      addOns: editingItem?.addOns || [],
    };

    if (editingItem) {
      onUpdateMenuItem(itemData);
    } else {
      onAddMenuItem(itemData);
    }
    setShowItemModal(false);
  };

  const toggleAvailability = (item: MenuItem) => {
    onUpdateMenuItem({ ...item, isAvailable: !item.isAvailable });
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <UtensilsCrossed className="mr-2 h-6 w-6 text-[#FF8A00]" /> Menu & Recipe Catalog
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage food dishes, prices, modifiers, and daily item availability
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
        {/* Category Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#FF8A00] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs font-medium focus:border-[#FF8A00] focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Grid of Menu Items */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
              !item.isAvailable ? 'opacity-60 grayscale-[40%]' : ''
            }`}
          >
            {/* Image Banner */}
            <div className="relative h-44 w-full overflow-hidden bg-gray-100">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                {item.isPopular && (
                  <span className="flex items-center space-x-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                    <Star className="h-3 w-3 fill-white" />
                    <span>Popular</span>
                  </span>
                )}
                {item.isCombo && (
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    Combo
                  </span>
                )}
              </div>

              {/* Category Tag */}
              <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                {item.category}
              </span>
            </div>

            {/* Body Info */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-gray-900 text-sm dark:text-white line-clamp-1">
                  {item.name}
                </h3>
                <span className="text-base font-black text-[#FF8A00] ml-2">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {item.description}
              </p>

              {/* Modifiers List */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {item.modifiers.map(m => (
                    <span
                      key={m}
                      className="rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 p-3 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
              <button
                onClick={() => toggleAvailability(item)}
                className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  item.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {item.isAvailable ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span>In Stock</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Sold Out</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  title="Edit Dish"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete ${item.name} from menu?`)) {
                      onDeleteMenuItem(item.id);
                    }
                  }}
                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950"
                  title="Delete Dish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / ADD MENU ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingItem ? 'Edit Menu Dish' : 'Add New Dish to Catalog'}
            </h3>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Dish Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Lobster Thermidor"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as MenuItem['category'])}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Fries">Fries</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Ingredient Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={e => setCost(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ingredients, preparation details..."
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Modifiers (comma separated)
                </label>
                <input
                  type="text"
                  value={modifiersText}
                  onChange={e => setModifiersText(e.target.value)}
                  placeholder="e.g. Rare, Medium, Extra Spicy, Gluten Free"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                    className="rounded-md text-[#FF8A00]"
                  />
                  <span>Currently Available</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={e => setIsPopular(e.target.checked)}
                    className="rounded-md text-[#FF8A00]"
                  />
                  <span>Mark as Popular</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCombo}
                    onChange={e => setIsCombo(e.target.checked)}
                    className="rounded-md text-[#FF8A00]"
                  />
                  <span>Combo Meal</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
