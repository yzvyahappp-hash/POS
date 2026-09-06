import React, { useState } from 'react';
import {
  Tag,
  Ticket,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  Gift,
  Search,
  Check,
  Utensils,
  Layers,
  ShoppingBag,
  Copy,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';
import { PromoRule, CustomerCoupon, Customer, CategoryCondition, CouponCode, Order } from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface PromosAndCouponsViewProps {
  storeCoupons: CouponCode[];
  promos: PromoRule[];
  coupons: CustomerCoupon[];
  customers: Customer[];
  orders?: Order[];
  onSaveStoreCoupon: (coupon: CouponCode) => void;
  onDeleteStoreCoupon: (couponId: string) => void;
  onSavePromo: (promo: PromoRule) => void;
  onDeletePromo: (promoId: string) => void;
  onIssueCoupon: (coupon: CustomerCoupon) => void;
  onDeleteCoupon: (couponId: string) => void;
}

const CATEGORY_OPTIONS = ['Mains', 'Drinks', 'Appetizers', 'Desserts', 'Sides', 'Fries'];

export const PromosAndCouponsView: React.FC<PromosAndCouponsViewProps> = ({
  storeCoupons,
  promos,
  coupons,
  customers,
  orders = [],
  onSaveStoreCoupon,
  onDeleteStoreCoupon,
  onSavePromo,
  onDeletePromo,
  onIssueCoupon,
  onDeleteCoupon,
}) => {
  const [activeTab, setActiveTab] = useState<'store-coupons' | 'promos' | 'vouchers'>('store-coupons');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Store Coupon Form Modal state
  const [isStoreCouponModalOpen, setIsStoreCouponModalOpen] = useState(false);
  const [editingStoreCoupon, setEditingStoreCoupon] = useState<CouponCode | null>(null);

  // Form Fields for Store Coupon Code
  const [cpnCode, setCpnCode] = useState('');
  const [cpnTitle, setCpnTitle] = useState('');
  const [cpnDesc, setCpnDesc] = useState('');
  const [cpnDiscountType, setCpnDiscountType] = useState<'fixed' | 'percentage'>('percentage');
  const [cpnDiscountValue, setCpnDiscountValue] = useState<number>(10);
  const [cpnMinSubtotal, setCpnMinSubtotal] = useState<number>(0);
  const [cpnIsActive, setCpnIsActive] = useState(true);

  // Promo Form Modal state
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoRule | null>(null);

  // Form Fields for Promo Rule
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [promoDiscountValue, setPromoDiscountValue] = useState<number>(3);
  const [promoMinSubtotal, setPromoMinSubtotal] = useState<number>(0);
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [categoryConditions, setCategoryConditions] = useState<CategoryCondition[]>([
    { category: 'Mains', minQuantity: 1 },
    { category: 'Drinks', minQuantity: 2 },
  ]);

  // Member Voucher Issue Modal state
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [voucherTitle, setVoucherTitle] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscountType, setVoucherDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [voucherDiscountValue, setVoucherDiscountValue] = useState<number>(5);

  // --- Store Coupon Handlers ---
  const handleOpenNewStoreCoupon = () => {
    setEditingStoreCoupon(null);
    setCpnCode('');
    setCpnTitle('');
    setCpnDesc('');
    setCpnDiscountType('percentage');
    setCpnDiscountValue(10);
    setCpnMinSubtotal(0);
    setCpnIsActive(true);
    setIsStoreCouponModalOpen(true);
  };

  const handleEditStoreCoupon = (cpn: CouponCode) => {
    setEditingStoreCoupon(cpn);
    setCpnCode(cpn.code);
    setCpnTitle(cpn.title);
    setCpnDesc(cpn.description || '');
    setCpnDiscountType(cpn.discountType);
    setCpnDiscountValue(cpn.discountValue);
    setCpnMinSubtotal(cpn.minSubtotal || 0);
    setCpnIsActive(cpn.isActive);
    setIsStoreCouponModalOpen(true);
  };

  const handleSaveStoreCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpnCode.trim() || !cpnTitle.trim()) return;

    const newCoupon: CouponCode = {
      id: editingStoreCoupon ? editingStoreCoupon.id : `store-cpn-${Date.now()}`,
      code: cpnCode.trim().toUpperCase(),
      title: cpnTitle.trim(),
      description: cpnDesc.trim() || undefined,
      discountType: cpnDiscountType,
      discountValue: Number(cpnDiscountValue),
      minSubtotal: cpnMinSubtotal > 0 ? Number(cpnMinSubtotal) : undefined,
      usageCount: editingStoreCoupon ? editingStoreCoupon.usageCount : 0,
      isActive: cpnIsActive,
      createdAt: editingStoreCoupon ? editingStoreCoupon.createdAt : new Date().toISOString(),
    };

    onSaveStoreCoupon(newCoupon);
    setIsStoreCouponModalOpen(false);
  };

  const handleCopyCode = (code: string) => {
    copyToClipboard(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // --- Promo Rule Handlers ---
  const handleOpenNewPromo = () => {
    setEditingPromo(null);
    setPromoTitle('');
    setPromoDesc('');
    setPromoDiscountType('fixed');
    setPromoDiscountValue(3);
    setPromoMinSubtotal(0);
    setPromoIsActive(true);
    setCategoryConditions([
      { category: 'Mains', minQuantity: 1 },
      { category: 'Drinks', minQuantity: 2 },
    ]);
    setIsPromoModalOpen(true);
  };

  const handleEditPromo = (p: PromoRule) => {
    setEditingPromo(p);
    setPromoTitle(p.title);
    setPromoDesc(p.description || '');
    setPromoDiscountType(p.discountType);
    setPromoDiscountValue(p.discountValue);
    setPromoMinSubtotal(p.minSubtotal || 0);
    setPromoIsActive(p.isActive);
    setCategoryConditions(p.categoryConditions || []);
    setIsPromoModalOpen(true);
  };

  const handleAddCategoryCondition = () => {
    setCategoryConditions(prev => [...prev, { category: 'Drinks', minQuantity: 1 }]);
  };

  const handleRemoveCategoryCondition = (index: number) => {
    setCategoryConditions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateCategoryCondition = (
    index: number,
    field: keyof CategoryCondition,
    value: string | number
  ) => {
    setCategoryConditions(prev =>
      prev.map((cond, idx) => {
        if (idx === index) {
          return { ...cond, [field]: value };
        }
        return cond;
      })
    );
  };

  const handleSavePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    const newPromo: PromoRule = {
      id: editingPromo ? editingPromo.id : `promo-${Date.now()}`,
      title: promoTitle.trim(),
      description: promoDesc.trim() || `Auto combo discount when conditions met`,
      isAutomatic: true,
      discountType: promoDiscountType,
      discountValue: Number(promoDiscountValue),
      minSubtotal: promoMinSubtotal > 0 ? Number(promoMinSubtotal) : undefined,
      categoryConditions: categoryConditions.filter(c => c.minQuantity > 0),
      isActive: promoIsActive,
      createdAt: editingPromo ? editingPromo.createdAt : new Date().toISOString(),
    };

    onSavePromo(newPromo);
    setIsPromoModalOpen(false);
  };

  // --- Member Voucher Handlers ---
  const handleIssueVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !voucherTitle.trim() || !voucherCode.trim()) return;

    const newCoupon: CustomerCoupon = {
      id: `cpn-${Date.now()}`,
      customerId: selectedCustomerId,
      code: voucherCode.trim().toUpperCase(),
      title: voucherTitle.trim(),
      discountType: voucherDiscountType,
      discountValue: Number(voucherDiscountValue),
      pointsSpent: 0,
      redeemedAt: new Date().toISOString(),
      isUsed: false,
    };

    onIssueCoupon(newCoupon);
    setIsVoucherModalOpen(false);
    setVoucherTitle('');
    setVoucherCode('');
  };

  // Filters
  const filteredStoreCoupons = storeCoupons.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  });

  const filteredVouchers = coupons.filter(c => {
    const cust = customers.find(cu => cu.id === c.customerId);
    const query = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      (cust && cust.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
            <Tag className="mr-2 h-6 w-6 text-[#FF8A00]" /> Promos & Coupon Catalog
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Create store promo codes (WELCOME10, VIP20), automatic combo rules, and customer vouchers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'store-coupons' && (
            <button
              onClick={handleOpenNewStoreCoupon}
              className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Coupon Code</span>
            </button>
          )}

          {activeTab === 'promos' && (
            <button
              onClick={handleOpenNewPromo}
              className="flex items-center space-x-1.5 rounded-xl bg-[#FF8A00] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Auto Combo Rule</span>
            </button>
          )}

          {activeTab === 'vouchers' && (
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition-all cursor-pointer"
            >
              <Ticket className="h-4 w-4" />
              <span>Issue Member Voucher</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-8">
        <button
          onClick={() => setActiveTab('store-coupons')}
          className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'store-coupons'
              ? 'border-[#FF8A00] text-[#FF8A00]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Coupon Catalog ({storeCoupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'promos'
              ? 'border-[#FF8A00] text-[#FF8A00]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Automatic Combo Rules ({promos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center space-x-2 border-b-2 pb-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'vouchers'
              ? 'border-[#FF8A00] text-[#FF8A00]'
              : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Ticket className="h-4 w-4" />
          <span>Member Vouchers ({coupons.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'store-coupons'
                ? 'Search coupon codes like WELCOME10, VIP20...'
                : activeTab === 'promos'
                ? 'Search combo promo rules...'
                : 'Search member voucher or customer name...'
            }
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs font-bold text-gray-800 focus:border-[#FF8A00] focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* TAB 1: STORE COUPON CATALOG */}
      {activeTab === 'store-coupons' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4 dark:bg-amber-950/20 dark:border-amber-900/30">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong className="font-bold">Store Promo Coupon Codes:</strong> Manage storewide promotional coupon codes (such as <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">WELCOME10</code>, <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">VIP20</code>, <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">SAVE5</code>). Cashiers and customers can enter or click these codes at checkout to instantly apply store discounts.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStoreCoupons.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800">
                <Tag className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No coupon codes found.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click "Create Coupon Code" to add codes like WELCOME10 or VIP20.
                </p>
              </div>
            ) : (
              filteredStoreCoupons.map(cpn => (
                <div
                  key={cpn.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all ${
                    cpn.isActive
                      ? 'border-amber-500/30 bg-white dark:bg-gray-900 dark:border-amber-500/20'
                      : 'border-gray-200 bg-gray-50/60 opacity-60 dark:border-gray-800 dark:bg-gray-900/40'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="rounded-lg bg-[#FF8A00]/10 px-3 py-1 font-mono text-sm font-black text-[#FF8A00] tracking-wider border border-[#FF8A00]/20">
                          {cpn.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(cpn.code)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
                          title="Copy Coupon Code"
                        >
                          {copiedCode === cpn.code ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditStoreCoupon(cpn)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStoreCoupon(cpn.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1">{cpn.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{cpn.description || 'Storewide discount coupon code'}</p>

                    {/* Stats & Requirements Box */}
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2 mb-3 text-xs">
                      <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-bold">
                        <span>Min Spend Required:</span>
                        <span className="text-gray-900 dark:text-white font-black">
                          {cpn.minSubtotal && cpn.minSubtotal > 0 ? `$${cpn.minSubtotal.toFixed(2)}` : 'None ($0)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <TrendingUp className="mr-1 h-3.5 w-3.5 text-amber-500" /> Times Used:
                        </span>
                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                          {orders.filter(o => o.couponCode?.trim().toUpperCase() === cpn.code.trim().toUpperCase()).length + (cpn.usageCount || 0)} orders
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Value & Status Banner */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                        cpn.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {cpn.isActive ? 'ACTIVE CODE' : 'INACTIVE'}
                    </span>

                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {cpn.discountType === 'fixed' ? `$${cpn.discountValue.toFixed(2)} OFF` : `${cpn.discountValue}% OFF`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATIC PROMO RULES */}
      {activeTab === 'promos' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4 dark:bg-amber-950/20 dark:border-amber-900/30">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong className="font-bold">How Automatic Combo Promos Work:</strong> Customers order individual items normally. When their order satisfies a combo rule (e.g. 1 Main + 2 Drinks), the system automatically deducts the combo discount at checkout and prints the promo reason on customer receipts!
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promos.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-800">
                <Tag className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No promo rules defined yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click "Create Auto Combo Rule" to set up rules like "Mains + 2 Drinks = $3 Off".
                </p>
              </div>
            ) : (
              promos.map(p => (
                <div
                  key={p.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all ${
                    p.isActive
                      ? 'border-amber-500/30 bg-white dark:bg-gray-900 dark:border-amber-500/20'
                      : 'border-gray-200 bg-gray-50/60 opacity-60 dark:border-gray-800 dark:bg-gray-900/40'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          p.isActive
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {p.isActive ? 'ACTIVE RULE' : 'INACTIVE'}
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditPromo(p)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-all cursor-pointer"
                          title="Edit Rule"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePromo(p.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1">{p.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{p.description}</p>

                    {/* Conditions Box */}
                    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-1.5 mb-3">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Trigger Conditions:
                      </span>
                      {p.categoryConditions && p.categoryConditions.length > 0 ? (
                        p.categoryConditions.map((cond, i) => (
                          <div key={i} className="flex items-center text-xs font-bold text-gray-700 dark:text-gray-200">
                            <Utensils className="mr-1.5 h-3.5 w-3.5 text-[#FF8A00]" />
                            <span>
                              {cond.minQuantity}x {cond.category}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500 font-medium">No category constraints</div>
                      )}

                      {p.minSubtotal !== undefined && p.minSubtotal > 0 && (
                        <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                          <span>Order Subtotal ≥ ${p.minSubtotal.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Value Banner */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-500">Discount Offered:</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {p.discountType === 'fixed' ? `-$${p.discountValue.toFixed(2)} Off` : `-${p.discountValue}% Off`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MEMBER VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <tr>
                    <th className="p-3.5">Voucher Title & Code</th>
                    <th className="p-3.5">Assigned Member</th>
                    <th className="p-3.5">Discount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Redeemed Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No member vouchers found.
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map(c => {
                      const cust = customers.find(cu => cu.id === c.customerId);
                      return (
                        <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900 dark:text-white">{c.title}</div>
                            <span className="font-mono text-[10px] font-extrabold text-[#FF8A00] tracking-wider">
                              {c.code}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-gray-800 dark:text-gray-200">
                              {cust ? cust.name : 'All Members / General'}
                            </div>
                            <span className="text-[10px] text-gray-400">{cust ? cust.phone : 'N/A'}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {c.discountType === 'fixed' ? `$${c.discountValue.toFixed(2)} OFF` : `${c.discountValue}% OFF`}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {c.isUsed ? (
                              <div>
                                <span className="inline-flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                  <XCircle className="h-3 w-3 text-rose-500" />
                                  <span>REDEEMED</span>
                                </span>
                                {c.usedOnOrderNumber && (
                                  <span className="block text-[10px] text-amber-500 font-mono mt-0.5">
                                    {c.usedOnOrderNumber}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                <span>ACTIVE UNUSED</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-gray-500">
                            {new Date(c.redeemedAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => onDeleteCoupon(c.id)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                              title="Delete Voucher"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT STORE COUPON MODAL */}
      {isStoreCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center">
                <Tag className="mr-2 h-5 w-5 text-[#FF8A00]" />
                {editingStoreCoupon ? 'Edit Store Coupon Code' : 'Create Store Coupon Code'}
              </h2>
              <button
                onClick={() => setIsStoreCouponModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreCouponSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpnCode}
                    onChange={e => setCpnCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10, VIP20"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-mono font-black text-[#FF8A00] uppercase focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Coupon Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpnTitle}
                    onChange={e => setCpnTitle(e.target.value)}
                    placeholder="e.g. Welcome 10% Off"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={cpnDesc}
                  onChange={e => setCpnDesc(e.target.value)}
                  placeholder="e.g. Storewide 10% discount for all customers"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={cpnDiscountType}
                    onChange={e => setCpnDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed">Fixed Cash Off ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value ({cpnDiscountType === 'fixed' ? '$' : '%'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cpnDiscountValue}
                    onChange={e => setCpnDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Order Subtotal ($) (0 = No Limit)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cpnMinSubtotal}
                  onChange={e => setCpnMinSubtotal(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 25 for $25 minimum spend requirement"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="cpnActiveCheck"
                  checked={cpnIsActive}
                  onChange={e => setCpnIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-md border-gray-300 text-[#FF8A00] focus:ring-[#FF8A00]"
                />
                <label htmlFor="cpnActiveCheck" className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Coupon Code is Active & Usable at Checkout
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsStoreCouponModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] cursor-pointer"
                >
                  Save Coupon Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMO RULE FORM MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-[#FF8A00]" />
                {editingPromo ? 'Edit Automatic Promo Rule' : 'Create Automatic Combo Promo'}
              </h2>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromoSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Promo Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={promoTitle}
                  onChange={e => setPromoTitle(e.target.value)}
                  placeholder="e.g. Mains + 2 Drinks Combo Special"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Receipt Reason & Description
                </label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={e => setPromoDesc(e.target.value)}
                  placeholder="e.g. Ordering 1 Main Dish and 2 Drinks gets $3.00 off"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-medium text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={promoDiscountType}
                    onChange={e => setPromoDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="fixed">Fixed Cash Off ($)</option>
                    <option value="percentage">Percentage Off (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value ({promoDiscountType === 'fixed' ? '$' : '%'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={promoDiscountValue}
                    onChange={e => setPromoDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Category Conditions Builder */}
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center">
                    <Layers className="mr-1.5 h-4 w-4 text-[#FF8A00]" /> Required Category Quantities
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCategoryCondition}
                    className="text-xs font-bold text-[#FF8A00] hover:underline flex items-center cursor-pointer"
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Category
                  </button>
                </div>

                <div className="space-y-2">
                  {categoryConditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 font-bold w-12">Min Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={cond.minQuantity}
                        onChange={e =>
                          handleUpdateCategoryCondition(idx, 'minQuantity', parseInt(e.target.value) || 1)
                        }
                        className="w-16 rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-center text-gray-800 dark:bg-gray-900 dark:text-white"
                      />
                      <span className="text-xs text-gray-400 font-bold">Category:</span>
                      <select
                        value={cond.category}
                        onChange={e => handleUpdateCategoryCondition(idx, 'category', e.target.value)}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-800 dark:bg-gray-900 dark:text-white"
                      >
                        {CATEGORY_OPTIONS.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveCategoryCondition(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal Condition */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Order Subtotal ($) (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={promoMinSubtotal}
                  onChange={e => setPromoMinSubtotal(parseFloat(e.target.value) || 0)}
                  placeholder="0 = No subtotal limit"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="promoActiveCheck"
                  checked={promoIsActive}
                  onChange={e => setPromoIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-md border-gray-300 text-[#FF8A00] focus:ring-[#FF8A00]"
                />
                <label htmlFor="promoActiveCheck" className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Rule is Active & Automatic
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e07900] cursor-pointer"
                >
                  Save Promo Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE MEMBER VOUCHER MODAL */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center">
                <Ticket className="mr-2 h-5 w-5 text-amber-500" /> Issue Member Voucher
              </h2>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueVoucherSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Select Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(cu => (
                    <option key={cu.id} value={cu.id}>
                      {cu.name} ({cu.phone}) - {cu.loyaltyPoints} pts
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Voucher Title *
                </label>
                <input
                  type="text"
                  required
                  value={voucherTitle}
                  onChange={e => setVoucherTitle(e.target.value)}
                  placeholder="e.g. VIP Member $5 Off Reward"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP5OFF or REWARD10"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-mono font-extrabold text-[#FF8A00] uppercase focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={voucherDiscountType}
                    onChange={e => setVoucherDiscountType(e.target.value as 'fixed' | 'percentage')}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="fixed">Fixed Cash ($)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={voucherDiscountValue}
                    onChange={e => setVoucherDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-900 focus:border-[#FF8A00] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-600 cursor-pointer"
                >
                  Issue Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
