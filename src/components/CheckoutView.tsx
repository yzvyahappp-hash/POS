import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  QrCode,
  Smartphone,
  Printer,
  Mail,
  CheckCircle2,
  Gift,
  Split,
  Percent,
  Receipt,
  X,
  Sparkles,
  User,
  Users,
  AlertCircle,
  Phone,
  Edit2,
  Check,
} from 'lucide-react';
import { Order, RestaurantSettings, Customer, CustomerCoupon, PromoRule, CouponCode, AppliedPromo } from '../types';
import { receiptService } from '../services/receiptService';
import { audioService } from '../services/audioService';
import { evaluateOrderPromos } from '../utils/promoEngine';

interface CheckoutViewProps {
  orders: Order[];
  customers: Customer[];
  coupons: CustomerCoupon[];
  storeCoupons?: CouponCode[];
  promoRules?: PromoRule[];
  settings: RestaurantSettings;
  activeOrderToCheckout: Order | null;
  onCompletePayment: (
    orderId: string,
    paymentDetails: {
      method: Order['paymentMethod'];
      cashReceived?: number;
      changeGiven?: number;
      pointsRedeemed?: number;
      pointsDiscountAmount?: number;
      couponCode?: string;
      couponDiscountAmount?: number;
      percentageDiscountAmount?: number;
      promoDiscountAmount?: number;
      appliedPromos?: AppliedPromo[];
      discountPercentage?: number;
      usedCouponIds?: string[];
      totalDiscount?: number;
      subtotal?: number;
      customerName?: string;
      customerPhone?: string;
      customerId?: string;
      finalTotalAmount?: number;
      customerPointsBalance?: number;
    }
  ) => void;
  onUpdateOrderDetails?: (updatedOrder: Order) => void;
  onMergeOrders?: (orderIdsToMerge: string[]) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  orders,
  customers,
  coupons,
  storeCoupons,
  promoRules,
  settings,
  activeOrderToCheckout,
  onCompletePayment,
  onUpdateOrderDetails,
  onMergeOrders,
}) => {
  const unpaidOrders = orders.filter(o => o.paymentStatus !== 'Paid' && o.status !== 'Cancelled');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    activeOrderToCheckout || (unpaidOrders.length > 0 ? unpaidOrders[0] : null)
  );

  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod'] | 'Split'>('Cash');
  const [cashReceived, setCashReceived] = useState<number>(selectedOrder ? selectedOrder.totalAmount : 0);
  const [couponCode, setCouponCode] = useState<string>('');
  const [redeemPoints, setRedeemPoints] = useState<number>(0);
  const [selectedCouponIds, setSelectedCouponIds] = useState<string[]>([]);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [paidSplitsCount, setPaidSplitsCount] = useState<number>(0);
  const [emailReceiptAddress, setEmailReceiptAddress] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (activeOrderToCheckout) {
      setSelectedOrder(activeOrderToCheckout);
      setCashReceived(activeOrderToCheckout.totalAmount);
      setKeypadString(activeOrderToCheckout.totalAmount.toString());
      setIsSuccess(false);
      setErrorMsg('');
      setPaidSplitsCount(0);
    }
  }, [activeOrderToCheckout]);

  // Customer Edit State
  const [isEditingCustomer, setIsEditingCustomer] = useState<boolean>(false);
  const [custNameInput, setCustNameInput] = useState<string>(selectedOrder?.customerName || '');
  const [custPhoneInput, setCustPhoneInput] = useState<string>(selectedOrder?.customerPhone || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(selectedOrder?.customerId || '');

  useEffect(() => {
    if (selectedOrder) {
      setCustNameInput(selectedOrder.customerName || '');
      setCustPhoneInput(selectedOrder.customerPhone || '');
      setSelectedCustomerId(selectedOrder.customerId || '');
    } else {
      setCustNameInput('');
      setCustPhoneInput('');
      setSelectedCustomerId('');
    }
    setIsEditingCustomer(false);
    setErrorMsg('');
  }, [selectedOrder?.id]);

  const [cashInputMode, setCashInputMode] = useState<'typed' | 'keypad'>(
    settings.cashInputMode || 'keypad'
  );
  const [keypadString, setKeypadString] = useState<string>('');

  // Find linked customer profile
  const cid = selectedCustomerId || selectedOrder?.customerId;
  const cname = custNameInput || selectedOrder?.customerName;
  const cphone = custPhoneInput || selectedOrder?.customerPhone;

  const matchedCustomer = customers.find(
    c =>
      (cid && c.id === cid) ||
      (cname && cname.trim().toLowerCase() !== 'guest' && c.name.toLowerCase() === cname.toLowerCase()) ||
      (cphone && cphone.trim() !== '' && c.phone === cphone)
  );

  const availablePoints = matchedCustomer ? (matchedCustomer.loyaltyPoints || 0) : 0;

  // Enforce Max Redeemable Points (cannot exceed customer available points balance)
  const effectiveRedeemPoints = Math.min(Math.max(0, redeemPoints || 0), availablePoints);
  const pointsDiscountAmount = Math.max(0, effectiveRedeemPoints * 0.10); // $0.10 per point

  // Active Customer Coupons for this member
  const activeCustomerCoupons = matchedCustomer
    ? coupons.filter(c => c.customerId === matchedCustomer.id && !c.isUsed)
    : [];

  // Checked coupons from checkboxes
  const checkedCoupons = activeCustomerCoupons.filter(c => selectedCouponIds.includes(c.id));

  let checkedCouponFixedDiscount = 0;
  let checkedCouponPercentage = 0;
  checkedCoupons.forEach(cp => {
    if (cp.discountType === 'fixed') {
      checkedCouponFixedDiscount += cp.discountValue;
    } else if (cp.discountType === 'percentage') {
      checkedCouponPercentage += cp.discountValue;
    }
  });

  // Manual Promo / Coupon Code Logic
  let promoFixedDiscount = 0;
  let promoPercentage = 0;
  let isValidPromoCode = false;
  let couponMinSubtotalError = '';

  if (couponCode.trim()) {
    const codeUpper = couponCode.trim().toUpperCase();
    const currentSubtotal = selectedOrder ? (selectedOrder.subtotal || selectedOrder.totalAmount) : 0;

    // 1. Check Store Master Coupon Catalog first
    const matchStoreCoupon = storeCoupons?.find(c => c.code.toUpperCase() === codeUpper && c.isActive);
    if (matchStoreCoupon) {
      if (!matchStoreCoupon.minSubtotal || currentSubtotal >= matchStoreCoupon.minSubtotal) {
        isValidPromoCode = true;
        if (matchStoreCoupon.discountType === 'fixed') {
          promoFixedDiscount = matchStoreCoupon.discountValue;
        } else {
          promoPercentage = matchStoreCoupon.discountValue;
        }
      } else {
        isValidPromoCode = false;
        couponMinSubtotalError = `Requires min spend of $${matchStoreCoupon.minSubtotal.toFixed(2)}`;
      }
    } else {
      // 2. Check Member Customer Vouchers
      const matchCoupon = activeCustomerCoupons.find(c => c.code.toUpperCase() === codeUpper);
      if (matchCoupon) {
        isValidPromoCode = true;
        if (matchCoupon.discountType === 'fixed') {
          promoFixedDiscount = matchCoupon.discountValue;
        } else {
          promoPercentage = matchCoupon.discountValue;
        }
      } else {
        // Fallback for demo standard legacy codes
        if (codeUpper === 'WELCOME10' || codeUpper === 'VIP10') {
          promoPercentage = 10;
          isValidPromoCode = true;
        } else if (codeUpper === 'SAVE5' || codeUpper === 'DISCOUNT5') {
          promoFixedDiscount = 5;
          isValidPromoCode = true;
        } else if (codeUpper === 'VIP20') {
          promoPercentage = 20;
          isValidPromoCode = true;
        } else {
          isValidPromoCode = false;
          promoFixedDiscount = 0;
          promoPercentage = 0;
        }
      }
    }
  }

  // Evaluate automatic combo / order promos
  const autoPromoResult =
    selectedOrder && promoRules
      ? evaluateOrderPromos(
          selectedOrder.items || [],
          selectedOrder.subtotal || selectedOrder.totalAmount,
          promoRules
        )
      : { appliedPromos: [], totalPromoDiscount: 0 };

  // Combine discounts: 1. Points to money, 2. Coupon fixed, 3. Percentage off, 4. Auto Promos
  const baseOrderTotal = selectedOrder ? selectedOrder.totalAmount : 0;
  const totalPercentage = checkedCouponPercentage + promoPercentage;
  const percentageDiscountAmount = (baseOrderTotal * totalPercentage) / 100;
  const couponFixedDiscountAmount = checkedCouponFixedDiscount + promoFixedDiscount;

  const totalDiscount = Math.min(
    baseOrderTotal,
    pointsDiscountAmount + couponFixedDiscountAmount + percentageDiscountAmount + autoPromoResult.totalPromoDiscount
  );

  const finalTotalAmount = Math.max(0, baseOrderTotal - totalDiscount);
  const changeGiven = Math.max(0, cashReceived - finalTotalAmount);

  const handleSelectOrder = (ord: Order) => {
    setSelectedOrder(ord);
    setCashReceived(ord.totalAmount);
    setKeypadString(ord.totalAmount.toString());
    setIsSuccess(false);
    setErrorMsg('');
    setPaidSplitsCount(0);
    setRedeemPoints(0);
    setSelectedCouponIds([]);
  };

  const handleSaveCustomerInfo = () => {
    if (!selectedOrder) return;

    const nameToSave = custNameInput.trim() || 'Guest';
    const phoneToSave = custPhoneInput.trim();
    const updatedOrder: Order = {
      ...selectedOrder,
      customerName: nameToSave,
      customerPhone: phoneToSave,
      customerId: selectedCustomerId || undefined,
      updatedAt: new Date().toISOString(),
    };

    setSelectedOrder(updatedOrder);
    if (onUpdateOrderDetails) {
      onUpdateOrderDetails(updatedOrder);
    }
    setIsEditingCustomer(false);
    audioService.playClick();
  };

  const handleKeypadPress = (val: string) => {
    audioService.playClick();
    if (val === 'C') {
      setKeypadString('');
      setCashReceived(0);
      return;
    }
    if (val === 'BACK') {
      const nextStr = keypadString.slice(0, -1);
      setKeypadString(nextStr);
      setCashReceived(nextStr ? parseFloat(nextStr) : 0);
      return;
    }
    if (val === 'EXACT' && selectedOrder) {
      const amtStr = finalTotalAmount.toFixed(2);
      setKeypadString(amtStr);
      setCashReceived(finalTotalAmount);
      return;
    }
    if (val.startsWith('$')) {
      const presetVal = parseFloat(val.replace('$', ''));
      setKeypadString(presetVal.toString());
      setCashReceived(presetVal);
      return;
    }

    // Appending digit (e.g., 1 -> 0 -> 0 produces 100)
    let nextStr = keypadString + val;
    // Prevent multiple decimals
    if (val === '.' && keypadString.includes('.')) return;
    setKeypadString(nextStr);
    const parsed = parseFloat(nextStr);
    setCashReceived(isNaN(parsed) ? 0 : parsed);
  };

  const handleProcessPayment = () => {
    setErrorMsg('');
    if (!selectedOrder) return;

    if (selectedOrder.paymentStatus === 'Paid' || isSuccess) {
      setErrorMsg('This order has already been paid and finalized.');
      return;
    }

    if (paymentMethod === 'Cash' && cashReceived < finalTotalAmount) {
      setErrorMsg(
        `Insufficient cash tendered. Total payable is $${finalTotalAmount.toFixed(
          2
        )}, but tendered amount is $${cashReceived.toFixed(2)}.`
      );
      return;
    }

    if (paymentMethod === 'Split') {
      const nextPaidCount = paidSplitsCount + 1;
      if (nextPaidCount < splitCount) {
        setPaidSplitsCount(nextPaidCount);
        audioService.playClick();
        return;
      }
    }

    const nameToSave = custNameInput.trim() || selectedOrder.customerName || 'Guest';
    const phoneToSave = custPhoneInput.trim() || selectedOrder.customerPhone || '';
    const actualPaymentMethod: Order['paymentMethod'] =
      paymentMethod === 'Split' ? 'Cash' : paymentMethod;

    const couponCodeStr = [
      ...checkedCoupons.map(c => c.code),
      couponCode.trim() ? couponCode.trim().toUpperCase() : '',
    ]
      .filter(Boolean)
      .join(', ');

    const couponTotalDiscount = couponFixedDiscountAmount + percentageDiscountAmount;

    const updatedOrder: Order = {
      ...selectedOrder,
      customerName: nameToSave,
      customerPhone: phoneToSave,
      customerId: selectedCustomerId || selectedOrder.customerId || (matchedCustomer ? matchedCustomer.id : undefined),
      subtotal: selectedOrder.subtotal || selectedOrder.totalAmount,
      discountAmount: totalDiscount,
      pointsRedeemed: effectiveRedeemPoints,
      pointsDiscountAmount: pointsDiscountAmount,
      couponCode: couponCodeStr || undefined,
      couponDiscountAmount: couponTotalDiscount,
      percentageDiscountAmount: percentageDiscountAmount,
      promoDiscountAmount: autoPromoResult.totalPromoDiscount,
      appliedPromos: autoPromoResult.appliedPromos,
      customerPointsBalance: Math.max(0, availablePoints - effectiveRedeemPoints),
      totalAmount: finalTotalAmount,
      paymentStatus: 'Paid',
      paymentMethod: actualPaymentMethod,
      status: 'Completed',
      updatedAt: new Date().toISOString(),
    };

    onCompletePayment(selectedOrder.id, {
      method: actualPaymentMethod,
      cashReceived: actualPaymentMethod === 'Cash' ? cashReceived : undefined,
      changeGiven: actualPaymentMethod === 'Cash' ? changeGiven : undefined,
      pointsRedeemed: effectiveRedeemPoints,
      pointsDiscountAmount: pointsDiscountAmount,
      couponCode: couponCodeStr || undefined,
      couponDiscountAmount: couponTotalDiscount,
      percentageDiscountAmount: percentageDiscountAmount,
      promoDiscountAmount: autoPromoResult.totalPromoDiscount,
      appliedPromos: autoPromoResult.appliedPromos,
      discountPercentage: totalPercentage,
      usedCouponIds: checkedCoupons.map(c => c.id),
      totalDiscount: totalDiscount,
      subtotal: selectedOrder.subtotal || selectedOrder.totalAmount,
      customerName: nameToSave,
      customerPhone: phoneToSave,
      customerId: selectedCustomerId || selectedOrder.customerId || (matchedCustomer ? matchedCustomer.id : undefined),
      finalTotalAmount: finalTotalAmount,
      customerPointsBalance: Math.max(0, availablePoints - effectiveRedeemPoints),
    });

    if (onUpdateOrderDetails) {
      onUpdateOrderDetails(updatedOrder);
    }

    setSelectedOrder(updatedOrder);
    audioService.playPaymentSuccess();
    setIsSuccess(true);
    setShowReceiptModal(true);
  };

  const handlePrint = () => {
    if (selectedOrder) {
      const couponCodeStr = [
        ...checkedCoupons.map(c => c.code),
        couponCode.trim() ? couponCode.trim().toUpperCase() : '',
      ]
        .filter(Boolean)
        .join(', ');

      const couponTotalDiscount = couponFixedDiscountAmount + percentageDiscountAmount;

      const orderToPrint: Order = {
        ...selectedOrder,
        subtotal: selectedOrder.subtotal || baseOrderTotal,
        discountAmount: totalDiscount > 0 ? totalDiscount : selectedOrder.discountAmount,
        pointsRedeemed: effectiveRedeemPoints > 0 ? effectiveRedeemPoints : selectedOrder.pointsRedeemed,
        pointsDiscountAmount: pointsDiscountAmount > 0 ? pointsDiscountAmount : selectedOrder.pointsDiscountAmount,
        couponCode: couponCodeStr || selectedOrder.couponCode,
        couponDiscountAmount: couponTotalDiscount > 0 ? couponTotalDiscount : selectedOrder.couponDiscountAmount,
        percentageDiscountAmount: percentageDiscountAmount > 0 ? percentageDiscountAmount : selectedOrder.percentageDiscountAmount,
        promoDiscountAmount: autoPromoResult.totalPromoDiscount > 0 ? autoPromoResult.totalPromoDiscount : selectedOrder.promoDiscountAmount,
        appliedPromos: autoPromoResult.appliedPromos.length > 0 ? autoPromoResult.appliedPromos : selectedOrder.appliedPromos,
        totalAmount: finalTotalAmount < baseOrderTotal ? finalTotalAmount : selectedOrder.totalAmount,
        paymentStatus: isSuccess ? 'Paid' : (selectedOrder.paymentStatus || 'Unpaid'),
        paymentMethod: isSuccess ? (paymentMethod || selectedOrder.paymentMethod || 'Cash') : (selectedOrder.paymentMethod || 'Unpaid'),
        status: isSuccess ? 'Completed' : selectedOrder.status,
      };
      receiptService.printReceipt(orderToPrint, settings);
    }
  };

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
          <CreditCard className="mr-2 h-6 w-6 text-[#FF8A00]" /> POS Checkout Terminal
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Process payments, split bills, issue thermal receipts, and redeem customer loyalty
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Unpaid Orders Queue (4 cols) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 lg:col-span-4">
          <h3 className="font-extrabold text-gray-900 text-xs dark:text-white mb-3">
            Unpaid Orders Queue ({unpaidOrders.length})
          </h3>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {unpaidOrders.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">All active orders are settled!</p>
            ) : (
              unpaidOrders.map(ord => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-[#FF8A00] bg-orange-50/60 shadow-xs dark:bg-orange-950/30'
                        : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-gray-900 dark:text-white">
                        {ord.orderNumber}
                      </span>
                      <span className="font-black text-xs text-[#FF8A00]">
                        ${ord.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {ord.tableName ? `Table ${ord.tableName}` : ord.type} • {ord.items.length} items
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Terminal (8 cols) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900 lg:col-span-8 overflow-y-auto overscroll-contain touch-pan-y">
          {selectedOrder ? (
            <div className="space-y-5">
              {/* Top Order Overview */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Checkout: {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedOrder.tableName ? `Table ${selectedOrder.tableName}` : selectedOrder.type} • {selectedOrder.items.length} item{selectedOrder.items.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Amount Due</span>
                  <p className="text-2xl font-black text-[#FF8A00]">
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Multiple Open Orders Banner for same Table/Customer */}
              {(() => {
                const matchingOther = unpaidOrders.filter(
                  o =>
                    o.id !== selectedOrder.id &&
                    ((selectedOrder.tableId && o.tableId === selectedOrder.tableId) ||
                      (selectedOrder.tableName &&
                        o.tableName &&
                        o.tableName.trim().toLowerCase() === selectedOrder.tableName.trim().toLowerCase()) ||
                      (selectedOrder.customerId && o.customerId === selectedOrder.customerId) ||
                      (selectedOrder.customerPhone &&
                        selectedOrder.customerPhone.trim() !== '' &&
                        o.customerPhone &&
                        o.customerPhone.trim() === selectedOrder.customerPhone.trim()))
                );

                if (matchingOther.length === 0 || !onMergeOrders) return null;

                const combinedTotal =
                  selectedOrder.totalAmount + matchingOther.reduce((sum, o) => sum + o.totalAmount, 0);

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 dark:bg-amber-950/40 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="h-4 w-4 text-[#FF8A00] shrink-0" />
                      <div>
                        <p className="font-extrabold text-xs text-amber-950 dark:text-amber-100">
                          {selectedOrder.tableName ? `Table ${selectedOrder.tableName}` : 'Customer'} has {matchingOther.length + 1} separate open orders!
                        </p>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300">
                          Combine them into a single bill for <strong>${combinedTotal.toFixed(2)}</strong> so the customer pays once.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = [selectedOrder.id, ...matchingOther.map(o => o.id)];
                        onMergeOrders(allIds);
                      }}
                      className="shrink-0 rounded-lg bg-[#FF8A00] px-3.5 py-2 font-black text-xs text-white shadow-xs hover:bg-[#e07900] transition-colors"
                    >
                      Combine into 1 Bill
                    </button>
                  </div>
                );
              })()}

              {/* Customer Information Section */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-[#FF8A00]" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Customer Information
                    </span>
                    {(selectedOrder.customerId || selectedCustomerId) && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        <Sparkles className="mr-1 h-3 w-3" /> Member Linked
                      </span>
                    )}
                  </div>
                  {!isEditingCustomer ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingCustomer(true)}
                      className="flex items-center space-x-1 text-xs font-bold text-[#FF8A00] hover:text-[#e07900] hover:underline"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit Customer Info</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingCustomer(false)}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {!isEditingCustomer ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                        {selectedOrder.customerName || custNameInput || 'Guest Customer'}
                      </span>
                      {(selectedOrder.customerPhone || custPhoneInput) && (
                        <p className="text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                          <Phone className="mr-1 h-3 w-3 text-gray-400" />
                          {selectedOrder.customerPhone || custPhoneInput}
                        </p>
                      )}
                    </div>

                    {/* Loyalty Member Tag */}
                    {(() => {
                      const cid = selectedOrder.customerId || selectedCustomerId;
                      const cname = selectedOrder.customerName || custNameInput;
                      const matchedCust = customers.find(
                        c => c.id === cid || (cname && c.name.toLowerCase() === cname.toLowerCase())
                      );
                      if (matchedCust) {
                        return (
                          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 text-right">
                            <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase">
                              {matchedCust.tier} Tier
                            </span>
                            <p className="text-xs font-black text-[#FF8A00]">
                              {matchedCust.loyaltyPoints} Points
                            </p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {/* Select Existing Customer Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        Select Existing Member / Customer
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={e => {
                          const val = e.target.value;
                          setSelectedCustomerId(val);
                          const found = customers.find(c => c.id === val);
                          if (found) {
                            setCustNameInput(found.name);
                            setCustPhoneInput(found.phone);
                          }
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:outline-hidden"
                      >
                        <option value="">-- Custom / Guest Customer --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone || 'No Phone'}) • {c.loyaltyPoints} pts
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={custNameInput}
                          onChange={e => setCustNameInput(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={custPhoneInput}
                          onChange={e => setCustPhoneInput(e.target.value)}
                          placeholder="e.g. +1 555-0192"
                          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-bold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomer(false)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomerInfo}
                        className="flex items-center space-x-1 rounded-lg bg-[#FF8A00] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#e07900]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Save Customer Details</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Discounts & Loyalty Rewards Section */}
              <div className="space-y-3">
                {/* 1. Points Redemption: Left Box (Point Controls) & Right Box (Monetary Discount) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl border border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30">
                  {/* LEFT BOX: Points Input & Controls */}
                  <div className="rounded-xl border border-amber-200 bg-white p-3 dark:border-amber-900/60 dark:bg-gray-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Redeem Loyalty Points
                      </label>
                      <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                        {availablePoints} pts Available
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        max={availablePoints}
                        value={redeemPoints || ''}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setRedeemPoints(Math.max(0, Math.min(val, availablePoints)));
                        }}
                        placeholder="Enter pts"
                        className="flex-1 rounded-lg border border-gray-300 bg-white p-2 text-xs font-black text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setRedeemPoints(availablePoints)}
                        disabled={availablePoints <= 0}
                        className="rounded-lg bg-amber-500 px-2.5 py-2 text-[11px] font-black text-white hover:bg-amber-600 transition-colors shrink-0 disabled:opacity-50"
                      >
                        Max Pts
                      </button>
                      <button
                        type="button"
                        onClick={() => setRedeemPoints(0)}
                        className="rounded-lg bg-gray-200 dark:bg-gray-700 px-2 py-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shrink-0"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      <span>Max limit: {availablePoints} pts</span>
                      <span>10 Pts = $1.00 Off ($0.10/pt)</span>
                    </div>
                  </div>

                  {/* RIGHT BOX: Money Discount Converted From Points */}
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 dark:border-emerald-900/80 dark:bg-emerald-950/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                        Point Cash Value
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 px-2 py-0.5">
                        Money Discount
                      </span>
                    </div>

                    <div className="my-1.5">
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300">
                        -${pointsDiscountAmount.toFixed(2)}
                      </div>
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {effectiveRedeemPoints > 0
                          ? `Discount for ${effectiveRedeemPoints} redeemed pts`
                          : 'No points applied for cash discount'}
                      </p>
                    </div>

                    <p className="text-[10px] font-medium text-emerald-700/80 dark:text-emerald-400/80">
                      Deducted from customer balance upon checkout.
                    </p>
                  </div>
                </div>

                {/* 2. Extra Line for Promo / Coupon Code & Active Coupons List */}
                <div className="rounded-2xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-900 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center">
                      <Gift className="mr-1.5 h-4 w-4 text-[#FF8A00]" /> Promo / Coupon Code & Member Vouchers
                    </span>
                    {(couponFixedDiscountAmount > 0 || percentageDiscountAmount > 0) && (
                      <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                        -${(couponFixedDiscountAmount + percentageDiscountAmount).toFixed(2)} Coupon Off
                      </span>
                    )}
                  </div>

                  {/* Extra Line 1: Promo Code Input */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1">
                      Promo / Coupon Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="e.g. WELCOME10 (10% off), SAVE5 ($5 off), VIP20"
                        className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs font-bold uppercase text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:outline-hidden pr-28"
                      />
                      {couponCode.trim() && (
                        <span className="absolute right-2 top-2 text-[10px] font-black">
                          {isValidPromoCode ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="mr-0.5 h-3 w-3" /> Valid Code
                            </span>
                          ) : (
                            <span className="text-rose-500 flex items-center bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                              <X className="mr-0.5 h-3 w-3" /> {couponMinSubtotalError || 'Invalid Code ($0 off)'}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Quick-Select Store Coupons */}
                    {storeCoupons && storeCoupons.filter(c => c.isActive).length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold text-gray-400">Quick Select:</span>
                        {storeCoupons
                          .filter(c => c.isActive)
                          .map(cpn => {
                            const isSelected = couponCode.trim().toUpperCase() === cpn.code;
                            return (
                              <button
                                key={cpn.id}
                                type="button"
                                onClick={() => setCouponCode(cpn.code)}
                                className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-black transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-[#FF8A00] text-white border-[#FF8A00] shadow-xs'
                                    : 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60'
                                }`}
                              >
                                🏷️ {cpn.code} ({cpn.discountType === 'fixed' ? `$${cpn.discountValue} OFF` : `${cpn.discountValue}% OFF`})
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Extra Line 2: Active Customer Coupons Checkboxes List */}
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>Active Member Coupons ({activeCustomerCoupons.length})</span>
                      {matchedCustomer && activeCustomerCoupons.length > 0 && (
                        <span className="text-[10px] text-gray-400 font-semibold">
                          Check boxes to apply coupon
                        </span>
                      )}
                    </label>

                    {!matchedCustomer ? (
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-2.5 text-center text-[11px] font-semibold text-gray-500">
                        Select a member customer above to display their active coupons.
                      </div>
                    ) : activeCustomerCoupons.length === 0 ? (
                      <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-2.5 text-center text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        No active coupons available for {matchedCustomer.name}. Loyalty points can be redeemed for new vouchers in Customer Directory!
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {activeCustomerCoupons.map(cp => {
                          const isChecked = selectedCouponIds.includes(cp.id);
                          return (
                            <label
                              key={cp.id}
                              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all cursor-pointer ${
                                isChecked
                                  ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/60 font-extrabold text-emerald-950 dark:text-emerald-100 shadow-2xs'
                                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedCouponIds(prev => [...prev, cp.id]);
                                    } else {
                                      setSelectedCouponIds(prev => prev.filter(id => id !== cp.id));
                                    }
                                  }}
                                  className="h-4 w-4 rounded-md border-gray-300 text-[#FF8A00] focus:ring-[#FF8A00]"
                                />
                                <div>
                                  <span className="font-extrabold">{cp.title}</span>
                                  <span className="ml-2 font-mono text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded font-black">
                                    {cp.code}
                                  </span>
                                </div>
                              </div>

                              <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs shrink-0">
                                {cp.discountType === 'fixed' ? `-$${cp.discountValue.toFixed(2)}` : `-${cp.discountValue}% Off`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Combined Discount Summary Banner */}
                {totalDiscount > 0 && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 dark:bg-emerald-950/40 dark:border-emerald-900/60 space-y-1 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Total Combined Discount:</span>
                      </div>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-300">
                        -${totalDiscount.toFixed(2)}
                      </span>
                    </div>

                    {/* Auto Promo Breakdown list */}
                    {autoPromoResult.appliedPromos.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between pl-5 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                        <span>🎁 {p.title} ({p.reason})</span>
                        <span className="font-extrabold">-${p.discountAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message Banner */}
              {errorMsg && (
                <div className="flex items-center space-x-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Payment Methods Grid */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                  {[
                    { id: 'Cash', icon: DollarSign, label: 'Cash' },
                    { id: 'Credit Card', icon: CreditCard, label: 'Credit Card' },
                    { id: 'Debit Card', icon: CreditCard, label: 'Debit Card' },
                    { id: 'QR Code', icon: QrCode, label: 'QR Code' },
                    { id: 'UPI', icon: Smartphone, label: 'UPI' },
                    { id: 'Digital Wallet', icon: Smartphone, label: 'Wallet' },
                    { id: 'Split', icon: Users, label: 'Split Bill' },
                  ].map(m => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as any);
                          setErrorMsg('');
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                          isSelected
                            ? 'border-[#FF8A00] bg-orange-50 text-[#FF8A00] ring-2 ring-[#FF8A00]/20 font-bold dark:bg-orange-950/40'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <span className="text-[10px] font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Split Bill Interface */}
              {paymentMethod === 'Split' && (
                <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-200/80 dark:bg-indigo-950/30 dark:border-indigo-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center">
                      <Users className="mr-1.5 h-4 w-4 text-indigo-600" /> Split Bill Breakdown
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">People:</span>
                      <button
                        type="button"
                        onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                        className="h-6 w-6 rounded bg-white shadow-2xs font-bold text-gray-800 dark:bg-gray-800 dark:text-white"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-sm text-indigo-700 dark:text-indigo-300 px-1">
                        {splitCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSplitCount(splitCount + 1)}
                        className="h-6 w-6 rounded bg-white shadow-2xs font-bold text-gray-800 dark:bg-gray-800 dark:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-900">
                      <span className="block text-[10px] font-bold text-gray-400">Total Bill Payable</span>
                      <span className="text-base font-black text-gray-900 dark:text-white">
                        ${finalTotalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="rounded-xl border border-indigo-200 bg-indigo-100/50 p-2.5 dark:border-indigo-800 dark:bg-indigo-900/40">
                      <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                        Per Person Share ({splitCount} people)
                      </span>
                      <span className="text-base font-black text-indigo-800 dark:text-indigo-200">
                        ${(finalTotalAmount / splitCount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-between pt-1">
                    <span>Splits Paid So Far:</span>
                    <span className="font-extrabold text-xs">
                      {paidSplitsCount} / {splitCount} splits settled
                    </span>
                  </div>
                </div>
              )}

              {/* Cash Calculator Pane */}
              {paymentMethod === 'Cash' && (
                <div className="rounded-2xl bg-orange-50/70 p-4 border border-orange-200/80 dark:bg-orange-950/30 dark:border-orange-900/50 space-y-4">
                  {/* Mode Toggle Header */}
                  <div className="flex items-center justify-between border-b border-orange-200/60 pb-2 dark:border-orange-900/60">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Cash Tendered Entry Mode
                    </span>
                    <div className="flex rounded-lg bg-white p-1 shadow-2xs dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => setCashInputMode('keypad')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                          cashInputMode === 'keypad'
                            ? 'bg-[#FF8A00] text-white shadow-2xs'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        📱 iPad Touch Keypad
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashInputMode('typed')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                          cashInputMode === 'typed'
                            ? 'bg-[#FF8A00] text-white shadow-2xs'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        💻 Computer Keyboard
                      </button>
                    </div>
                  </div>

                  {/* Top Display Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 shadow-2xs">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Cash Tendered Received
                      </label>
                      <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                        ${cashReceived.toFixed(2)}
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/40 shadow-2xs">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Change to Give Customer
                      </label>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-0.5">
                        ${changeGiven.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* TOUCH KEYPAD (iPad Mode) */}
                  {cashInputMode === 'keypad' ? (
                    <div className="space-y-2">
                      {/* Bill Quick Presets */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {['$10', '$20', '$50', '$100', 'EXACT'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleKeypadPress(preset)}
                            className={`rounded-xl border p-2 text-xs font-black transition-all ${
                              preset === 'EXACT'
                                ? 'border-amber-400 bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                                : 'border-gray-200 bg-white text-gray-800 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }`}
                          >
                            {preset === 'EXACT' ? 'Exact $' : preset}
                          </button>
                        ))}
                      </div>

                      {/* Touch Numpad Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'BACK'].map(btn => (
                          <button
                            key={btn}
                            type="button"
                            onClick={() => handleKeypadPress(btn)}
                            className={`flex h-12 items-center justify-center rounded-xl border text-lg font-black shadow-2xs transition-all active:scale-95 ${
                              btn === 'C'
                                ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300'
                                : btn === 'BACK'
                                ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }`}
                          >
                            {btn === 'BACK' ? '⌫' : btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* TYPED (Computer Mode) */
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Type Exact Cash Received ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={cashReceived}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setCashReceived(val);
                          setKeypadString(e.target.value);
                        }}
                        placeholder="100.00"
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-lg font-black text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-[#FF8A00] focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* QR Code Canvas Simulator */}
              {(paymentMethod === 'QR Code' || paymentMethod === 'UPI') && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-800 dark:bg-gray-800/40">
                  <QrCode className="mx-auto h-24 w-24 text-gray-800 dark:text-white mb-2" />
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Scan QR to Pay ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">UPI / Merchant ID: pos@grandbistro</p>
                </div>
              )}

              {/* Complete Payment Button - Sticky Bottom */}
              <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs pt-3 pb-1 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-3 shadow-xs mt-4">
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={selectedOrder.paymentStatus === 'Paid' || isSuccess}
                  className={`flex-1 rounded-xl py-3.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                    selectedOrder.paymentStatus === 'Paid' || isSuccess
                      ? 'bg-emerald-600 cursor-not-allowed opacity-90'
                      : 'bg-[#FF8A00] hover:bg-[#e07900] active:scale-98'
                  }`}
                >
                  {selectedOrder.paymentStatus === 'Paid' || isSuccess
                    ? '✓ Payment Completed'
                    : paymentMethod === 'Split'
                    ? `Collect Split ${paidSplitsCount + 1}/${splitCount} ($${(finalTotalAmount / splitCount).toFixed(2)})`
                    : `Complete $${finalTotalAmount.toFixed(2)} Payment`}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 rounded-xl border border-gray-200 px-4 py-3.5 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="text-xs font-semibold">Select an unpaid order from the queue to process payment</p>
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT SUCCESS MODAL */}
      {showReceiptModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
              <h3 className="text-lg font-black text-gray-900 dark:text-white">Payment Successful!</h3>
              <p className="text-xs text-gray-500">Order {selectedOrder.orderNumber} has been settled</p>
            </div>

            <div className="my-4 rounded-xl bg-gray-50 p-3 text-xs space-y-2 dark:bg-gray-800">
              <div className="flex justify-between font-bold">
                <span>Total Paid:</span>
                <span className="text-[#FF8A00]">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Payment Method:</span>
                <span>{paymentMethod}</span>
              </div>

              {/* Loyalty Points Earned Badge */}
              {selectedOrder.customerName && selectedOrder.customerName.toLowerCase() !== 'guest' && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-700 text-amber-700 dark:text-amber-300 font-extrabold text-[11px]">
                  <span className="flex items-center">
                    <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-500" /> Points Earned:
                  </span>
                  <span>+{Math.max(1, Math.floor(selectedOrder.totalAmount))} pts</span>
                </div>
              )}

              {/* Table Cleaning Status Notice */}
              {(selectedOrder.tableId || selectedOrder.tableName) && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                  <span>Table Status:</span>
                  <span className="inline-flex items-center rounded-md bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-black text-indigo-700 dark:text-indigo-300">
                    🧹 Marked for Cleaning
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#FF8A00] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
              >
                <Printer className="h-4 w-4" />
                <span>Print Thermal Receipt</span>
              </button>

              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
