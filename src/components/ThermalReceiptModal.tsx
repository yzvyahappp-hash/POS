import React, { useState } from 'react';
import { Printer, Copy, Check, X, Receipt as ReceiptIcon, ExternalLink } from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/mockData';
import {
  receiptService,
  HANDWRITING_FONT,
  translateText,
  translateOrderType,
  translatePaymentMethod,
  translatePaymentStatus,
} from '../services/receiptService';
import { copyToClipboard } from '../utils/clipboard';

interface ThermalReceiptModalProps {
  order: Order | null;
  settings: RestaurantSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const currentSettings: RestaurantSettings = settings || INITIAL_SETTINGS;

  React.useEffect(() => {
    if (isOpen && order) {
      const timer = setTimeout(() => {
        receiptService.executeIframePrint(order, currentSettings, HANDWRITING_FONT);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, order?.id, (order as any)?._printTs]);

  if (!isOpen || !order) return null;

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    : new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

  const formattedOrderType = translateOrderType(order.type);
  const formattedCustomer = order.customerName || '散客 / 現場顧客';
  const formattedServer = order.createdBy || '門市服務員';
  const formattedPayMethod = translatePaymentMethod(order.paymentMethod);
  const formattedPayStatus = translatePaymentStatus(order.paymentStatus);

  // Detailed discount breakdown and combined total discount calculation
  const subtotal = order.subtotal || order.totalAmount || 0;
  const promoDiscount =
    order.promoDiscountAmount ||
    (order.appliedPromos && order.appliedPromos.length > 0
      ? order.appliedPromos.reduce((s, p) => s + (p.discountAmount || 0), 0)
      : 0);

  const pointsDiscount = order.pointsDiscountAmount || 0;

  const couponDiscount =
    order.couponDiscountAmount ||
    (order.couponCode && (order.discountAmount || 0) > 0 && !promoDiscount && !pointsDiscount
      ? order.discountAmount
      : 0);

  const percentageDiscount =
    order.percentageDiscountAmount ||
    ((order.discountPercentage || 0) > 0
      ? (subtotal * order.discountPercentage) / 100
      : 0);

  const manualDiscount =
    (order.discountAmount || 0) > 0 &&
    !(promoDiscount || pointsDiscount || couponDiscount || percentageDiscount)
      ? order.discountAmount || 0
      : 0;

  const computedSum = promoDiscount + pointsDiscount + couponDiscount + percentageDiscount + manualDiscount;
  const totalCombinedDiscount = Math.max(order.discountAmount || 0, computedSum);

  const handleCopyText = () => {
    let text = `${currentSettings.restaurantName.toUpperCase()}\n`;
    text += `${currentSettings.address}\n電話: ${currentSettings.phone}\n`;
    text += `----------------------------------------\n`;
    text += `訂單編號: ${order.orderNumber} (${formattedOrderType})\n`;
    text += `桌號: ${order.tableName || '未指定'}\n`;
    text += `顧客: ${formattedCustomer}\n`;
    text += `日期時間: ${formattedDate}\n`;
    text += `服務員: ${formattedServer}\n`;
    text += `----------------------------------------\n`;
    (order.items || []).forEach(item => {
      const name = translateText(item.name || '');
      text += `${item.quantity || 1}x ${name.padEnd(20)} $${(((item.price || 0) * (item.quantity || 1))).toFixed(2)}\n`;
      if (item.modifiers && item.modifiers.length > 0) {
        text += `   • ${item.modifiers.map(m => translateText(m)).join(', ')}\n`;
      }
      if (item.addOns && item.addOns.length > 0) {
        text += `   + ${item.addOns.map(a => translateText(a.name || '')).join(', ')}\n`;
      }
    });
    text += `----------------------------------------\n`;
    text += `小計金額:              $${subtotal.toFixed(2)}\n`;
    if (order.appliedPromos && order.appliedPromos.length > 0) {
      order.appliedPromos.forEach(p => {
        text += `🎁 優惠 (${p.title}):       -$${(p.discountAmount || 0).toFixed(2)}\n`;
      });
    } else if (promoDiscount > 0) {
      text += `🎁 組合/滿額特惠:      -$${promoDiscount.toFixed(2)}\n`;
    }
    if (pointsDiscount > 0) {
      text += `🌟 會員點數折抵 (${order.pointsRedeemed || 0}pts): -$${pointsDiscount.toFixed(2)}\n`;
    }
    if (couponDiscount > 0 || (order.couponCode && order.couponCode.trim() !== '')) {
      const cVal = couponDiscount || (order.discountAmount && !promoDiscount && !pointsDiscount ? order.discountAmount : 0);
      text += `🏷️ 優惠券折抵 (${order.couponCode || '折價券'}): -$${cVal.toFixed(2)}\n`;
    }
    if (percentageDiscount > 0 || manualDiscount > 0 || (order.discountPercentage || 0) > 0 || (order.discountAmount && !promoDiscount && !pointsDiscount && !couponDiscount ? order.discountAmount > 0 : false)) {
      const pVal = percentageDiscount || manualDiscount || order.discountAmount || 0;
      const label = order.discountPercentage && order.discountPercentage > 0 ? `整單折扣 (${order.discountPercentage}%)` : '折扣優惠';
      text += `✂️ ${label}:       -$${pVal.toFixed(2)}\n`;
    }
    if (totalCombinedDiscount > 0) {
      text += `----------------------------------------\n`;
      text += `合計總折扣金額:        -$${totalCombinedDiscount.toFixed(2)}\n`;
    }
    text += `營業稅金 (${order.taxRate || 0}%):             $${(order.taxAmount || 0).toFixed(2)}\n`;
    text += `服務費 (${order.serviceChargeRate || 0}%):         $${(order.serviceChargeAmount || 0).toFixed(2)}\n`;
    text += `========================================\n`;
    text += `總計金額:              $${(order.totalAmount || 0).toFixed(2)}\n`;
    text += `付款方式: ${formattedPayMethod}\n`;
    text += `付款狀態: ${formattedPayStatus}\n`;
    text += `========================================\n`;
    text += `${currentSettings.receiptFooter || '歡迎再次光臨！'}\n`;

    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerPrint = () => {
    receiptService.executeIframePrint(order, currentSettings, HANDWRITING_FONT);
  };

  const handleOpenNewWindow = () => {
    receiptService.openReceiptNewWindow(order, currentSettings, HANDWRITING_FONT);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px] animate-in fade-in thermal-receipt-modal-overlay">
      {/* Container */}
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-800 thermal-receipt-modal-card">
        {/* Header Bar (No-Print) */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 no-print">
          <div className="flex items-center space-x-2">
            <ReceiptIcon className="h-5 w-5 text-[#FF8A00]" />
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
              熱感應明細單 #{order.orderNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-start min-h-[420px] thermal-receipt-modal-body">
          {/* Printable 80mm Thermal Paper Card */}
          <div
            id="printable-thermal-receipt"
            className="w-full max-w-[340px] h-fit shrink-0 rounded-xl bg-white p-6 shadow-md text-black text-xs leading-relaxed border border-gray-200 select-text flex flex-col"
            style={{
              fontFamily: HANDWRITING_FONT,
              backgroundColor: '#ffffff',
              color: '#000000',
            }}
          >
            {/* Header */}
            <div className="text-center pb-2">
              {currentSettings.logoUrl && (
                <img
                  src={currentSettings.logoUrl}
                  alt="Logo"
                  className="mx-auto max-h-12 mb-2"
                />
              )}
              <h2 className="text-base font-extrabold tracking-wide uppercase">
                {currentSettings.restaurantName}
              </h2>
              <p className="text-[11px] text-gray-700">{currentSettings.address}</p>
              <p className="text-[11px] text-gray-700">電話: {currentSettings.phone}</p>
              {currentSettings.receiptHeader && (
                <p className="mt-1 text-[10px] text-gray-600 italic">
                  {currentSettings.receiptHeader}
                </p>
              )}
            </div>

            <div className="my-2 border-b border-dashed border-gray-400"></div>

            {/* Meta Info */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="font-bold">訂單編號:</span>
                <span>{order.orderNumber} ({formattedOrderType})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">桌號:</span>
                <span>{order.tableName || '未指定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">顧客:</span>
                <span>{formattedCustomer}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">日期時間:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">服務員:</span>
                <span>{formattedServer}</span>
              </div>
            </div>

            <div className="my-2 border-b border-dashed border-gray-400"></div>

            {/* Line Items */}
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="pb-1 text-left">餐點品項</th>
                  <th className="pb-1 text-right">金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => {
                  const name = translateText(item.name);
                  const mods = (item.modifiers || []).map(m => translateText(m));
                  const addOns = (item.addOns || []).map(a => ({ ...a, name: translateText(a.name) }));

                  return (
                    <tr key={idx} className="align-top">
                      <td className="py-1 pr-1">
                        <span className="font-bold">{item.quantity}x</span> {name}
                        {mods && mods.length > 0 && (
                          <div className="text-[10px] text-gray-600 pl-3">
                            • {mods.join(', ')}
                          </div>
                        )}
                        {addOns && addOns.length > 0 && (
                          <div className="text-[10px] text-gray-600 pl-3">
                            + {addOns.map(a => a.name).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-1 text-right font-bold">
                        ${(((item.price || 0) * (item.quantity || 1))).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="my-2 border-b border-dashed border-gray-400"></div>

            {/* Financial Calculations */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>小計金額:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {totalCombinedDiscount > 0 ? (
                <>
                  {order.appliedPromos && order.appliedPromos.length > 0 ? (
                    order.appliedPromos.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-emerald-800">
                        <span>🎁 優惠: {p.title} ({p.reason}):</span>
                        <span>-${p.discountAmount.toFixed(2)}</span>
                      </div>
                    ))
                  ) : promoDiscount > 0 ? (
                    <div className="flex justify-between text-emerald-800">
                      <span>🎁 自動組合/滿額特惠:</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  ) : null}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>🌟 會員點數折抵 ({order.pointsRedeemed || 0} pts):</span>
                      <span>-${pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {(couponDiscount > 0 || (order.couponCode && order.couponCode.trim() !== '')) && (
                    <div className="flex justify-between text-emerald-800">
                      <span>🏷️ 優惠券折抵 ({order.couponCode || '折價券'}):</span>
                      <span>-${(couponDiscount || (order.discountAmount && !promoDiscount && !pointsDiscount ? order.discountAmount : 0)).toFixed(2)}</span>
                    </div>
                  )}

                  {(percentageDiscount > 0 || manualDiscount > 0 || (order.discountPercentage || 0) > 0) && (
                    <div className="flex justify-between text-emerald-800">
                      <span>✂️ 整單折扣 ({order.discountPercentage || 0}%):</span>
                      <span>-${(percentageDiscount || manualDiscount || order.discountAmount || 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-extrabold text-rose-700 py-0.5 border-t border-b border-dashed border-gray-400 my-0.5">
                    <span>合計總折扣金額:</span>
                    <span>-${totalCombinedDiscount.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-500 italic py-0.5">
                  <span>完整的折抵明細:</span>
                  <span>未使用任何折抵</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>營業稅金 ({order.taxRate || 0}%):</span>
                <span>${(order.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>服務費 ({order.serviceChargeRate || 0}%):</span>
                <span>${(order.serviceChargeAmount || 0).toFixed(2)}</span>
              </div>

              <div className="my-1.5 border-b-2 border-double border-gray-800"></div>

              <div className="flex justify-between text-sm font-extrabold pt-0.5">
                <span>總計金額:</span>
                <span>${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="my-2 border-b border-dashed border-gray-400"></div>

            {/* Payment Summary */}
            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="font-bold">付款方式:</span>
                <span>{formattedPayMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">付款狀態:</span>
                <span className={order.paymentStatus === 'Paid' ? 'font-bold uppercase text-emerald-800' : 'font-bold uppercase text-amber-800'}>
                  {formattedPayStatus}
                </span>
              </div>
            </div>

            <div className="my-3 border-b border-dashed border-gray-400"></div>

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-700 space-y-1">
              <p>{currentSettings.receiptFooter || '歡迎再次光臨！'}</p>
              <p className="text-[9px] text-gray-500">系統提供：POS 智慧餐飲管理系統</p>
            </div>
          </div>
        </div>

        {/* Footer Actions (No-Print) */}
        <div className="flex items-center justify-between border-t border-gray-200 p-4 bg-white dark:bg-gray-900 dark:border-gray-800 space-x-2 no-print">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span>已複製</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>複製明細</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenNewWindow}
            title="在新分頁開啟收據明細"
            className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <ExternalLink className="h-4 w-4 text-blue-500" />
            <span>新分頁開啟</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-[#FF8A00] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e07900]"
          >
            <Printer className="h-4 w-4" />
            <span>列印明細</span>
          </button>
        </div>
      </div>
    </div>
  );
};
