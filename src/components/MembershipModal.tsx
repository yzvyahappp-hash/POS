import React, { useState } from 'react';
import { X, Award, Ticket, Gift, CheckCircle2, UserCheck, Star, Sparkles, Copy, ChevronRight, LogOut, Phone, Mail, User } from 'lucide-react';
import { Customer, CustomerCoupon, CouponCode, RestaurantSettings } from '../types';
import { gasService } from '../services/gasService';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  coupons: CustomerCoupon[];
  storeCoupons?: CouponCode[];
  onUpdateCustomer: (customer: Customer) => void;
  onAddCoupon: (coupon: CustomerCoupon) => void;
  onAddCustomer: (newCustomer: Customer) => void;
  settings: RestaurantSettings;
}

interface RewardItem {
  id: string;
  code?: string;
  title: string;
  pointsCost: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  description: string;
  badge: string;
}

const REWARD_CATALOG: RewardItem[] = [
  {
    id: 'rew-1',
    title: '$5 Off Any Order',
    pointsCost: 100,
    discountType: 'fixed',
    discountValue: 5,
    description: 'Valid for any food or drink item in restaurant',
    badge: 'Popular',
  },
  {
    id: 'rew-2',
    title: 'Free Gourmet Dessert',
    pointsCost: 150,
    discountType: 'fixed',
    discountValue: 12,
    description: 'Complimentary dessert of choice (Tiramisu, Molten Cake, etc.)',
    badge: 'Sweet Treat',
  },
  {
    id: 'rew-3',
    title: '$10 Off Prime Steak',
    pointsCost: 200,
    discountType: 'fixed',
    discountValue: 10,
    description: 'Valid on Prime Ribeye, Wagyu Burger or Steak Cut',
    badge: 'Best Value',
  },
  {
    id: 'rew-4',
    title: '20% Off Entire Meal',
    pointsCost: 300,
    discountType: 'percentage',
    discountValue: 20,
    description: 'Apply 20% discount to your entire bill subtotal',
    badge: 'VIP Favorite',
  },
  {
    id: 'rew-5',
    title: 'VIP Chef Table Voucher ($35 Off)',
    pointsCost: 500,
    discountType: 'fixed',
    discountValue: 35,
    description: 'Exclusive chef table tasting experience discount',
    badge: 'Exclusive',
  },
];

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  customers,
  coupons,
  storeCoupons,
  onUpdateCustomer,
  onAddCoupon,
  onAddCustomer,
  settings,
}) => {
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'rewards' | 'my_coupons'>('rewards');
  const [inputIdentifier, setInputIdentifier] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Derive active store coupons from Admin Management section
  const activeStoreCoupons = storeCoupons ? storeCoupons.filter(c => c.isActive) : [];

  const displayRewardCatalog: RewardItem[] =
    activeStoreCoupons.length > 0
      ? activeStoreCoupons.map(cpn => {
          let pointsCost = 100;
          if (cpn.discountType === 'percentage') {
            pointsCost = Math.max(50, cpn.discountValue * 10);
          } else {
            pointsCost = Math.max(50, cpn.discountValue * 15);
          }
          return {
            id: cpn.id,
            code: cpn.code,
            title: cpn.title || `${cpn.code} Coupon`,
            pointsCost,
            discountType: cpn.discountType,
            discountValue: cpn.discountValue,
            description:
              cpn.description ||
              (cpn.discountType === 'fixed'
                ? `$${cpn.discountValue} off storewide discount code ${cpn.code}`
                : `${cpn.discountValue}% off storewide discount code ${cpn.code}`),
            badge: cpn.code,
          };
        })
      : REWARD_CATALOG;

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const query = inputIdentifier.trim().toLowerCase();
    if (!query) {
      setErrorMsg('Please enter your phone number or email.');
      return;
    }

    const found = customers.find(
      c => c.email.toLowerCase() === query || c.phone.replaceAll(' ', '').includes(query) || c.name.toLowerCase().includes(query)
    );

    if (found) {
      setActiveCustomer(found);
      setSuccessMsg(`Welcome back, ${found.name}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg('No member account found with those details. Register below to get 100 free bonus points!');
    }
  };

  const handleQuickSelectMember = (c: Customer) => {
    setActiveCustomer(c);
    setErrorMsg('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || (!newEmail && !newPhone)) {
      setErrorMsg('Please enter your name and phone number or email.');
      return;
    }

    const created: Customer = {
      id: 'cust-' + Date.now(),
      name: newName,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@guest.com`,
      phone: newPhone || '+1 555-0100',
      loyaltyPoints: 100, // 100 Bonus Welcome Points!
      visitCount: 1,
      totalSpent: 0,
      tier: 'Silver',
      favoriteDishes: [],
      lastVisit: new Date().toISOString().split('T')[0],
      notes: 'New Online Member Sign Up (+100 Bonus Points)',
    };

    onAddCustomer(created);
    setActiveCustomer(created);
    setSuccessMsg('🎉 Membership created! 100 Bonus Loyalty Points added!');
    setTimeout(() => setSuccessMsg(''), 4000);

    // Sync to Google Sheets
    if (settings.gasWebAppUrl) {
      gasService.syncAllToGoogleSheets(settings.gasWebAppUrl, {
        customers: [...customers, created],
      });
    }
  };

  const handleRedeemReward = (reward: RewardItem) => {
    if (!activeCustomer) return;
    setErrorMsg('');

    if (activeCustomer.loyaltyPoints < reward.pointsCost) {
      setErrorMsg(`Insufficient points! You need ${reward.pointsCost - activeCustomer.loyaltyPoints} more points for this coupon.`);
      return;
    }

    const updatedPoints = activeCustomer.loyaltyPoints - reward.pointsCost;
    const updatedCustomer: Customer = {
      ...activeCustomer,
      loyaltyPoints: updatedPoints,
    };

    const newCoupon: CustomerCoupon = {
      id: 'cpn-' + Date.now(),
      customerId: activeCustomer.id,
      code: reward.code || `BISTRO-${reward.title.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: reward.title,
      discountType: reward.discountType,
      discountValue: reward.discountValue,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date().toISOString(),
      isUsed: false,
    };

    onUpdateCustomer(updatedCustomer);
    onAddCoupon(newCoupon);
    setActiveCustomer(updatedCustomer);

    setSuccessMsg(`🎁 Successfully redeemed "${reward.title}"! Voucher code: ${newCoupon.code}`);
    setTimeout(() => setSuccessMsg(''), 5000);

    // Save and Sync Points & Coupon Data to Google Sheets DB
    if (settings.gasWebAppUrl) {
      const updatedCustomersList = customers.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c));
      gasService.syncAllToGoogleSheets(settings.gasWebAppUrl, {
        customers: updatedCustomersList,
        coupons: [...coupons, newCoupon],
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const myCouponsList = coupons.filter(c => c.customerId === activeCustomer?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 shadow-md">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">Guest Loyalty & Membership</h3>
              <p className="text-xs text-amber-400 font-semibold">Earn Points & Redeem Dining Coupons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* IF NOT SIGNED IN */}
          {!activeCustomer ? (
            <div className="space-y-6">
              {/* Mode Tabs */}
              <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 rounded-xl py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    authMode === 'login' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Member Sign In
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 rounded-xl py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    authMode === 'signup' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register (+100 Bonus Pts)
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Member Phone Number or Email
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. david.m@example.com or +1 555-0123"
                        value={inputIdentifier}
                        onChange={e => setInputIdentifier(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 transition-all cursor-pointer"
                  >
                    Access Membership Dashboard
                  </button>

                  {/* Demo Quick Select */}
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Test Demo Member Accounts:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {customers.slice(0, 4).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleQuickSelectMember(c)}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-left hover:border-amber-500/50 hover:bg-slate-800 transition-all cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{c.name}</p>
                            <p className="text-[10px] text-amber-400 font-semibold">{c.tier} • {c.loyaltyPoints} Pts</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+1 555-0199"
                        value={newPhone}
                        onChange={e => setNewPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="jane@example.com"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-300 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Instant Reward: Get 100 bonus loyalty points upon sign-up!</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 transition-all cursor-pointer"
                  >
                    Join Membership & Claim 100 Pts
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* IF LOGGED IN AS MEMBER */
            <div className="space-y-6">
              {/* MEMBER DIGITAL CARD */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-800 to-amber-950 border border-amber-500/30 p-5 shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black tracking-widest text-amber-400 uppercase border border-amber-500/30">
                      {activeCustomer.tier} Member
                    </span>
                    <h4 className="mt-2 text-xl font-black text-white">{activeCustomer.name}</h4>
                    <p className="text-xs text-slate-400">{activeCustomer.phone || activeCustomer.email}</p>
                  </div>
                  <button
                    onClick={() => setActiveCustomer(null)}
                    className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="mt-6 flex items-end justify-between border-t border-slate-800/80 pt-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points Balance</span>
                    <div className="flex items-center space-x-1.5 text-2xl font-black text-amber-400">
                      <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                      <span>{activeCustomer.loyaltyPoints}</span>
                      <span className="text-xs font-medium text-slate-400">Pts</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visits Count</span>
                    <p className="text-sm font-extrabold text-white">{activeCustomer.visitCount} Dining Visits</p>
                  </div>
                </div>
              </div>

              {/* TABS FOR REWARDS & MY COUPONS */}
              <div className="flex space-x-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'rewards'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Gift className="h-4 w-4" />
                  <span>Redeem Rewards</span>
                </button>
                <button
                  onClick={() => setActiveTab('my_coupons')}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === 'my_coupons'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Ticket className="h-4 w-4" />
                  <span>My Active Coupons ({myCouponsList.length})</span>
                </button>
              </div>

              {/* TAB 1: REDEEM REWARDS */}
              {activeTab === 'rewards' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-medium">
                    Use your points to get instant discount vouchers for your next visit!
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {displayRewardCatalog.map(rew => {
                      const canAfford = activeCustomer.loyaltyPoints >= rew.pointsCost;
                      return (
                        <div
                          key={rew.id}
                          className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                            canAfford
                              ? 'border-amber-500/40 bg-slate-950 hover:border-amber-500'
                              : 'border-slate-800 bg-slate-950/40 opacity-75'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">
                                {rew.badge}
                              </span>
                              <span className="flex items-center text-xs font-black text-amber-400">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" />
                                {rew.pointsCost} Pts
                              </span>
                            </div>
                            <h5 className="text-sm font-extrabold text-white">{rew.title}</h5>
                            <p className="mt-1 text-xs text-slate-400">{rew.description}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900">
                            <button
                              onClick={() => handleRedeemReward(rew)}
                              disabled={!canAfford}
                              className={`w-full rounded-xl py-2 text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 shadow-md'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Gift className="h-3.5 w-3.5" />
                              <span>{canAfford ? 'Redeem Coupon' : `Need ${rew.pointsCost - activeCustomer.loyaltyPoints} More Pts`}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: MY COUPONS */}
              {activeTab === 'my_coupons' && (
                <div className="space-y-4">
                  {myCouponsList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                      <Ticket className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-slate-400">No coupons redeemed yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Go to "Redeem Rewards" above to exchange your loyalty points for discount vouchers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Coupons Section */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center">
                          <Ticket className="mr-1.5 h-3.5 w-3.5" /> Active Unused Coupons (
                          {myCouponsList.filter(c => !c.isUsed).length})
                        </h4>
                        {myCouponsList.filter(c => !c.isUsed).length === 0 ? (
                          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-center text-xs text-slate-500 font-medium">
                            No active unused coupons.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {myCouponsList
                              .filter(c => !c.isUsed)
                              .map(c => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-slate-950 p-3.5 shadow-md"
                                >
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                                        ACTIVE VOUCHER
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        Redeemed {new Date(c.redeemedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <h5 className="mt-1 text-sm font-black text-white">{c.title}</h5>
                                    <div className="mt-1.5 inline-flex items-center space-x-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-0.5">
                                      <span className="font-mono text-xs font-extrabold text-amber-400 tracking-wider">
                                        {c.code}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => copyToClipboard(c.code)}
                                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-all flex items-center space-x-1 cursor-pointer shrink-0"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-amber-400" />
                                    <span>{copiedCode === c.code ? 'Copied!' : 'Copy Code'}</span>
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {/* Used Coupons History Section */}
                      {myCouponsList.filter(c => c.isUsed).length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> Used Coupons History (
                            {myCouponsList.filter(c => c.isUsed).length})
                          </h4>
                          <div className="space-y-2">
                            {myCouponsList
                              .filter(c => c.isUsed)
                              .map(c => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 opacity-80"
                                >
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                                        USED
                                      </span>
                                      {c.usedAt && (
                                        <span className="text-xs text-slate-400">
                                          Used on {new Date(c.usedAt).toLocaleDateString()}
                                        </span>
                                      )}
                                      {c.usedOnOrderNumber && (
                                        <span className="text-xs font-mono text-amber-400 font-bold">
                                          ({c.usedOnOrderNumber})
                                        </span>
                                      )}
                                    </div>
                                    <h5 className="mt-1 text-xs font-bold text-slate-300">{c.title}</h5>
                                    <span className="font-mono text-[10px] text-slate-500">{c.code}</span>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-black text-rose-400">
                                      -${(c.usedDiscountAmount || c.discountValue).toFixed(2)} Off
                                    </span>
                                    <p className="text-[10px] text-slate-500 font-medium">Money Discounted</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
