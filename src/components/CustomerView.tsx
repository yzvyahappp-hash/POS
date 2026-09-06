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
  Sparkles,
  GitMerge,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  FileText,
  Edit2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Customer, Order, Reservation } from '../types';
import { formatDateUTC8, getTodayUTC8 } from '../utils/dateUtils';
import { copyToClipboard } from '../utils/clipboard';
import {
  findDuplicateCustomerGroups,
  findExistingCustomer,
  mergeCustomerProfiles,
  normalizePhone,
  isPhoneMatch,
} from '../utils/customerUtils';

interface CustomerViewProps {
  customers: Customer[];
  orders?: Order[];
  reservations?: Reservation[];
  onAddCustomer: (newCustomer: Customer) => void;
  onUpdateCustomer?: (updatedCustomer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  orders = [],
  reservations = [],
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBirthday, setEditBirthday] = useState('');
  const [editTier, setEditTier] = useState<Customer['tier']>('Bronze');
  const [editPoints, setEditPoints] = useState<number>(0);

  // Manual Merge state
  const [manualMergeSourceId, setManualMergeSourceId] = useState<string | null>(null);
  const [manualMergeTargetId, setManualMergeTargetId] = useState<string>('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');

  // Find duplicate profile groups
  const duplicateGroups = findDuplicateCustomerGroups(customers);

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      normalizePhone(c.phone).includes(normalizePhone(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    copyToClipboard(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleOpenEdit = (cust: Customer, defaultEmailFallback?: string) => {
    setEditingCustomer(cust);
    setEditName(cust.name || '');
    setEditPhone(cust.phone || '');
    setEditEmail(cust.email || defaultEmailFallback || '');
    setEditBirthday(cust.birthday || '');
    setEditTier(cust.tier || 'Bronze');
    setEditPoints(cust.loyaltyPoints || 0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !onUpdateCustomer) return;

    const updated: Customer = {
      ...editingCustomer,
      name: editName.trim() || editingCustomer.name,
      phone: editPhone.trim() || editingCustomer.phone,
      email: editEmail.trim(),
      birthday: editBirthday || editingCustomer.birthday,
      tier: editTier,
      loyaltyPoints: Number(editPoints) || 0,
      updatedAt: new Date().toISOString(),
    };

    onUpdateCustomer(updated);
    setEditingCustomer(null);
  };

  const handleQuickLinkEmail = (cust: Customer, discoveredEmail: string) => {
    if (!onUpdateCustomer || !discoveredEmail) return;
    const updated: Customer = {
      ...cust,
      email: discoveredEmail.trim(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateCustomer(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = findExistingCustomer(customers, { name, phone, email });

    if (existing && onUpdateCustomer) {
      // Auto-update existing instead of creating duplicate!
      const updated: Customer = {
        ...existing,
        name: name.trim() || existing.name,
        phone: phone.trim() || existing.phone,
        email: email.trim() || existing.email,
        birthday: birthday || existing.birthday,
        lastVisit: getTodayUTC8(),
        updatedAt: new Date().toISOString(),
      };
      onUpdateCustomer(updated);
    } else {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        birthday,
        loyaltyPoints: 100, // Welcome points
        visitCount: 1,
        totalSpent: 0,
        tier: 'Bronze',
        favoriteDishes: [],
        lastVisit: getTodayUTC8(),
        updatedAt: new Date().toISOString(),
      };
      onAddCustomer(newCust);
    }

    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setBirthday('');
  };

  const handleMergeGroup = (group: Customer[], primaryId: string) => {
    if (group.length < 2) return;
    const primary = group.find(c => c.id === primaryId) || group[0];
    const duplicates = group.filter(c => c.id !== primary.id);

    const merged = mergeCustomerProfiles(primary, duplicates);

    if (onUpdateCustomer) {
      onUpdateCustomer(merged);
    }
    if (onDeleteCustomer) {
      duplicates.forEach(dup => onDeleteCustomer(dup.id));
    }
  };

  const handleManualMerge = () => {
    if (!manualMergeSourceId || !manualMergeTargetId) return;
    const source = customers.find(c => c.id === manualMergeSourceId);
    const target = customers.find(c => c.id === manualMergeTargetId);
    if (!source || !target || source.id === target.id) return;

    const merged = mergeCustomerProfiles(target, [source]);

    if (onUpdateCustomer) {
      onUpdateCustomer(merged);
    }
    if (onDeleteCustomer) {
      onDeleteCustomer(source.id);
    }

    setManualMergeSourceId(null);
    setManualMergeTargetId('');
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
            Smart customer identity resolution, guest histories, Gmail accounts, phone matching, and loyalty tiers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {duplicateGroups.length > 0 && (
            <button
              onClick={() => setShowMergeModal(true)}
              className="flex items-center space-x-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shadow-xs"
            >
              <GitMerge className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>Review Duplicates ({duplicateGroups.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer Profile</span>
          </button>
        </div>
      </div>

      {/* Smart Duplicate Alert Banner */}
      {duplicateGroups.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 text-white rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center">
                Smart Identity Resolution Active
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                Found {duplicateGroups.length} potential duplicate customer profile(s) with matching normalized phone numbers, emails, or names.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMergeModal(true)}
            className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-xs whitespace-nowrap"
          >
            Consolidate Profiles
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, Gmail / email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-medium focus:border-[#FF8A00] focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl space-x-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Smart Phone Normalization, Gmail Sync & Auto Matching Enabled</span>
        </div>
      </div>

      {/* Customer Grid Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map(cust => {
          // Check matching orders / reservations
          const matchedOrders = orders.filter(o =>
            (o.customerId && o.customerId === cust.id) ||
            isPhoneMatch(o.customerPhone, cust.phone) ||
            (o.customerName && o.customerName.toLowerCase() === cust.name.toLowerCase())
          );
          const matchedReservations = reservations.filter(r =>
            isPhoneMatch(r.phone, cust.phone) ||
            (r.customerName && r.customerName.toLowerCase() === cust.name.toLowerCase())
          );

          // Look for linked email in reservation/orders if cust.email is not directly populated
          const linkedResWithEmail = matchedReservations.find(r => r.email && r.email.trim());
          const linkedOrderWithEmail = matchedOrders.find(o => (o as any).customerEmail && (o as any).customerEmail.trim());
          const discoveredEmail = cust.email || linkedResWithEmail?.email || (linkedOrderWithEmail as any)?.customerEmail || '';
          const hasDirectEmail = Boolean(cust.email && cust.email.trim());
          const isGoogleMail = discoveredEmail.toLowerCase().includes('@gmail.com') || discoveredEmail.toLowerCase().includes('@googlemail.com');

          return (
            <div
              key={cust.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-3.5 dark:border-gray-800">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-black text-[#FF8A00] dark:bg-orange-950/50">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-gray-900 text-sm dark:text-white truncate">
                          {cust.name}
                        </h3>
                        <button
                          onClick={() => handleOpenEdit(cust, discoveredEmail)}
                          title="Edit Customer Profile"
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="flex flex-col space-y-0.5 mt-0.5">
                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400 shrink-0" />
                          {cust.phone || 'No Phone Registered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black shrink-0 ${
                      cust.tier === 'VIP'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        : cust.tier === 'Gold'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : cust.tier === 'Silver'
                        ? 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300'
                    }`}
                  >
                    {cust.tier} Member
                  </span>
                </div>

                {/* Identity Verification Badges */}
                <div className="my-2.5 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-500" />
                    Verified Identity
                  </span>
                  {matchedOrders.length > 0 && (
                    <span className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300">
                      <FileText className="mr-1 h-3 w-3 text-blue-500" />
                      {matchedOrders.length} Linked Orders
                    </span>
                  )}
                  {matchedReservations.length > 0 && (
                    <span className="inline-flex items-center rounded-lg bg-purple-50 border border-purple-200 px-2 py-0.5 text-[9px] font-bold text-purple-700 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-300">
                      <Calendar className="mr-1 h-3 w-3 text-purple-500" />
                      {matchedReservations.length} Reservations
                    </span>
                  )}
                </div>

                {/* PROMINENT GMAIL / EMAIL CARD SECTION */}
                <div className="my-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isGoogleMail ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'}`}>
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                          {isGoogleMail ? 'Google Account (Gmail)' : 'Email Address'}
                        </span>
                        {discoveredEmail ? (
                          <span className="text-xs font-semibold text-gray-900 dark:text-white truncate block font-mono">
                            {discoveredEmail}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic block">
                            No Gmail / Email recorded
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      {discoveredEmail && (
                        <button
                          onClick={() => handleCopy(discoveredEmail, `email-${cust.id}`)}
                          title="Copy Email"
                          className="p-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 text-[10px] font-medium flex items-center space-x-1 px-1.5 py-1"
                        >
                          {copiedText === `email-${cust.id}` ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-600 text-[10px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      )}

                      {!hasDirectEmail && discoveredEmail && onUpdateCustomer && (
                        <button
                          onClick={() => handleQuickLinkEmail(cust, discoveredEmail)}
                          title="Save discovered email to customer profile"
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs"
                        >
                          Link Email
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(cust, discoveredEmail)}
                        className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs"
                      >
                        {discoveredEmail ? 'Edit' : '+ Add Gmail'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3-Col Stats */}
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
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
                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center">
                      <Heart className="h-3 w-3 text-rose-500 mr-1" /> Favorites
                    </span>
                    <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">
                      {cust.favoriteDishes.join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400">
                  Last visit: {cust.lastVisit ? formatDateUTC8(cust.lastVisit) : 'N/A'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(cust, discoveredEmail)}
                    className="inline-flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Edit
                  </button>

                  <button
                    onClick={() => setManualMergeSourceId(cust.id)}
                    className="inline-flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <GitMerge className="h-3 w-3 mr-1" />
                    Merge
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center">
                <Edit2 className="h-4 w-4 mr-2 text-[#FF8A00]" /> Edit Customer Profile
              </h3>
              <button
                onClick={() => setEditingCustomer(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-[#FF8A00] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-[#FF8A00] focus:outline-hidden font-mono"
                  placeholder="+1 555-0123"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Mail className="h-3 w-3 mr-1 text-blue-500" /> Google Account / Gmail Address
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">Stored in Database</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:border-[#FF8A00] focus:outline-hidden font-mono"
                  placeholder="customer@gmail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Loyalty Tier
                  </label>
                  <select
                    value={editTier}
                    onChange={e => setEditTier(e.target.value as Customer['tier'])}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="Bronze">Bronze Member</option>
                    <option value="Silver">Silver Member</option>
                    <option value="Gold">Gold Member</option>
                    <option value="VIP">VIP Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Loyalty Points
                  </label>
                  <input
                    type="number"
                    value={editPoints}
                    onChange={e => setEditPoints(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
                >
                  Save & Sync Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL MERGE SELECTION MODAL */}
      {manualMergeSourceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                <GitMerge className="h-4 w-4 mr-2 text-amber-500" /> Merge Customer Profile
              </h3>
              <button
                onClick={() => setManualMergeSourceId(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Select target customer account to merge this profile into. All visits, spent amounts, loyalty points, and notes will be combined automatically.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Source Profile (To remove)
                </label>
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs font-bold text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
                  {customers.find(c => c.id === manualMergeSourceId)?.name} (
                  {customers.find(c => c.id === manualMergeSourceId)?.phone || 'No phone'})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                  Merge into Main Target Account
                </label>
                <select
                  value={manualMergeTargetId}
                  onChange={e => setManualMergeTargetId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="">-- Select Target Account --</option>
                  {customers
                    .filter(c => c.id !== manualMergeSourceId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'No phone'}) - {c.tier} Member (${c.totalSpent.toFixed(0)} spent)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setManualMergeSourceId(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  disabled={!manualMergeTargetId}
                  onClick={handleManualMerge}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-600 disabled:opacity-50"
                >
                  Confirm & Consolidate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMART DUPLICATE REVIEW MODAL */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Duplicate Customer Identification Engine
                </h3>
              </div>
              <button
                onClick={() => setShowMergeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              The AI identity resolution engine found matching records. Review and merge duplicate profiles into unified member accounts.
            </p>

            <div className="space-y-4">
              {duplicateGroups.map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Duplicate Match Set #{groupIdx + 1} ({group.length} records)
                    </span>
                    <button
                      onClick={() => handleMergeGroup(group, group[0].id)}
                      className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-xs"
                    >
                      Merge All into {group[0].name}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.map(item => (
                      <div
                        key={item.id}
                        className="rounded-xl bg-white p-3 border border-amber-100 shadow-2xs dark:bg-gray-800 dark:border-gray-700"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600">
                            {item.tier}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-gray-500">
                          Phone: {item.phone || 'N/A'}
                        </div>
                        {item.email && (
                          <div className="text-[10px] text-gray-400 truncate">
                            Email: {item.email}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-gray-500 grid grid-cols-3 gap-1 text-center bg-gray-50 dark:bg-gray-900 p-1.5 rounded-lg">
                          <div>Visits: {item.visitCount}</div>
                          <div>Spent: ${item.totalSpent}</div>
                          <div>Pts: {item.loyaltyPoints}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMergeModal(false)}
                className="rounded-xl bg-gray-200 px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-bold text-gray-600 mb-1">Gmail / Email</label>
                <input
                  type="email"
                  placeholder="david@gmail.com"
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
