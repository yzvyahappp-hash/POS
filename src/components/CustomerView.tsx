import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Award,
  Phone,
  Mail,
  Heart,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerViewProps {
  customers: Customer[];
  onAddCustomer: (newCustomer: Customer) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  onAddCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name,
      phone,
      email,
      birthday,
      loyaltyPoints: 100, // Welcome points
      visitCount: 1,
      totalSpent: 0,
      tier: 'Bronze',
      favoriteDishes: [],
      lastVisit: new Date().toISOString().split('T')[0],
    };
    onAddCustomer(newCust);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <Users className="mr-2 h-6 w-6 text-[#FF8A00]" /> Customer CRM & Loyalty
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Track guest visit histories, favorite dishes, spend totals, and loyalty point tiers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer Profile</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* Customer Grid Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map(cust => (
          <div
            key={cust.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 font-black text-[#FF8A00] dark:bg-orange-950/50">
                  {cust.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xs dark:text-white">{cust.name}</h3>
                  <span className="text-[10px] text-gray-400">{cust.phone}</span>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                  cust.tier === 'VIP'
                    ? 'bg-purple-100 text-purple-800'
                    : cust.tier === 'Gold'
                    ? 'bg-amber-100 text-amber-800'
                    : cust.tier === 'Silver'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {cust.tier} Member
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
                <span className="block text-[9px] text-gray-400 uppercase font-bold">Visits</span>
                <span className="font-black text-gray-900 dark:text-white">{cust.visitCount}</span>
              </div>

              <div className="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
                <span className="block text-[9px] text-gray-400 uppercase font-bold">Spent</span>
                <span className="font-black text-[#FF8A00]">${cust.totalSpent.toFixed(0)}</span>
              </div>

              <div className="rounded-xl bg-gray-50 p-2 dark:bg-gray-800">
                <span className="block text-[9px] text-gray-400 uppercase font-bold">Points</span>
                <span className="font-black text-emerald-600">{cust.loyaltyPoints}</span>
              </div>
            </div>

            {cust.favoriteDishes && cust.favoriteDishes.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-bold text-gray-400 flex items-center">
                  <Heart className="h-3 w-3 text-rose-500 mr-1" /> Favorites
                </span>
                <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {cust.favoriteDishes.join(', ')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Customer Profile</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. David Miller"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 555-0123"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="david@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
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
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
