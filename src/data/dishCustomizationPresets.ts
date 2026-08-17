import { Language } from '../i18n/translations';

export type SelectionType = 'single' | 'multiple';

export type CustomizationTarget =
  | 'sizes'                     // Portion sizes with price deltas (+$3.50 / -$1.50)
  | 'meats'                     // Meat / Steak / Burger Doneness (single choice)
  | 'drinks_ice'                // Drink ice level (single choice)
  | 'drinks_sugar'              // Drink sweetness level (single choice)
  | 'drinks_milk'               // Drink milk substitution (single choice)
  | 'dietary_savory'            // 🌿 辛香料與飲食忌口特製 (All food/savory EXCEPT dessert and drink - multi-select)
  | 'sauces'                    // 🥫 醬料與配醬調整
  | 'toppings'                  // 🧀 額外加配配料 (with money)
  | 'all';                      // Universal

export interface CustomizationOption {
  id: string;
  label: Record<Language, string>;
  priceDelta?: number; // e.g. +3.50, -1.50, +2.50, 0
  isDefault?: boolean;
  disabled?: boolean;
}

export interface CustomizationGroup {
  id: string;
  title: Record<Language, string>;
  type: SelectionType; // 'single' (radio) | 'multiple' (checkbox)
  target: CustomizationTarget;
  icon?: string;
  description?: Record<Language, string>;
  options: CustomizationOption[];
  isActive?: boolean;
}

export const INITIAL_CUSTOMIZATION_GROUPS: CustomizationGroup[] = [
  // 1. 份量與規格選擇 (Size / Portion) - Single Choice
  {
    id: 'sizes_portion',
    title: {
      'en': '📏 Portion & Size Selection',
      'zh-TW': '📏 份量與規格選擇',
      'ja': '📏 ポーション・サイズ選択',
    },
    type: 'single',
    target: 'sizes',
    icon: 'Maximize2',
    description: {
      'en': 'Select standard portion, upsize, or reduced portion.',
      'zh-TW': '選擇標準份量、大份加大 (+$3.50) 或減量輕食 (-$1.50 折扣)。',
      'ja': 'レギュラー、大盛り(+$3.50)、または軽め(-$1.50引き)を選択。',
    },
    isActive: true,
    options: [
      {
        id: 'size_regular',
        label: { 'en': 'Regular Standard (標準份量)', 'zh-TW': '標準份量 (Regular)', 'ja': 'レギュラー (標準)' },
        priceDelta: 0.0,
        isDefault: true,
      },
      {
        id: 'size_large',
        label: { 'en': 'Large / Upsize (大份加大)', 'zh-TW': '大份加大 (Upsize)', 'ja': '大盛り (Upsize)' },
        priceDelta: 3.5,
      },
      {
        id: 'size_petite',
        label: { 'en': 'Petite / Reduced Portion (減量輕食)', 'zh-TW': '減量輕食 (Petite -少份量)', 'ja': 'ポーション少なめ (Petite)' },
        priceDelta: -1.5,
      },
    ],
  },

  // 2. 肉品熟度選擇 (Steak & Meat Doneness) - Single Choice (Meats only)
  {
    id: 'steak_doneness',
    title: {
      'en': '🥩 Steak & Meat Doneness',
      'zh-TW': '🥩 排餐與肉品熟度選擇',
      'ja': '🥩 ステーキ・お肉の焼き加減',
    },
    type: 'single',
    target: 'meats',
    icon: 'Flame',
    description: {
      'en': 'Only for steaks, burgers, and beef dishes. Choose exactly one.',
      'zh-TW': '適用於排餐、漢堡與牛肉料理，單選單一熟度。',
      'ja': 'ステーキや牛肉料理専用。焼き加減を1つ選択。',
    },
    isActive: true,
    options: [
      {
        id: 'rare',
        label: { 'en': 'Rare (一分熟)', 'zh-TW': '一分熟 (Rare)', 'ja': 'レア (Rare 1分)' },
        priceDelta: 0,
      },
      {
        id: 'medium_rare',
        label: { 'en': 'Medium Rare (三分熟 - 主廚推薦)', 'zh-TW': '三分熟 (Medium Rare - 主廚推薦)', 'ja': 'ミディアムレア (3分 - おすすめ)' },
        priceDelta: 0,
        isDefault: true,
      },
      {
        id: 'medium',
        label: { 'en': 'Medium (五分熟)', 'zh-TW': '五分熟 (Medium)', 'ja': 'ミディアム (5分)' },
        priceDelta: 0,
      },
      {
        id: 'medium_well',
        label: { 'en': 'Medium Well (七分熟)', 'zh-TW': '七分熟 (Medium Well)', 'ja': 'ミディアムウェル (7分)' },
        priceDelta: 0,
      },
      {
        id: 'well_done',
        label: { 'en': 'Well Done (全熟)', 'zh-TW': '全熟 (Well Done)', 'ja': 'ウェルダン (全熟)' },
        priceDelta: 0,
      },
    ],
  },

  // 3. 飲料冰量選擇 (Drink Ice Level) - Single Choice (Drinks only)
  {
    id: 'drink_ice',
    title: {
      'en': '🧊 Drinks Ice & Temperature',
      'zh-TW': '🧊 飲料冰塊與溫度選擇',
      'ja': '🧊 ドリンクの氷・温度設定',
    },
    type: 'single',
    target: 'drinks_ice',
    icon: 'Snowflake',
    description: {
      'en': 'Choose exactly one ice/temperature level for your beverage.',
      'zh-TW': '單選飲料之冰量或冷熱溫度設定。',
      'ja': 'ドリンクの氷の量または温冷を1つ選択。',
    },
    isActive: true,
    options: [
      {
        id: 'regular_ice',
        label: { 'en': 'Regular Ice (正常冰)', 'zh-TW': '正常冰 (Regular Ice)', 'ja': '氷普通 (Regular Ice)' },
        priceDelta: 0,
        isDefault: true,
      },
      {
        id: 'less_ice',
        label: { 'en': 'Less Ice (少冰 70%)', 'zh-TW': '少冰 (70% 冰)', 'ja': '氷少なめ (Less Ice)' },
        priceDelta: 0,
      },
      {
        id: 'micro_ice',
        label: { 'en': 'Micro Ice (微冰 30%)', 'zh-TW': '微冰 (30% 冰)', 'ja': '氷極少 (Micro Ice)' },
        priceDelta: 0,
      },
      {
        id: 'no_ice_cold',
        label: { 'en': 'No Ice / Chilled (去冰-冷飲)', 'zh-TW': '去冰 (冷飲)', 'ja': '氷なし・コールド (No Ice)' },
        priceDelta: 0,
      },
      {
        id: 'room_temp',
        label: { 'en': 'Room Temperature (常溫)', 'zh-TW': '常溫', 'ja': '常温 (Room Temp)' },
        priceDelta: 0,
      },
      {
        id: 'hot_drink',
        label: { 'en': 'Hot Beverage (熱飲溫熱)', 'zh-TW': '熱飲 (溫熱)', 'ja': 'ホット (Hot)' },
        priceDelta: 0,
      },
    ],
  },

  // 4. 飲料甜度選擇 (Drink Sweetness Level) - Single Choice (Drinks only)
  {
    id: 'drink_sweetness',
    title: {
      'en': '🍯 Drinks Sweetness Level',
      'zh-TW': '🍯 飲料甜度選擇',
      'ja': '🍯 ドリンクの甘さ調整',
    },
    type: 'single',
    target: 'drinks_sugar',
    icon: 'Droplet',
    description: {
      'en': 'Choose exactly one sweetness level for your beverage.',
      'zh-TW': '單選飲料之甜度比例。',
      'ja': 'ドリンクの甘さを1つ選択。',
    },
    isActive: true,
    options: [
      {
        id: 'sugar_100',
        label: { 'en': 'Regular Sugar 100% (全糖/正常)', 'zh-TW': '正常糖 (100% 全糖)', 'ja': '甘さ普通 (100%)' },
        priceDelta: 0,
      },
      {
        id: 'sugar_70',
        label: { 'en': 'Less Sugar 70% (少糖)', 'zh-TW': '少糖 (70% 甜度)', 'ja': '甘さ少なめ (70%)' },
        priceDelta: 0,
      },
      {
        id: 'sugar_50',
        label: { 'en': 'Half Sugar 50% (半糖)', 'zh-TW': '半糖 (50% 甜度)', 'ja': '甘さ半分 (50%)' },
        priceDelta: 0,
        isDefault: true,
      },
      {
        id: 'sugar_30',
        label: { 'en': 'Low Sugar 30% (微糖)', 'zh-TW': '微糖 (30% 甜度)', 'ja': '微糖 (30%)' },
        priceDelta: 0,
      },
      {
        id: 'sugar_0',
        label: { 'en': 'No Added Sugar 0% (無糖)', 'zh-TW': '無糖 (0% 無添加糖)', 'ja': '無糖 (0%)' },
        priceDelta: 0,
      },
    ],
  },

  // 5. 鮮奶與植物奶更換 (Milk & Plant Milk Alternatives) - Single Choice (Milk Drinks only)
  {
    id: 'drink_milk',
    title: {
      'en': '🥛 Milk & Plant-Based Milk Substitutes',
      'zh-TW': '🥛 鮮奶與植物奶更換',
      'ja': '🥛 ミルク・植物性ミルク変更',
    },
    type: 'single',
    target: 'drinks_milk',
    icon: 'Coffee',
    description: {
      'en': 'Select preferred dairy or organic plant-based milk.',
      'zh-TW': '可更換有機燕麥奶、加州杏仁奶或濃醇椰奶。',
      'ja': 'オーツミルクやアーモンドミルクへの変更。',
    },
    isActive: true,
    options: [
      {
        id: 'milk_whole',
        label: { 'en': 'Fresh Whole Milk (全脂鮮奶)', 'zh-TW': '全脂純鮮奶 (Whole Milk)', 'ja': '全脂牛乳 (標準)' },
        priceDelta: 0.0,
        isDefault: true,
      },
      {
        id: 'milk_oat',
        label: { 'en': 'Organic Oat Milk (換有機燕麥奶)', 'zh-TW': '換有機燕麥奶 (Oat Milk)', 'ja': 'オーツミルクに変更' },
        priceDelta: 1.0,
      },
      {
        id: 'milk_almond',
        label: { 'en': 'California Almond Milk (換加州杏仁奶)', 'zh-TW': '換加州杏仁奶 (Almond Milk)', 'ja': 'アーモンドミルクに変更' },
        priceDelta: 1.0,
      },
      {
        id: 'milk_coconut',
        label: { 'en': 'Creamy Coconut Milk (換濃醇椰奶)', 'zh-TW': '換濃醇椰奶 (Coconut Milk)', 'ja': 'ココナッツミルクに変更' },
        priceDelta: 1.0,
      },
    ],
  },

  // 6. 辛香料與飲食忌口特製 (Dietary & Spice Exclusion) - Multiple Choice (All savory food EXCEPT dessert & drinks)
  {
    id: 'dietary_savory',
    title: {
      'en': '🌿 Ingredients & Dietary Preferences',
      'zh-TW': '🌿 辛香料與飲食忌口特製',
      'ja': '🌿 薬味・アレルギー・特製要望',
    },
    type: 'multiple',
    target: 'dietary_savory',
    icon: 'ShieldCheck',
    description: {
      'en': 'Multi-select preparation preferences. Excluded from desserts and drinks.',
      'zh-TW': '可複選廚房備餐客製需求（甜點與飲品除外自動排除）。',
      'ja': '複数選択可能。デザートとお飲み物以外のすべての料理に対応。',
    },
    isActive: true,
    options: [
      {
        id: 'no_cilantro',
        label: { 'en': 'No Cilantro / Coriander (去香菜)', 'zh-TW': '去香菜 (No Cilantro)', 'ja': 'パクチー抜き' },
        priceDelta: 0,
      },
      {
        id: 'no_onion',
        label: { 'en': 'No Onion (去洋蔥)', 'zh-TW': '去洋蔥 (No Onion)', 'ja': '玉ねぎ抜き' },
        priceDelta: 0,
      },
      {
        id: 'no_garlic',
        label: { 'en': 'No Garlic (去大蒜/蒜碎)', 'zh-TW': '去大蒜 (No Garlic)', 'ja': 'ニンニク抜き' },
        priceDelta: 0,
      },
      {
        id: 'no_scallions',
        label: { 'en': 'No Scallions / Green Onions (去蔥花)', 'zh-TW': '去青蔥/蔥花 (No Scallions)', 'ja': 'ネギ抜き' },
        priceDelta: 0,
      },
      {
        id: 'sauce_on_side',
        label: { 'en': 'Sauce on Side / Separated (醬汁分裝另附)', 'zh-TW': '醬汁分開另附 (Sauce on Side)', 'ja': 'ソース別添え' },
        priceDelta: 0,
      },
      {
        id: 'no_peanuts',
        label: { 'en': 'No Peanuts / Tree Nuts (去花生/堅果)', 'zh-TW': '去花生/堅果 (No Nuts)', 'ja': 'ナッツ抜き' },
        priceDelta: 0,
      },
      {
        id: 'less_salt',
        label: { 'en': 'Less Salt / Low Sodium (少鹽/清淡調味)', 'zh-TW': '少鹽/清淡調味 (Low Sodium)', 'ja': '減塩・薄味' },
        priceDelta: 0,
      },
      {
        id: 'no_cheese',
        label: { 'en': 'No Cheese / Dairy (去起司/去奶酪)', 'zh-TW': '去起司 (No Cheese)', 'ja': 'チーズ抜き' },
        priceDelta: 0,
      },
      {
        id: 'vegetarian_prep',
        label: { 'en': 'Vegetarian Prep (蛋奶素/蔬食特製)', 'zh-TW': '素食/蔬食特製 (Vegetarian)', 'ja': 'ベジタリアン対応' },
        priceDelta: 0,
      },
      {
        id: 'gluten_free_prep',
        label: { 'en': 'Gluten-Free Prep (無麩質特製備餐)', 'zh-TW': '無麩質特製 (Gluten-Free Prep)', 'ja': 'グルテンフリー対応' },
        priceDelta: 0,
      },
      {
        id: 'takeaway_box',
        label: { 'en': 'Pack in Takeaway Box (附外帶打包盒)', 'zh-TW': '附外帶打包盒 (Takeaway Box)', 'ja': 'テイクアウト容器希望' },
        priceDelta: 0,
      },
    ],
  },

  // 7. 醬料與配醬調整 (Sauces & Dips Preference) - Multiple Choice
  {
    id: 'sauces_preference',
    title: {
      'en': '🥫 Sauces & Dips Selection',
      'zh-TW': '🥫 醬料與配醬調整',
      'ja': '🥫 ソース・ディップの調整',
    },
    type: 'multiple',
    target: 'sauces',
    icon: 'Utensils',
    description: {
      'en': 'Select artisanal house sauces and dressings.',
      'zh-TW': '加選特製主廚手工醬汁或調整醬料份量。',
      'ja': '特製ソースや追加ディップの選択。',
    },
    isActive: true,
    options: [
      {
        id: 'sauce_truffle_aioli',
        label: { 'en': 'Signature Truffle Aioli (加招牌松露蒜香美乃滋)', 'zh-TW': '加招牌黑松露蒜香美乃滋', 'ja': '特製トリュフアイオリ追加' },
        priceDelta: 1.5,
      },
      {
        id: 'sauce_chipotle_crema',
        label: { 'en': 'Smoked Chipotle Crema (加煙燻墨西哥辣椒酸奶醬)', 'zh-TW': '加煙燻墨西哥辣椒酸奶醬', 'ja': 'スモークチポトレソース追加' },
        priceDelta: 1.0,
      },
      {
        id: 'sauce_chimichurri',
        label: { 'en': 'House Chimichurri (加大蒜阿根廷香草青醬)', 'zh-TW': '加大蒜阿根廷香草青醬', 'ja': 'チミチュリソース追加' },
        priceDelta: 1.5,
      },
      {
        id: 'sauce_smokey_bbq',
        label: { 'en': 'Smokey Hickory BBQ (加美式煙燻BBQ醬)', 'zh-TW': '加美式煙燻BBQ醬', 'ja': 'スモーキーBBQソース追加' },
        priceDelta: 1.0,
      },
      {
        id: 'sauce_ranch',
        label: { 'en': 'Buttermilk Herb Ranch (加自製鄉村牧場醬)', 'zh-TW': '加自製鄉村牧場醬', 'ja': '自家製ランチドレッシング追加' },
        priceDelta: 1.0,
      },
      {
        id: 'sauce_tomatillo_salsa',
        label: { 'en': 'Charred Tomatillo Salsa (加炭香綠番茄莎莎)', 'zh-TW': '加炭香綠番茄莎莎', 'ja': 'トマティーヨサルサ追加' },
        priceDelta: 1.0,
      },
      {
        id: 'sauce_less',
        label: { 'en': 'Less Sauce on dish (料理醬料減半)', 'zh-TW': '料理醬料減半 (Less Sauce)', 'ja': 'ソース少なめ' },
        priceDelta: 0,
      },
      {
        id: 'sauce_none',
        label: { 'en': 'No Sauce on dish (料理完全不加醬)', 'zh-TW': '完全不加醬 (No Sauce)', 'ja': 'ソースなし' },
        priceDelta: 0,
      },
    ],
  },

  // 8. 額外豪華加配料 (Extra Luxury Toppings) - Multiple Choice with Fees
  {
    id: 'extra_toppings',
    title: {
      'en': '🧀 Extra Luxury Toppings & Add-ons',
      'zh-TW': '🧀 額外豪華加配料 (付費加料)',
      'ja': '🧀 贅沢トッピング追加 (有料)',
    },
    type: 'multiple',
    target: 'toppings',
    icon: 'PlusCircle',
    description: {
      'en': 'Elevate your dish with gourmet add-ons and toppings.',
      'zh-TW': '可複選升級奢華加料（依項目計費）。',
      'ja': '料理をアップグレードする贅沢な追加トッピング。',
    },
    isActive: true,
    options: [
      {
        id: 'top_crispy_bacon',
        label: { 'en': 'Crispy Smoked Bacon (加特級香脆厚切培根)', 'zh-TW': '加特級香脆厚切培根', 'ja': '厚切りカリカリベーコン追加' },
        priceDelta: 2.5,
      },
      {
        id: 'top_sunny_egg',
        label: { 'en': 'Sunny-Side Fried Egg (加太陽流心煎蛋)', 'zh-TW': '加太陽流心煎蛋', 'ja': '半熟目玉焼き追加' },
        priceDelta: 1.5,
      },
      {
        id: 'top_truffle_oil',
        label: { 'en': 'Truffle Shavings & White Truffle Oil (加現刨黑松露油)', 'zh-TW': '加現刨黑松露油與松露片', 'ja': 'トリュフスライス＆オイル追加' },
        priceDelta: 4.5,
      },
      {
        id: 'top_guacamole',
        label: { 'en': 'Artisanal Fresh Guacamole (加手作新鮮酪梨醬)', 'zh-TW': '加主廚手作新鮮酪梨醬', 'ja': '特製フレッシュワカモレ追加' },
        priceDelta: 2.5,
      },
      {
        id: 'top_melted_cheddar',
        label: { 'en': 'Melted Aged Cheddar (加陳年熔岩切達起司)', 'zh-TW': '加陳年熔岩切達起司', 'ja': 'とろける濃厚チェダー追加' },
        priceDelta: 1.8,
      },
      {
        id: 'top_jalapeno_crisps',
        label: { 'en': 'Crispy Jalapeño Fries (加香脆墨西哥辣椒片)', 'zh-TW': '加香脆墨西哥辣椒片', 'ja': 'クリスピーハラペーニョ追加' },
        priceDelta: 1.2,
      },
      {
        id: 'top_garlic_mushrooms',
        label: { 'en': 'Sautéed Garlic Wild Mushrooms (加蒜炒野生蕈菇)', 'zh-TW': '加蒜炒野生蕈菇', 'ja': 'ガーリックきのこソテー追加' },
        priceDelta: 3.0,
      },
      {
        id: 'top_tiger_prawn',
        label: { 'en': 'Grilled Tiger Prawn Skewer (加炙烤黑虎大蝦串)', 'zh-TW': '加炙烤黑虎大蝦串', 'ja': 'グリル大エビ串追加' },
        priceDelta: 4.5,
      },
    ],
  },
];

const STORAGE_KEY = 'pos_customization_groups_v2';

export function getCustomizationGroups(): CustomizationGroup[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: CustomizationGroup[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all required core groups exist
        const existingIds = new Set(parsed.map(g => g.id));
        const missing = INITIAL_CUSTOMIZATION_GROUPS.filter(g => !existingIds.has(g.id));
        if (missing.length > 0) {
          const combined = [...parsed, ...missing];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
          return combined;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading customization groups:', e);
  }
  return INITIAL_CUSTOMIZATION_GROUPS;
}

export function saveCustomizationGroups(groups: CustomizationGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    window.dispatchEvent(new CustomEvent('customization_groups_updated', { detail: groups }));
  } catch (e) {
    console.error('Error saving customization groups:', e);
  }
}

/**
 * Intelligent filter: determines which customization groups are applicable for a given dish.
 *
 * Rules:
 * 1. Drinks:
 *    - MUST include: drink_ice, drink_sweetness
 *    - MUST include: drink_milk (if coffee, latte, tea, matcha, chocolate, horchata, or mocha)
 *    - MUST include: sizes_portion
 *    - MUST NOT include: steak_doneness, dietary_savory (辛香料忌口), sauces, toppings
 * 2. Desserts:
 *    - MUST NOT include: dietary_savory (辛香料忌口), drink_ice, drink_sweetness, steak_doneness
 *    - May include: sizes_portion
 * 3. Meats / Steaks / Burgers:
 *    - MUST include: steak_doneness (single choice)
 *    - MUST include: sizes_portion, dietary_savory, sauces, toppings
 *    - MUST NOT include: drink_ice, drink_sweetness, drink_milk
 * 4. General Savory Food (Starters, Mains, Fries, Combos, Others):
 *    - MUST include: sizes_portion (portion size)
 *    - MUST include: dietary_savory (🌿 辛香料與飲食忌口特製 - multi-select)
 *    - MUST include: sauces, toppings
 *    - MUST NOT include: drink_ice, drink_sweetness, drink_milk
 */
export function getApplicableGroupsForItem(
  item: { category?: string; name: string; description?: string } | null,
  allGroups: CustomizationGroup[] = getCustomizationGroups()
): CustomizationGroup[] {
  if (!item) return [];

  const cat = (item.category || '').toLowerCase();
  const name = item.name.toLowerCase();
  const desc = (item.description || '').toLowerCase();

  const isDrink =
    cat === 'drinks' ||
    name.includes('飲') ||
    name.includes('特調') ||
    name.includes('茶') ||
    name.includes('咖啡') ||
    name.includes('拿鐵') ||
    name.includes('氣泡') ||
    name.includes('啤酒') ||
    name.includes('調酒') ||
    name.includes('奶昔') ||
    name.includes('可樂') ||
    name.includes('drink') ||
    name.includes('tea') ||
    name.includes('coffee') ||
    name.includes('latte') ||
    name.includes('brew') ||
    name.includes('paloma') ||
    name.includes('mezcal') ||
    name.includes('bourbon') ||
    name.includes('shake');

  const isMilkDrink =
    isDrink &&
    (name.includes('拿鐵') ||
      name.includes('奶') ||
      name.includes('咖啡') ||
      name.includes('抹茶') ||
      name.includes('可可') ||
      name.includes('latte') ||
      name.includes('coffee') ||
      name.includes('matcha') ||
      name.includes('horchata') ||
      name.includes('milk') ||
      name.includes('cold brew'));

  const isDessert =
    cat === 'desserts' ||
    name.includes('蛋糕') ||
    name.includes('甜點') ||
    name.includes('冰淇淋') ||
    name.includes('提拉米蘇') ||
    name.includes('奶酪') ||
    name.includes('吉拿棒') ||
    name.includes('cake') ||
    name.includes('churros') ||
    name.includes('dessert') ||
    name.includes('cookie') ||
    name.includes('pudding');

  const isMeatOrSteak =
    name.includes('牛排') ||
    name.includes('牛') ||
    name.includes('戰斧') ||
    name.includes('肉排') ||
    name.includes('漢堡') ||
    name.includes('肉') ||
    name.includes('豬肋排') ||
    name.includes('羊排') ||
    name.includes('birria') ||
    name.includes('carne asada') ||
    name.includes('steak') ||
    name.includes('burger') ||
    name.includes('beef') ||
    name.includes('tomahawk') ||
    name.includes('brisket') ||
    name.includes('smashburger') ||
    name.includes('ribs') ||
    desc.includes('熟度') ||
    desc.includes('三分熟');

  return allGroups.filter(group => {
    if (group.isActive === false) return false;

    // Drinks logic
    if (isDrink) {
      if (group.target === 'drinks_ice' || group.target === 'drinks_sugar') return true;
      if (group.target === 'drinks_milk') return isMilkDrink;
      if (group.target === 'sizes') return true;
      // Prohibit all food customizations on drinks
      return false;
    }

    // Desserts logic
    if (isDessert) {
      if (group.target === 'sizes') return true;
      if (group.target === 'toppings') return false; // Or customized if needed
      // Strictly exclude dietary savory, drinks, meat doneness
      return false;
    }

    // Savory Food / Dishes / Fries / Mains / Starters
    if (group.target === 'sizes') return true;
    if (group.target === 'dietary_savory') return true; // 🌿 辛香料與飲食忌口特製 appears on ALL food except dessert and drinks!
    if (group.target === 'meats') return isMeatOrSteak;
    if (group.target === 'sauces') return true;
    if (group.target === 'toppings') return true;

    // Never show drink ice/sweetness/milk on food!
    if (group.target === 'drinks_ice' || group.target === 'drinks_sugar' || group.target === 'drinks_milk') {
      return false;
    }

    return group.target === 'all';
  });
}
