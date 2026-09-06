import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, ChefHat, Sparkles, SlidersHorizontal, Plus, Minus, Tag, AlertCircle } from 'lucide-react';
import { MenuItem } from '../types';
import { Language } from '../i18n/translations';
import {
  CustomizationGroup,
  CustomizationOption,
  getApplicableGroupsForItem,
  getCustomizationGroups,
  getItemCulinaryProfile,
} from '../data/dishCustomizationPresets';

interface DishCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  initialModifiers?: string[];
  initialKitchenNote?: string;
  onConfirm: (selectedModifiers: string[], kitchenNote: string, finalCalculatedPrice?: number) => void;
  lang: Language;
}

export const DishCustomizationModal: React.FC<DishCustomizationModalProps> = ({
  isOpen,
  onClose,
  item,
  initialModifiers = [],
  initialKitchenNote = '',
  onConfirm,
  lang,
}) => {
  // Active filter tab inside the modal
  const [activeGroupTab, setActiveGroupTab] = useState<string>('all');

  // Track selected option IDs mapped to their group: Record<groupId, Set<optionId>>
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string[]>>({});
  const [currentKitchenNote, setCurrentKitchenNote] = useState<string>('');

  // Dynamic customization groups applicable to this item
  const applicableGroups = useMemo(() => {
    if (!item) return [];
    return getApplicableGroupsForItem(item, getCustomizationGroups());
  }, [item]);

  // Culinary domain profile and kitchen feasibility advisory
  const culinaryProfile = useMemo(() => {
    return getItemCulinaryProfile(item);
  }, [item]);

  // Initialize selections when modal opens with a new item
  useEffect(() => {
    if (isOpen && item) {
      const initialMap: Record<string, string[]> = {};

      applicableGroups.forEach(group => {
        if (group.type === 'single') {
          // Find default option or pick the first one
          const defaultOpt = group.options.find(o => o.isDefault) || group.options[0];
          if (defaultOpt) {
            initialMap[group.id] = [defaultOpt.id];
          }
        } else {
          initialMap[group.id] = [];
        }
      });

      // Map back initial modifiers if passed (e.g. from existing cart or editing order)
      if (initialModifiers && initialModifiers.length > 0) {
        applicableGroups.forEach(group => {
          group.options.forEach(opt => {
            const optLabelZh = opt.label['zh-TW'] || '';
            const optLabelEn = opt.label['en'] || '';
            const isSelected = initialModifiers.some(mod => {
              const m = (mod || '').toLowerCase();
              return (
                (optLabelZh && m.includes(optLabelZh.toLowerCase())) ||
                (optLabelEn && m.includes(optLabelEn.toLowerCase()))
              );
            });

            if (isSelected) {
              if (group.type === 'single') {
                initialMap[group.id] = [opt.id];
              } else {
                if (!initialMap[group.id]) initialMap[group.id] = [];
                if (!initialMap[group.id].includes(opt.id)) {
                  initialMap[group.id].push(opt.id);
                }
              }
            }
          });
        });
      }

      setSelectedOptionIds(initialMap);
      setCurrentKitchenNote(initialKitchenNote || '');
    }
  }, [isOpen, item, initialModifiers, initialKitchenNote, applicableGroups]);

  // Derive human-readable modifier labels from current selections
  const computedModifierLabels = useMemo(() => {
    const labels: string[] = [];
    applicableGroups.forEach(group => {
      const selectedIds = selectedOptionIds[group.id] || [];
      group.options.forEach(opt => {
        if (selectedIds.includes(opt.id)) {
          const optLabel = opt.label[lang] || opt.label['en'];
          const priceStr = opt.priceDelta
            ? opt.priceDelta > 0
              ? ` (+$${opt.priceDelta.toFixed(2)})`
              : ` (-$${Math.abs(opt.priceDelta).toFixed(2)})`
            : '';
          labels.push(`${optLabel}${priceStr}`);
        }
      });
    });
    return labels;
  }, [applicableGroups, selectedOptionIds, lang]);

  // Calculate current price adjustment from selected options (unconditionally hook before early return)
  const totalPriceDelta = useMemo(() => {
    let delta = 0;
    applicableGroups.forEach(group => {
      const selectedIds = selectedOptionIds[group.id] || [];
      group.options.forEach(opt => {
        if (selectedIds.includes(opt.id) && opt.priceDelta) {
          delta += opt.priceDelta;
        }
      });
    });
    return delta;
  }, [applicableGroups, selectedOptionIds]);

  const quickNoteTemplates = useMemo(() => {
    const type = culinaryProfile.categoryType;
    if (lang === 'zh-TW') {
      if (type === 'soup') return ['急件請先出', '熱湯請小心', '加附湯匙', '麵包另外放', '不要黑胡椒', '少鹽'];
      if (type === 'salad') return ['醬汁分裝', '不要麵包丁', '生菜瀝乾', '急件先出', '附沙拉叉'];
      if (type === 'steak_grill') return ['急件請先出', '醬汁分裝', '先上主餐', '附牛排刀', '少鹽', '胡椒多'];
      if (type === 'burger_sandwich') return ['急件請快出', '醬汁分裝', '不要酸黃瓜', '多給紙巾', '附外帶盒', '切半對切'];
      if (type === 'fries_sides') return ['現炸出爐', '醬汁分裝', '多給胡椒鹽', '急件請快出', '附外帶盒'];
      if (type === 'drink') return ['急件先出', '附吸管', '分開裝袋', '多加一份杯套', '不要封口'];
      if (type === 'dessert') return ['餐後再上', '附甜點匙', '蠟燭慶生', '急件先出', '附外帶盒'];
      return ['急件請快出', '先上餐點', '附外帶盒', '分拆裝盤', '不加辛香料', '醬汁多給一份'];
    } else if (lang === 'ja') {
      if (type === 'soup') return ['急ぎ', '熱湯注意', 'スプーン添付', 'パン別添え', 'コショウ抜き', '薄味'];
      if (type === 'salad') return ['ドレッシング別添え', 'クルトン抜き', '急ぎ', 'フォーク添付'];
      if (type === 'steak_grill') return ['急ぎ', 'ソース別添え', 'メイン先出し', 'ナイフ添付', '薄味'];
      if (type === 'burger_sandwich') return ['急ぎ', 'ピクルス抜き', 'ハーフカット', 'ペーパー多め', '持ち帰り用'];
      if (type === 'fries_sides') return ['揚げたて', 'ソース別添え', '塩分控えめ', '急ぎ', '持ち帰り用'];
      if (type === 'drink') return ['急ぎ', 'ストロー添付', '袋分け', 'スリーブ付き'];
      if (type === 'dessert') return ['食後提供', 'スプーン添付', 'バースデー対応', '持ち帰り用'];
      return ['急ぎ', '先出し', 'テイクアウト包装', '薬味なし', 'ソース別添え', 'ソース多め'];
    } else {
      if (type === 'soup') return ['Rush Order', 'Hot Soup Caution', 'Extra Spoon', 'Bread On Side', 'No Black Pepper', 'Low Sodium'];
      if (type === 'salad') return ['Dressing On Side', 'No Croutons', 'Crisp Dry Greens', 'Rush Order', 'Extra Fork'];
      if (type === 'steak_grill') return ['Rush Order', 'Sauce On Side', 'Serve First', 'Steak Knife', 'Low Salt', 'Extra Pepper'];
      if (type === 'burger_sandwich') return ['Rush Order', 'Sauce On Side', 'No Pickles', 'Cut In Half', 'Extra Napkins'];
      if (type === 'fries_sides') return ['Extra Crispy', 'Dip Sauce On Side', 'Low Salt', 'Rush Order', 'Takeaway Box'];
      if (type === 'drink') return ['Rush Order', 'Extra Straw', 'Separate Bag', 'Cup Sleeve'];
      if (type === 'dessert') return ['Serve After Meal', 'Dessert Spoon', 'Birthday Candle', 'Takeaway Box'];
      return ['Rush Order', 'Serve First', 'Takeaway Box', 'Separate Plates', 'No Spices', 'Extra Sauce'];
    }
  }, [culinaryProfile.categoryType, lang]);

  if (!isOpen || !item) return null;

  const finalUnitPrice = Math.max(0, (item.price || 0) + totalPriceDelta);

  // Toggle or select an option
  const handleSelectOption = (group: CustomizationGroup, option: CustomizationOption) => {
    setSelectedOptionIds(prev => {
      const currentList = prev[group.id] || [];
      let updatedList: string[] = [];

      if (group.type === 'single') {
        // Single choice / radio: replace with current selection
        updatedList = [option.id];
      } else {
        // Multi-select / checkbox: toggle
        if (currentList.includes(option.id)) {
          updatedList = currentList.filter(id => id !== option.id);
        } else {
          updatedList = [...currentList, option.id];
        }
      }

      return { ...prev, [group.id]: updatedList };
    });
  };

  const isOptionActive = (groupId: string, optionId: string) => {
    return (selectedOptionIds[groupId] || []).includes(optionId);
  };

  // Filter groups if a tab is chosen
  const displayedGroups = applicableGroups.filter(group => {
    if (activeGroupTab === 'all') return true;
    return group.id === activeGroupTab;
  });

  const texts = {
    title: {
      'en': 'Dish Customization & Preparation Preferences',
      'zh-TW': '餐點專屬客製化與規格設定',
      'ja': 'メニューのカスタムオプションと要望',
    },
    basePrice: {
      'en': 'Base Price',
      'zh-TW': '餐點原價',
      'ja': '基本価格',
    },
    finalPrice: {
      'en': 'Total Unit Price',
      'zh-TW': '客製後單價',
      'ja': '合計単価',
    },
    singleSelectNotice: {
      'en': 'Single choice required',
      'zh-TW': '單選 (必選一項)',
      'ja': '1つ選択 (必須)',
    },
    multiSelectNotice: {
      'en': 'Multiple selections allowed',
      'zh-TW': '可複選 (自由加選)',
      'ja': '複数選択可能',
    },
    kitchenNoteLabel: {
      'en': 'Kitchen Special Notes & Remarks',
      'zh-TW': '其他廚房特製備註說明',
      'ja': 'その他の厨房メッセージ',
    },
    kitchenNotePlaceholder: {
      'en': 'e.g. Sauce on the side, serve together with soup, rush order...',
      'zh-TW': '例如：醬汁分裝、與湯品一起上、急件請先出...',
      'ja': '例：ソース別添え、スープと一緒に出してほしい...',
    },
    confirmBtn: {
      'en': 'Confirm Customization',
      'zh-TW': '確認客製並加入',
      'ja': 'カスタムを確定して追加',
    },
    cancelBtn: {
      'en': 'Cancel',
      'zh-TW': '取消',
      'ja': 'キャンセル',
    },
    quickNotes: {
      'en': 'Quick Tags:',
      'zh-TW': '快捷標籤：',
      'ja': 'クイックタグ：',
    },
  };

  const getT = (key: keyof typeof texts): string => {
    return texts[key][lang] || texts[key]['en'] || '';
  };

  const handleConfirmModal = () => {
    onConfirm(computedModifierLabels, currentKitchenNote, finalUnitPrice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] my-auto flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-3 sm:p-4 bg-gray-50/90 dark:bg-gray-800/60">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FF8A00] border border-orange-200 dark:border-orange-900 shrink-0">
              <ChefHat className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate">
                  {item.name}
                </h3>
                <span className="text-xs font-black text-[#FF8A00] bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-900">
                  ${(item.price || 0).toFixed(2)}
                </span>
                {culinaryProfile.badgeTitle && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-gray-200/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 border border-gray-300/60 dark:border-gray-600">
                    {culinaryProfile.badgeTitle[lang] || culinaryProfile.badgeTitle['en']}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {getT('title')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Real-time Dynamic Price Summary Bar */}
        <div className="shrink-0 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-bold">
            <span>{getT('basePrice')}: ${(item.price || 0).toFixed(2)}</span>
            {totalPriceDelta !== 0 && (
              <span className={`px-2 py-0.5 rounded-md font-extrabold ${
                totalPriceDelta > 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
              }`}>
                {totalPriceDelta > 0 ? `+ $${totalPriceDelta.toFixed(2)}` : `- $${Math.abs(totalPriceDelta).toFixed(2)}`}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 dark:text-gray-400 font-bold">{getT('finalPrice')}:</span>
            <span className="text-base font-black text-[#FF8A00]">
              ${finalUnitPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4 flex-1 overscroll-contain touch-pan-y">

          {/* Kitchen Feasibility & Preparation Advisory Notice */}
          {culinaryProfile.kitchenNotice && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/50 p-3.5 flex items-start space-x-3 shadow-2xs">
              <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-950 dark:text-amber-200 leading-relaxed">
                  {culinaryProfile.kitchenNotice[lang] || culinaryProfile.kitchenNotice['en']}
                </p>
              </div>
            </div>
          )}

          {/* Quick Group Tabs (if more than 2 groups) */}
          {applicableGroups.length > 2 && (
            <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveGroupTab('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeGroupTab === 'all'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {lang === 'zh-TW' ? '全部選項' : lang === 'ja' ? 'すべて' : 'All Options'}
              </button>
              {applicableGroups.map(group => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroupTab(group.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    activeGroupTab === group.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {group.title[lang] || group.title['en']}
                </button>
              ))}
            </div>
          )}

          {/* Customization Groups Grid */}
          <div className="space-y-4">
            {displayedGroups.map(group => {
              const isSingle = group.type === 'single';
              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3.5 bg-gray-50/60 dark:bg-gray-800/40 space-y-2.5 transition-all"
                >
                  {/* Group Title & Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5">
                    <div className="flex items-center flex-wrap gap-2 min-w-0">
                      <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                        {group.title[lang] || group.title['en']}
                      </span>
                      <span
                        className={`inline-flex items-center whitespace-nowrap text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                          isSingle
                            ? 'bg-blue-100/80 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900'
                            : 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900'
                        }`}
                      >
                        {isSingle ? getT('singleSelectNotice') : getT('multiSelectNotice')}
                      </span>
                    </div>

                    {group.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium sm:text-right shrink-0">
                        {group.description[lang] || group.description['en']}
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {group.options.map(option => {
                      const active = isOptionActive(group.id, option.id);
                      const optLabel = option.label[lang] || option.label['en'];

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectOption(group, option)}
                          className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer min-h-[44px] ${
                            active
                              ? isSingle
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-400/40'
                                : 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/40'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:bg-gray-50/80 dark:hover:bg-gray-750'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 mr-2 flex-1">
                            {/* Radio / Checkbox Indicator */}
                            <div
                              className={`w-4 h-4 rounded-${isSingle ? 'full' : 'md'} border flex items-center justify-center shrink-0 ${
                                active
                                  ? 'bg-white text-gray-900 border-white'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                              }`}
                            >
                              {active && (
                                isSingle ? (
                                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                                ) : (
                                  <Check className="h-3 w-3 stroke-[3] text-emerald-600" />
                                )
                              )}
                            </div>
                            <span className="text-xs font-bold leading-snug break-words">{optLabel}</span>
                          </div>

                          {/* Price Tag Indicator */}
                          {option.priceDelta !== undefined && option.priceDelta !== 0 && (
                            <span
                              className={`shrink-0 ml-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black whitespace-nowrap ${
                                active
                                  ? 'bg-white/25 text-white'
                                  : option.priceDelta > 0
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {option.priceDelta > 0
                                ? `+$${option.priceDelta.toFixed(2)}`
                                : `-$${Math.abs(option.priceDelta).toFixed(2)}`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kitchen Note & Quick Tags */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3.5 bg-white dark:bg-gray-800 space-y-2.5">
            <label className="block text-xs font-black text-gray-900 dark:text-white">
              {getT('kitchenNoteLabel')}
            </label>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400">{getT('quickNotes')}</span>
              {quickNoteTemplates.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setCurrentKitchenNote(currentKitchenNote ? `${currentKitchenNote}, ${tag}` : tag);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-colors cursor-pointer"
                >
                  +{tag}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={currentKitchenNote}
              onChange={e => setCurrentKitchenNote(e.target.value)}
              placeholder={getT('kitchenNotePlaceholder')}
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
            />
          </div>

          {/* Selected Modifiers Summary Badge Chips */}
          {computedModifierLabels.length > 0 && (
            <div className="rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 p-3 text-xs">
              <span className="font-black text-[#FF8A00] block mb-1.5">
                {lang === 'zh-TW' ? '已配置之客製化規格：' : lang === 'ja' ? '選択したカスタム：' : 'Selected Customizations:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {computedModifierLabels.map(mod => (
                  <span
                    key={mod}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FF8A00] text-white shadow-2xs"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer - Sticky Actions */}
        <div className="shrink-0 sticky bottom-0 z-20 p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-xs flex items-center justify-between sm:justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200/80 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {getT('cancelBtn')}
          </button>
          
          <button
            type="button"
            onClick={handleConfirmModal}
            className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-amber-500 to-[#FF8A00] px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-amber-600 hover:to-[#e07900] active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>
              {getT('confirmBtn')} (${finalUnitPrice.toFixed(2)})
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
