import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  DollarSign,
  ShieldCheck,
  Flame,
  Snowflake,
  Droplet,
  Coffee,
  Utensils,
  PlusCircle,
  Eye,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  CustomizationGroup,
  CustomizationOption,
  CustomizationTarget,
  SelectionType,
  INITIAL_CUSTOMIZATION_GROUPS,
  getCustomizationGroups,
  saveCustomizationGroups,
} from '../data/dishCustomizationPresets';
import { Language } from '../i18n/translations';
import { useTranslation } from '../i18n/useTranslation';

export const AdminCustomizationHub: React.FC = () => {
  const { lang } = useTranslation();
  const [groups, setGroups] = useState<CustomizationGroup[]>(() => getCustomizationGroups());
  const [activeTargetFilter, setActiveTargetFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Option Add / Edit Modal State
  const [showOptionModal, setShowOptionModal] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [editingOption, setEditingOption] = useState<CustomizationOption | null>(null);

  // Option Form State
  const [labelZh, setLabelZh] = useState<string>('');
  const [labelEn, setLabelEn] = useState<string>('');
  const [labelJa, setLabelJa] = useState<string>('');
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [isDefault, setIsDefault] = useState<boolean>(false);

  // Group Add Modal State
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [groupTitleZh, setGroupTitleZh] = useState<string>('');
  const [groupTitleEn, setGroupTitleEn] = useState<string>('');
  const [groupTitleJa, setGroupTitleJa] = useState<string>('');
  const [groupType, setGroupType] = useState<SelectionType>('single');
  const [groupTarget, setGroupTarget] = useState<CustomizationTarget>('dietary_savory');

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Sync state whenever stored groups change
  const handleSaveAll = (newGroups: CustomizationGroup[]) => {
    setGroups(newGroups);
    saveCustomizationGroups(newGroups);
  };

  const handleOpenAddOption = (groupId: string) => {
    setSelectedGroupId(groupId);
    setEditingOption(null);
    setLabelZh('');
    setLabelEn('');
    setLabelJa('');
    setPriceDelta(0);
    setIsDefault(false);
    setShowOptionModal(true);
  };

  const handleOpenEditOption = (groupId: string, option: CustomizationOption) => {
    setSelectedGroupId(groupId);
    setEditingOption(option);
    setLabelZh(option.label['zh-TW'] || '');
    setLabelEn(option.label['en'] || '');
    setLabelJa(option.label['ja'] || '');
    setPriceDelta(option.priceDelta || 0);
    setIsDefault(!!option.isDefault);
    setShowOptionModal(true);
  };

  const handleSaveOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelZh && !labelEn) return;

    const newOption: CustomizationOption = {
      id: editingOption ? editingOption.id : `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: {
        'zh-TW': labelZh || labelEn,
        'en': labelEn || labelZh,
        'ja': labelJa || labelEn || labelZh,
      },
      priceDelta: Number(priceDelta) || 0,
      isDefault,
    };

    const updatedGroups = groups.map(g => {
      if (g.id !== selectedGroupId) return g;
      let newOptions = [...g.options];
      if (editingOption) {
        newOptions = newOptions.map(o => (o.id === editingOption.id ? newOption : o));
      } else {
        newOptions.push(newOption);
      }
      return { ...g, options: newOptions };
    });

    handleSaveAll(updatedGroups);
    setShowOptionModal(false);
    showNotification(lang === 'zh-TW' ? '客製化選項已儲存！' : 'Customization option saved!');
  };

  const handleDeleteOption = (groupId: string, optionId: string) => {
    if (!window.confirm(lang === 'zh-TW' ? '確定要刪除此客製化選項嗎？' : 'Delete this customization option?')) return;
    const updatedGroups = groups.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, options: g.options.filter(o => o.id !== optionId) };
    });
    handleSaveAll(updatedGroups);
    showNotification(lang === 'zh-TW' ? '選項已刪除。' : 'Option deleted.');
  };

  const handleToggleGroupActive = (groupId: string) => {
    const updatedGroups = groups.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, isActive: g.isActive === false ? true : false };
    });
    handleSaveAll(updatedGroups);
  };

  const handleResetDefaults = () => {
    if (!window.confirm(lang === 'zh-TW' ? '確定要將所有客製化群組與選項重設為系統預設值嗎？' : 'Reset all customization groups to system defaults?')) return;
    handleSaveAll(INITIAL_CUSTOMIZATION_GROUPS);
    showNotification(lang === 'zh-TW' ? '已成功重設為原廠預設客製化規則！' : 'Reset to default customizations successfully!');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitleZh && !groupTitleEn) return;

    const newGroup: CustomizationGroup = {
      id: `group_${Date.now()}`,
      title: {
        'zh-TW': groupTitleZh || groupTitleEn,
        'en': groupTitleEn || groupTitleZh,
        'ja': groupTitleJa || groupTitleEn || groupTitleZh,
      },
      type: groupType,
      target: groupTarget,
      isActive: true,
      options: [],
    };

    handleSaveAll([...groups, newGroup]);
    setShowGroupModal(false);
    setGroupTitleZh('');
    setGroupTitleEn('');
    setGroupTitleJa('');
    showNotification(lang === 'zh-TW' ? '已成功建立新客製化群組！' : 'New customization group created!');
  };

  const filteredGroups = groups.filter(g => {
    const matchesTarget = activeTargetFilter === 'all' || g.target === activeTargetFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (g.title['zh-TW'] || '').toLowerCase().includes(query) ||
      (g.title['en'] || '').toLowerCase().includes(query) ||
      g.options.some(
        o =>
          (o.label['zh-TW'] || '').toLowerCase().includes(query) ||
          (o.label['en'] || '').toLowerCase().includes(query)
      );
    return matchesTarget && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-6 border border-amber-200/60 dark:border-amber-900/40">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-[#FF8A00] text-white shadow-md">
            <Sliders className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
              {lang === 'zh-TW' ? '餐點客製化與加料管理後台' : 'Customization & Add-ons Manager'}
              <span className="ml-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {groups.length} {lang === 'zh-TW' ? '個群組' : 'Groups'}
              </span>
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {lang === 'zh-TW'
                ? '設定份量加價 (如大份 +$3.50、減量 -$1.50)、肉品熟度、飲料冰溫甜度、辛香料忌口與付費豪華配料。'
                : 'Configure portion pricing, meat doneness, drink ice/sweetness, dietary exclusions, and paid add-ons.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center space-x-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 shadow-xs cursor-pointer"
            title="Reset to factory presets"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{lang === 'zh-TW' ? '重設預設值' : 'Reset Defaults'}</span>
          </button>

          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF8A00] px-4 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-amber-600 hover:to-[#e07900] cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{lang === 'zh-TW' ? '新增客製化群組' : 'Add Custom Group'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="flex items-center space-x-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: lang === 'zh-TW' ? '全部群組' : 'All Groups' },
            { id: 'sizes', label: lang === 'zh-TW' ? '📏 份量加減價' : '📏 Sizes & Portions' },
            { id: 'meats', label: lang === 'zh-TW' ? '🥩 肉品熟度' : '🥩 Meat Doneness' },
            { id: 'drinks_ice', label: lang === 'zh-TW' ? '🧊 飲料冰量' : '🧊 Drink Ice' },
            { id: 'drinks_sugar', label: lang === 'zh-TW' ? '🍯 飲料甜度' : '🍯 Drink Sugar' },
            { id: 'drinks_milk', label: lang === 'zh-TW' ? '🥛 鮮奶更換' : '🥛 Milk Substitutes' },
            { id: 'dietary_savory', label: lang === 'zh-TW' ? '🌿 辛香料忌口' : '🌿 Dietary Exclusions' },
            { id: 'sauces', label: lang === 'zh-TW' ? '🥫 醬料調整' : '🥫 Sauces' },
            { id: 'toppings', label: lang === 'zh-TW' ? '🧀 付費豪華加料' : '🧀 Extra Toppings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTargetFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTargetFilter === tab.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'zh-TW' ? '搜尋客製化選項名稱...' : 'Search options...'}
            className="w-full rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-2 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8A00]"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {filteredGroups.map(group => {
          const isSingle = group.type === 'single';

          return (
            <div
              key={group.id}
              className={`rounded-3xl border transition-all ${
                group.isActive === false
                  ? 'border-gray-200 bg-gray-50/60 dark:bg-gray-900/40 opacity-60'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs'
              } p-4 sm:p-5`}
            >
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="text-base font-black text-gray-900 dark:text-white">
                    {group.title[lang] || group.title['en']}
                  </span>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isSingle
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {isSingle
                      ? lang === 'zh-TW'
                        ? '單選 (Radio - 必選1項)'
                        : 'Single Choice'
                      : lang === 'zh-TW'
                      ? '複選 (Checkbox - 自由勾選)'
                      : 'Multiple Checkbox'}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    Target: {group.target}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleGroupActive(group.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                      group.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {group.isActive !== false
                      ? lang === 'zh-TW'
                        ? '● 啟用中'
                        : '● Active'
                      : lang === 'zh-TW'
                      ? '○ 已停用'
                      : '○ Disabled'}
                  </button>

                  <button
                    onClick={() => handleOpenAddOption(group.id)}
                    className="flex items-center space-x-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-3 py-1 text-[11px] font-bold hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{lang === 'zh-TW' ? '新增選項' : 'Add Option'}</span>
                  </button>
                </div>
              </div>

              {/* Group Description */}
              {group.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 pb-3">
                  {group.description[lang] || group.description['en']}
                </p>
              )}

              {/* Options Table / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-3">
                {group.options.map(opt => {
                  const optTitle = opt.label[lang] || opt.label['en'];

                  return (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/40 p-3 hover:border-amber-400 transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {optTitle}
                          </h4>
                          {opt.isDefault && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`text-[11px] font-black ${
                              opt.priceDelta && opt.priceDelta > 0
                                ? 'text-emerald-600'
                                : opt.priceDelta && opt.priceDelta < 0
                                ? 'text-amber-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {opt.priceDelta && opt.priceDelta > 0
                              ? `+ $${opt.priceDelta.toFixed(2)} (加價)`
                              : opt.priceDelta && opt.priceDelta < 0
                              ? `- $${Math.abs(opt.priceDelta).toFixed(2)} (折扣)`
                              : '$0.00 (免費)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditOption(group.id, opt)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                          title="Edit option"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOption(group.id, opt.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete option"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {group.options.length === 0 && (
                  <div className="col-span-full text-center py-4 text-xs text-gray-400">
                    {lang === 'zh-TW' ? '目前尚無選項，請點擊「新增選項」開始添加。' : 'No options yet. Click "Add Option" to create one.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* OPTION ADD / EDIT MODAL */}
      {showOptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                {editingOption
                  ? lang === 'zh-TW'
                    ? '編輯客製化選項'
                    : 'Edit Customization Option'
                  : lang === 'zh-TW'
                  ? '新增客製化選項'
                  : 'Add Customization Option'}
              </h3>
              <button
                onClick={() => setShowOptionModal(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOption} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'zh-TW' ? '繁體中文名稱 *' : 'Traditional Chinese Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={labelZh}
                  onChange={e => setLabelZh(e.target.value)}
                  placeholder="例如：大份加大、三分熟、去香菜、加特級培根"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-medium dark:text-white focus:ring-2 focus:ring-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  English Name
                </label>
                <input
                  type="text"
                  value={labelEn}
                  onChange={e => setLabelEn(e.target.value)}
                  placeholder="e.g. Large Upsize, Medium Rare, No Cilantro, Extra Bacon"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-medium dark:text-white focus:ring-2 focus:ring-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  日本語名称
                </label>
                <input
                  type="text"
                  value={labelJa}
                  onChange={e => setLabelJa(e.target.value)}
                  placeholder="例：大盛り、ミディアムレア、パクチー抜き"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-medium dark:text-white focus:ring-2 focus:ring-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'zh-TW' ? '價格調整金額 (正數為加價，負數為折扣，0為免費) *' : 'Price Delta (+$3.50, -$1.50, or 0) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.5"
                    value={priceDelta}
                    onChange={e => setPriceDelta(parseFloat(e.target.value) || 0)}
                    placeholder="3.50 or -1.50"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-7 p-2.5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF8A00]"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {lang === 'zh-TW' ? '例如大份填 3.5、輕食小份填 -1.5、培根加料填 2.5。' : 'e.g. 3.5 for upsize, -1.5 for petite, 2.5 for bacon.'}
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="optDefault"
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                  className="rounded text-[#FF8A00] h-4 w-4"
                />
                <label htmlFor="optDefault" className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                  {lang === 'zh-TW' ? '設為該群組之預設選項 (Default)' : 'Set as default selected option'}
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOptionModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  {lang === 'zh-TW' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-5 py-2.5 font-bold text-white shadow-md hover:bg-[#e07900] cursor-pointer"
                >
                  {lang === 'zh-TW' ? '儲存選項' : 'Save Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROUP ADD MODAL */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                {lang === 'zh-TW' ? '新增客製化群組' : 'Create Customization Group'}
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'zh-TW' ? '群組中文標題 *' : 'Group Title (Chinese) *'}
                </label>
                <input
                  type="text"
                  required
                  value={groupTitleZh}
                  onChange={e => setGroupTitleZh(e.target.value)}
                  placeholder="例如：🥩 肉品熟度選擇、🥫 主廚配醬調整"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-medium dark:text-white focus:ring-2 focus:ring-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Group Title (English)
                </label>
                <input
                  type="text"
                  value={groupTitleEn}
                  onChange={e => setGroupTitleEn(e.target.value)}
                  placeholder="e.g. Steak Doneness, Gourmet Toppings"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-medium dark:text-white focus:ring-2 focus:ring-[#FF8A00]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'zh-TW' ? '選擇模式 (單選 / 複選) *' : 'Selection Type *'}
                </label>
                <select
                  value={groupType}
                  onChange={e => setGroupType(e.target.value as SelectionType)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-bold dark:text-white"
                >
                  <option value="single">{lang === 'zh-TW' ? '單選 (Radio - 只能選一項，如份量、熟度、甜度)' : 'Single Choice (Radio)'}</option>
                  <option value="multiple">{lang === 'zh-TW' ? '複選 (Checkbox - 可多選，如忌口、加料)' : 'Multiple Choice (Checkbox)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'zh-TW' ? '適用餐點類別規則 (Target Scope) *' : 'Applicable Rule Target *'}
                </label>
                <select
                  value={groupTarget}
                  onChange={e => setGroupTarget(e.target.value as CustomizationTarget)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 font-bold dark:text-white"
                >
                  <option value="sizes">{lang === 'zh-TW' ? '📏 份量加減價 (適用全品項)' : 'Sizes & Portions'}</option>
                  <option value="meats">{lang === 'zh-TW' ? '🥩 肉品熟度 (只出現在牛排/肉品/漢堡，不出現在飲料)' : 'Meat Doneness (Meats only)'}</option>
                  <option value="drinks_ice">{lang === 'zh-TW' ? '🧊 飲料冰量 (只出現在飲品，不出現在主餐)' : 'Drinks Ice'}</option>
                  <option value="drinks_sugar">{lang === 'zh-TW' ? '🍯 飲料甜度 (只出現在飲品，不出現在主餐)' : 'Drinks Sugar'}</option>
                  <option value="drinks_milk">{lang === 'zh-TW' ? '🥛 鮮奶/植物奶更換 (出現在拿鐵/咖啡/奶茶)' : 'Drinks Milk Substitute'}</option>
                  <option value="dietary_savory">{lang === 'zh-TW' ? '🌿 辛香料與忌口 (出現在所有主餐/前菜/炸物，甜點與飲料除外)' : 'Dietary Savory (All food except dessert/drink)'}</option>
                  <option value="sauces">{lang === 'zh-TW' ? '🥫 醬料與配醬調整' : 'Sauces'}</option>
                  <option value="toppings">{lang === 'zh-TW' ? '🧀 額外加料加配料' : 'Extra Toppings'}</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  {lang === 'zh-TW' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#FF8A00] px-5 py-2.5 font-bold text-white shadow-md hover:bg-[#e07900] cursor-pointer"
                >
                  {lang === 'zh-TW' ? '建立群組' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
