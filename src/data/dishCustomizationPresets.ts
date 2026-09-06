import { Language } from '../i18n/translations';
import { safeGetItem, safeSetItem } from '../utils/storage';

export type SelectionType = 'single' | 'multiple';

export type CustomizationTarget =
  | 'sizes'                     // Portion sizes with price deltas (+$3.50 / -$1.50)
  | 'meats'                     // Meat / Steak / Burger Doneness (single choice)
  | 'drinks_ice'                // Drink ice level (single choice)
  | 'drinks_sugar'              // Drink sweetness level (single choice)
  | 'drinks_milk'               // Drink milk substitution (single choice)
  | 'soup_dietary'              // 🥣 湯品風味與備餐特製
  | 'soup_addons'               // 🥖 湯品專屬配料加點 (麵包/松露油/起司)
  | 'salad_dietary'             // 🥗 沙拉醬汁與備餐特製
  | 'salad_addons'              // 🥑 沙拉頂級蛋白質加料
  | 'pasta_dietary'             // 🍝 麵食與燉飯備餐特製
  | 'pasta_addons'              // 🧀 麵食與燉飯專屬加料
  | 'dietary_savory'            // 🌿 辛香料與飲食忌口特製 (Burgers, mains, fries)
  | 'sauces'                    // 🥫 蘸醬與配醬 (Fries, burgers, wings, grills)
  | 'toppings'                  // 🧀 漢堡與炸物豪華加料
  | 'all';                      // Universal

export interface CustomizationOption {
  id: string;
  label: Record<Language, string>;
  priceDelta?: number; // e.g. +3.50, -1.50, +2.50, 0
  isDefault?: boolean;
  disabled?: boolean;
  badge?: Record<Language, string>;
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

export interface CulinaryProfile {
  categoryType: 'soup' | 'salad' | 'burger_sandwich' | 'steak_grill' | 'pasta_risotto' | 'fries_sides' | 'dessert' | 'drink' | 'general_savory';
  badgeTitle: Record<Language, string>;
  kitchenNotice?: Record<Language, string>;
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

  // 6. 🥣 湯品專屬特製與飲食忌口 (Soup Dietary & Kitchen Prep)
  {
    id: 'soup_dietary_pref',
    title: {
      'en': '🥣 Soup Flavors & Preparation Preferences',
      'zh-TW': '🥣 湯品風味與備餐特製',
      'ja': '🥣 スープ風味・仕込み調整',
    },
    type: 'multiple',
    target: 'soup_dietary',
    icon: 'ShieldCheck',
    description: {
      'en': 'Kitchen customizations for soups and chowders. Note: Onions/garlic are simmered into broth base.',
      'zh-TW': '湯品專屬備餐調整。提示：濃湯底料熬煮已融入洋蔥蒜香，無法濾除。',
      'ja': 'スープ専用のご要望。注：玉ねぎ等の香味野菜は出汁に煮込まれております。',
    },
    isActive: true,
    options: [
      {
        id: 'soup_no_herb_garnish',
        label: { 'en': 'No Herb/Parsley Garnish (去香草/巴西里碎)', 'zh-TW': '去香草點綴 (No Herb Garnish)', 'ja': 'パセリ・ハーブ飾り抜き' },
        priceDelta: 0,
      },
      {
        id: 'soup_no_cream_swirl',
        label: { 'en': 'No Cream Drizzle (不淋鮮奶油拉花)', 'zh-TW': '不淋鮮奶油拉花 (No Cream Swirl)', 'ja': '生クリームかけなし' },
        priceDelta: 0,
      },
      {
        id: 'soup_no_black_pepper',
        label: { 'en': 'No Black Pepper (不加黑胡椒粒)', 'zh-TW': '不加現磨黑胡椒 (No Black Pepper)', 'ja': '黒胡椒抜き' },
        priceDelta: 0,
      },
      {
        id: 'soup_low_salt',
        label: { 'en': 'Lighter Flavor / Low Salt (清淡少鹽調味)', 'zh-TW': '清淡少鹽 (Low Salt / Lighter)', 'ja': '薄味仕立て' },
        priceDelta: 0,
      },
      {
        id: 'soup_extra_hot',
        label: { 'en': 'Extra Piping Hot (加強滾燙出餐)', 'zh-TW': '加強滾燙出餐 (Piping Hot)', 'ja': '熱々で提供' },
        priceDelta: 0,
      },
      {
        id: 'soup_takeaway_container',
        label: { 'en': 'Pack in Soup Takeaway Bowl (附耐熱外帶湯碗)', 'zh-TW': '附耐熱外帶湯碗 (Soup Takeaway Cup)', 'ja': 'テイクアウト用耐熱容器' },
        priceDelta: 0,
      },
    ],
  },

  // 7. 🥖 湯品專屬主廚加料 (Soup Gourmet Add-ons)
  {
    id: 'soup_gourmet_addons',
    title: {
      'en': '🥖 Soup Gourmet Bread & Luxury Add-ons',
      'zh-TW': '🥖 湯品專屬麵包與奢華加料',
      'ja': '🥖 スープ専用ブレッド＆トッピング追加',
    },
    type: 'multiple',
    target: 'soup_addons',
    icon: 'PlusCircle',
    description: {
      'en': 'Pair artisan crostini, bread bowls, or truffle oil with your soup.',
      'zh-TW': '搭配現烤香蒜脆法棍、舊金山酸種麵包碗或現淋黑松露油。',
      'ja': 'ガーリックラスクやブレッドボウル、トリュフオイルの追加。',
    },
    isActive: true,
    options: [
      {
        id: 'soup_add_garlic_crostini',
        label: { 'en': 'Toasted Garlic Herb Crostini (附現烤香蒜脆法棍 2片)', 'zh-TW': '附現烤香蒜脆法棍 (2片)', 'ja': 'ガーリックトースト2枚追加' },
        priceDelta: 1.5,
      },
      {
        id: 'soup_add_bread_bowl',
        label: { 'en': 'Upgrade to Sourdough Bread Bowl (升級舊金山酸種麵包碗)', 'zh-TW': '升級舊金山酸種麵包碗', 'ja': 'サワードウ・ブレッドボウルに変更' },
        priceDelta: 3.0,
      },
      {
        id: 'soup_add_truffle_oil',
        label: { 'en': 'Drizzle Extra White Truffle Oil (現淋頂級白松露油)', 'zh-TW': '現淋頂級白松露油', 'ja': '白トリュフオイル追加' },
        priceDelta: 2.0,
      },
      {
        id: 'soup_add_parmesan',
        label: { 'en': 'Extra Shaved Aged Parmesan (加現刨陳年帕瑪森起司)', 'zh-TW': '加現刨陳年帕瑪森起司', 'ja': '削りたてパルメザン追加' },
        priceDelta: 1.2,
      },
    ],
  },

  // 8. 🥗 沙拉醬汁與飲食特製 (Salad Dressing & Dietary Prep)
  {
    id: 'salad_dietary_pref',
    title: {
      'en': '🥗 Salad Dressing & Dietary Preferences',
      'zh-TW': '🥗 沙拉醬汁與備餐特製',
      'ja': '🥗 サラダドレッシング・特製要望',
    },
    type: 'multiple',
    target: 'salad_dietary',
    icon: 'ShieldCheck',
    description: {
      'en': 'Customize salad dressing style and allergy preferences.',
      'zh-TW': '可選醬汁分裝、去洋蔥或無麩質備餐。',
      'ja': 'ドレッシング別添えやアレルギー要望の選択。',
    },
    isActive: true,
    options: [
      {
        id: 'salad_dressing_on_side',
        label: { 'en': 'Dressing on the Side / Ramekin (沙拉醬分裝另附)', 'zh-TW': '沙拉醬分裝另附 (Dressing on Side)', 'ja': 'ドレッシング別添え' },
        priceDelta: 0,
      },
      {
        id: 'salad_no_onion',
        label: { 'en': 'No Raw Red Onions (去紫洋蔥絲)', 'zh-TW': '去紫洋蔥絲 (No Red Onion)', 'ja': '赤玉ねぎ抜き' },
        priceDelta: 0,
      },
      {
        id: 'salad_no_croutons',
        label: { 'en': 'No Bread Croutons (去烤麵包丁 - 無麩質)', 'zh-TW': '去烤麵包丁 (No Croutons - 無麩質)', 'ja': 'クルトン抜き (グルテンフリー)' },
        priceDelta: 0,
      },
      {
        id: 'salad_no_cheese',
        label: { 'en': 'No Cheese / Dairy (去起司乳酪碎)', 'zh-TW': '去起司 (No Cheese)', 'ja': 'チーズ抜き' },
        priceDelta: 0,
      },
      {
        id: 'salad_extra_dressing',
        label: { 'en': 'Extra Dressing Cup (多附一份沙拉醬)', 'zh-TW': '多附一份沙拉醬 (Extra Dressing)', 'ja': 'ドレッシング追加' },
        priceDelta: 0.8,
      },
    ],
  },

  // 9. 🥑 沙拉頂級蛋白質加料 (Salad Gourmet Protein Add-ons)
  {
    id: 'salad_gourmet_addons',
    title: {
      'en': '🥑 Salad Gourmet Protein & Luxury Add-ons',
      'zh-TW': '🥑 沙拉頂級蛋白質與奢華加料',
      'ja': '🥑 サラダ追加プロテイン・トッピング',
    },
    type: 'multiple',
    target: 'salad_addons',
    icon: 'PlusCircle',
    description: {
      'en': 'Add premium grilled proteins and toppings to salads.',
      'zh-TW': '加點嫩煎舒肥雞胸、炙烤黑虎蝦或新鮮酪梨醬。',
      'ja': 'グリルチキンや大エビ、アボカドのトッピング追加。',
    },
    isActive: true,
    options: [
      {
        id: 'salad_add_grilled_chicken',
        label: { 'en': 'Grilled Herb Chicken Breast (加嫩煎香草舒肥雞胸肉)', 'zh-TW': '加嫩煎香草舒肥雞胸肉', 'ja': 'グリルチキン追加' },
        priceDelta: 3.5,
      },
      {
        id: 'salad_add_tiger_prawn',
        label: { 'en': 'Grilled Tiger Prawn Skewer (加炙烤黑虎大蝦串 2隻)', 'zh-TW': '加炙烤黑虎大蝦串 (2隻)', 'ja': '大エビ串焼き追加' },
        priceDelta: 4.5,
      },
      {
        id: 'salad_add_guacamole',
        label: { 'en': 'Fresh Artisanal Guacamole (加主廚手作酪梨醬)', 'zh-TW': '加手作新鮮酪梨醬', 'ja': '特製ワカモレ追加' },
        priceDelta: 2.5,
      },
      {
        id: 'salad_add_parmesan',
        label: { 'en': 'Extra Shaved Parmigiano (加現刨帕瑪森起司碎)', 'zh-TW': '加現刨帕瑪森起司碎', 'ja': 'パルメザン増量' },
        priceDelta: 1.5,
      },
    ],
  },

  // 10. 🍝 義大利麵與燉飯特製 (Pasta & Risotto Dietary Prep)
  {
    id: 'pasta_dietary_pref',
    title: {
      'en': '🍝 Pasta & Risotto Preparation Preferences',
      'zh-TW': '🍝 義大利麵與燉飯備餐特製',
      'ja': '🍝 パスタ・リゾット仕込み調整',
    },
    type: 'multiple',
    target: 'pasta_dietary',
    icon: 'ShieldCheck',
    description: {
      'en': 'Customizations for pasta & risotto dishes. Note: Risotto stock is pre-cooked with shallots & wine.',
      'zh-TW': '麵食與燉飯專屬備餐調整。提示：燉飯高湯熬煮已含紅蔥頭與白酒。',
      'ja': 'パスタとリゾットの調整。注：リゾットのスープにはエシャロットが含まれています。',
    },
    isActive: true,
    options: [
      {
        id: 'pasta_al_dente',
        label: { 'en': 'Al Dente Firm Pasta (麵條彈牙偏硬)', 'zh-TW': '麵條正統彈牙 (Al Dente)', 'ja': '麺固め (アルデンテ)' },
        priceDelta: 0,
      },
      {
        id: 'pasta_well_done',
        label: { 'en': 'Softer Pasta Texture (麵條偏軟透熟)', 'zh-TW': '麵條偏軟熟透 (Softer)', 'ja': '麺柔らかめ' },
        priceDelta: 0,
      },
      {
        id: 'pasta_no_black_pepper',
        label: { 'en': 'No Black Pepper (不加黑胡椒)', 'zh-TW': '不加黑胡椒 (No Black Pepper)', 'ja': '黒胡椒抜き' },
        priceDelta: 0,
      },
      {
        id: 'pasta_no_parsley',
        label: { 'en': 'No Parsley Herb (去巴西里/香草葉)', 'zh-TW': '去新鮮香草葉 (No Parsley)', 'ja': 'パセリ抜き' },
        priceDelta: 0,
      },
      {
        id: 'pasta_low_salt',
        label: { 'en': 'Low Sodium / Light Salt (少鹽清淡)', 'zh-TW': '少鹽清淡 (Low Sodium)', 'ja': '減塩・薄味' },
        priceDelta: 0,
      },
      {
        id: 'pasta_gluten_free',
        label: { 'en': 'Gluten-Free Pasta Substitute (換無麩質義大利麵)', 'zh-TW': '換無麩質義大利麵 (GF Pasta)', 'ja': 'グルテンフリーパスタに変更' },
        priceDelta: 2.0,
      },
    ],
  },

  // 11. 🧀 麵食與燉飯專屬加料 (Pasta & Risotto Add-ons)
  {
    id: 'pasta_gourmet_addons',
    title: {
      'en': '🧀 Pasta & Risotto Gourmet Add-ons',
      'zh-TW': '🧀 義大利麵與燉飯主廚加料',
      'ja': '🧀 パスタ・リゾット贅沢トッピング追加',
    },
    type: 'multiple',
    target: 'pasta_addons',
    icon: 'PlusCircle',
    description: {
      'en': 'Upgrade pasta and risotto with gourmet mushrooms, prawns, or truffles.',
      'zh-TW': '加點現刨帕瑪森乾酪、蒜炒野生蕈菇、炙烤黑虎大蝦或黑松露片。',
      'ja': 'パルメザン増量、キノコソテー、大エビやトリュフの追加。',
    },
    isActive: true,
    options: [
      {
        id: 'pasta_add_parmigiano',
        label: { 'en': 'Extra Aged Parmigiano-Reggiano (加現刨頂級帕瑪森起司)', 'zh-TW': '加現刨頂級帕瑪森起司', 'ja': 'パルミジャーノ増量' },
        priceDelta: 1.5,
      },
      {
        id: 'pasta_add_garlic_mushrooms',
        label: { 'en': 'Sautéed Garlic Wild Mushrooms (加蒜炒野生綜合蕈菇)', 'zh-TW': '加蒜炒野生綜合蕈菇', 'ja': 'きのこガーリックソテー追加' },
        priceDelta: 3.0,
      },
      {
        id: 'pasta_add_tiger_prawns',
        label: { 'en': 'Grilled Black Tiger Prawns (加炙烤黑虎大蝦 2隻)', 'zh-TW': '加炙烤黑虎大蝦 (2隻)', 'ja': 'ブラックタイガー大エビ追加' },
        priceDelta: 4.5,
      },
      {
        id: 'pasta_add_truffle_oil',
        label: { 'en': 'Black Truffle Shavings & Truffle Oil (加黑松露片與松露油)', 'zh-TW': '加黑松露片與松露油', 'ja': '黒トリュフスライス追加' },
        priceDelta: 4.5,
      },
    ],
  },

  // 12. 🌿 一般鹹食與漢堡炸物飲食忌口特製 (Dietary & Spice Exclusion)
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
      'en': 'Multi-select preparation preferences for burgers, sandwiches, and grilled dishes.',
      'zh-TW': '適用於漢堡、三明治、排餐與炸物之廚房客製需求。',
      'ja': 'バーガーやグリル料理向けのアレルギー・薬味調整。',
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
        label: { 'en': 'No Raw/Grilled Onions (去洋蔥)', 'zh-TW': '去洋蔥 (No Onion)', 'ja': '玉ねぎ抜き' },
        priceDelta: 0,
      },
      {
        id: 'no_garlic',
        label: { 'en': 'No Garlic / Garlic Butter (去大蒜/蒜碎)', 'zh-TW': '去大蒜 (No Garlic)', 'ja': 'ニンニク抜き' },
        priceDelta: 0,
      },
      {
        id: 'no_scallions',
        label: { 'en': 'No Scallions / Green Onions (去蔥花)', 'zh-TW': '去青蔥/蔥花 (No Scallions)', 'ja': 'ネギ抜き' },
        priceDelta: 0,
      },
      {
        id: 'no_pickles',
        label: { 'en': 'No Pickles / Relish (去酸黃瓜)', 'zh-TW': '去酸黃瓜 (No Pickles)', 'ja': 'ピクルス抜き' },
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
        label: { 'en': 'Gluten-Free Prep / Lettuce Wrap (無麩質/生菜包肉)', 'zh-TW': '無麩質/換生菜包肉 (Gluten-Free Wrap)', 'ja': 'グルテンフリー/レタス包み' },
        priceDelta: 0,
      },
      {
        id: 'takeaway_box',
        label: { 'en': 'Pack in Takeaway Box (附外帶打包盒)', 'zh-TW': '附外帶打包盒 (Takeaway Box)', 'ja': 'テイクアウト容器希望' },
        priceDelta: 0,
      },
    ],
  },

  // 13. 🥫 蘸醬與配醬調整 (Sauces & Dips Selection - Suitable for Fries, Wings, Burgers, Sandwiches)
  {
    id: 'sauces_preference',
    title: {
      'en': '🥫 Sauces & Dips Selection',
      'zh-TW': '🥫 蘸醬與配醬調整 (炸物/漢堡/烤肉)',
      'ja': '🥫 ディップソース選択 (フライ/バーガー/肉料理)',
    },
    type: 'multiple',
    target: 'sauces',
    icon: 'Utensils',
    description: {
      'en': 'Select artisanal house dipping sauces for fries, burgers, wings, and grills.',
      'zh-TW': '適用於薯條、炸雞翅、漢堡與烤物。以獨立 2oz 醬料盅附上。',
      'ja': 'ポテトやチキン、バーガー向けの2ozディップソース選択。',
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

  // 14. 🧀 額外豪華加配料 (Extra Luxury Toppings - Burgers, Fries, Steaks)
  {
    id: 'extra_toppings',
    title: {
      'en': '🧀 Extra Luxury Toppings & Add-ons',
      'zh-TW': '🧀 漢堡與炸物豪華加配料 (付費加料)',
      'ja': '🧀 贅沢トッピング追加 (有料)',
    },
    type: 'multiple',
    target: 'toppings',
    icon: 'PlusCircle',
    description: {
      'en': 'Elevate burgers, fries, and hearty mains with gourmet add-ons.',
      'zh-TW': '適用於漢堡、三明治與炸物。可複選升級奢華加料。',
      'ja': 'バーガーやサイドメニューをアップグレードする贅沢トッピング。',
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
    const parsed: CustomizationGroup[] = safeGetItem(STORAGE_KEY, INITIAL_CUSTOMIZATION_GROUPS);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all required core groups exist
      const existingIds = new Set(parsed.map(g => g.id));
      const missing = INITIAL_CUSTOMIZATION_GROUPS.filter(g => !existingIds.has(g.id));
      if (missing.length > 0) {
        const combined = [...parsed, ...missing];
        safeSetItem(STORAGE_KEY, combined);
        return combined;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading customization groups:', e);
  }
  return INITIAL_CUSTOMIZATION_GROUPS;
}

export function saveCustomizationGroups(groups: CustomizationGroup[]): void {
  try {
    safeSetItem(STORAGE_KEY, groups);
    window.dispatchEvent(new CustomEvent('customization_groups_updated', { detail: groups }));
  } catch (e) {
    console.error('Error saving customization groups:', e);
  }
}

/**
 * Categorizes an item by culinary domain and provides clear kitchen feasibility notices for staff.
 */
export function getItemCulinaryProfile(
  item: { id?: string; category?: string; name: string; description?: string } | null
): CulinaryProfile {
  if (!item) {
    return {
      categoryType: 'general_savory',
      badgeTitle: { 'en': '🍽️ Main Dish', 'zh-TW': '🍽️ 美饌佳餚', 'ja': '🍽️ お料理' },
    };
  }

  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const id = (item.id || '').toLowerCase();

  // 1. Drinks / Beverages
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

  if (isDrink) {
    return {
      categoryType: 'drink',
      badgeTitle: { 'en': '🍹 Beverage Item', 'zh-TW': '🍹 特調飲品', 'ja': '🍹 ドリンクメニュー' },
      kitchenNotice: {
        'en': '🍹 Bar Prep: Ice level and sweetness can be adjusted. Dairy can be substituted with organic oat/almond milk.',
        'zh-TW': '🍹 吧台出餐提示：可單選冰塊與甜度。拿鐵與奶類飲品支援更換有機燕麥奶或杏仁奶。',
        'ja': '🍹 バー提供案内：氷の量と甘さの調整が可能です。ミルク類はオーツミルク等に変更できます。',
      },
    };
  }

  // 2. Desserts
  const isDessert =
    cat === 'desserts' ||
    name.includes('蛋糕') ||
    name.includes('甜點') ||
    name.includes('冰淇淋') ||
    name.includes('提拉米蘇') ||
    name.includes('奶酪') ||
    name.includes('吉拿棒') ||
    name.includes('布丁') ||
    name.includes('cake') ||
    name.includes('churros') ||
    name.includes('dessert') ||
    name.includes('cookie') ||
    name.includes('pudding');

  if (isDessert) {
    return {
      categoryType: 'dessert',
      badgeTitle: { 'en': '🍰 Sweet Dessert', 'zh-TW': '🍰 精緻甜品', 'ja': '🍰 スイーツ・デザート' },
      kitchenNotice: {
        'en': '🍰 Pastry Prep: Desserts are freshly plated. Savory dips, spices, and meats are excluded.',
        'zh-TW': '🍰 甜品出餐提示：甜點現點現盛裝，已自動排除鹹食醬料、辛香料與肉類熟度選項。',
        'ja': '🍰 パティシエ案内：デザートは盛り付け提供です。辛味や塩味の調味料は除外されています。',
      },
    };
  }

  // 3. Soups, Broths & Chowders
  const isSoup =
    id === 'm-1' ||
    id === 'm-41' ||
    cat.includes('soup') ||
    name.includes('soup') ||
    name.includes('湯') ||
    name.includes('濃湯') ||
    name.includes('chowder') ||
    name.includes('bisque') ||
    name.includes('stew') ||
    desc.includes('濃湯') ||
    desc.includes('soup');

  if (isSoup) {
    return {
      categoryType: 'soup',
      badgeTitle: { 'en': '🥣 Soup & Chowder Item', 'zh-TW': '🥣 湯品與濃湯專區', 'ja': '🥣 スープ・チャウダー専門' },
      kitchenNotice: {
        'en': '⚠️ Kitchen Notice: Broth is pre-simmered with onions, garlic & mirepoix aromatics. The kitchen cannot filter blended onions out of soup. Burger/dipping sauces are excluded.',
        'zh-TW': '⚠️ 廚房備餐提示：濃湯底料熬煮時已融入洋蔥、蒜香與蔬菜高湯底，無法濾除湯中的洋蔥蒜味；已為您排除不適用的漢堡蘸醬與肉類配料。',
        'ja': '⚠️ 厨房仕込み案内：スープの出汁には玉ねぎ等の香味野菜が煮込まれており、玉ねぎを完全に除くことはできません。ディップソース等は除外されています。',
      },
    };
  }

  // 4. Salads
  const isSalad =
    id === 'm-3' ||
    id === 'm-17' ||
    id === 'm-44' ||
    cat === 'salads' ||
    name.includes('salad') ||
    name.includes('沙拉') ||
    name.includes('caesar') ||
    name.includes('caprese');

  if (isSalad) {
    return {
      categoryType: 'salad',
      badgeTitle: { 'en': '🥗 Fresh Garden Salad', 'zh-TW': '🥗 鮮摘花園沙拉', 'ja': '🥗 フレッシュサラダ' },
      kitchenNotice: {
        'en': '🥗 Service Tip: Dressings can be tossed or served on the side in a separate ramekin upon request.',
        'zh-TW': '🥗 備餐提示：沙拉醬汁支援「分裝另附」以保持生菜極致爽脆，可加選舒肥雞胸或黑虎蝦。',
        'ja': '🥗 提供案内：ドレッシングは別添え可能です。グリルチキン等のプロテイン追加も承ります。',
      },
    };
  }

  // 5. Pastas, Risottos & Paellas
  const isPastaOrRisotto =
    id === 'm-7' ||
    id === 'm-18' ||
    id === 'm-22' ||
    id === 'm-39' ||
    cat.includes('pasta') ||
    name.includes('pasta') ||
    name.includes('義大利麵') ||
    name.includes('risotto') ||
    name.includes('燉飯') ||
    name.includes('paella') ||
    name.includes('烤飯') ||
    name.includes('mac & cheese') ||
    name.includes('carbonara');

  if (isPastaOrRisotto) {
    return {
      categoryType: 'pasta_risotto',
      badgeTitle: { 'en': '🍝 Artisanal Pasta & Risotto', 'zh-TW': '🍝 主廚義大利麵與燉飯', 'ja': '🍝 パスタ・リゾット' },
      kitchenNotice: {
        'en': '🍝 Kitchen Notice: Risotto stock is simmered with shallots and white wine. Tailored for Parmigiano, mushrooms, and al dente prep.',
        'zh-TW': '🍝 廚房備餐提示：燉飯高湯熬煮已融入紅蔥頭與白酒香氣。已為您精選帕瑪森乾酪、蒜炒蕈菇與麵條軟硬度調整。',
        'ja': '🍝 厨房案内：リゾットの出汁にはエシャロットが含まれます。パルメザン増量やアルデンテ指定が可能です。',
      },
    };
  }

  // 6. Steaks & Chops
  const isSteakOrChop =
    id === 'm-4' ||
    id === 'm-15' ||
    id === 'm-28' ||
    name.includes('ribeye') ||
    name.includes('steak') ||
    name.includes('牛排') ||
    name.includes('tomahawk') ||
    name.includes('戰斧') ||
    name.includes('chops') ||
    name.includes('羊排') ||
    name.includes('ribs') ||
    name.includes('肋排');

  if (isSteakOrChop) {
    return {
      categoryType: 'steak_grill',
      badgeTitle: { 'en': '🥩 Premium Steak & Grill', 'zh-TW': '🥩 頂級排餐與炙烤肉品', 'ja': '🥩 プレミアムステーキ・グリル' },
      kitchenNotice: {
        'en': '🥩 Chef Note: Recommended doneness is Medium-Rare (三分熟) for optimal tenderness and marbling.',
        'zh-TW': '🥩 主廚熟度建議：推薦「三分熟 (Medium-Rare)」以品嚐頂級肉質的鮮嫩多汁與大理石油花。',
        'ja': '🥩 シェフおすすめ：お肉の柔らかさと旨味を保つため「ミディアムレア」を推奨いたします。',
      },
    };
  }

  // 7. Burgers, Sandwiches & Wraps
  const isBurgerOrSandwich =
    id === 'm-5' ||
    id === 'm-23' ||
    id === 'm-30' ||
    id === 'm-32' ||
    id === 'm-38' ||
    id === 'm-42' ||
    id === 'm-49' ||
    id === 'm-51' ||
    cat.includes('burger') ||
    cat.includes('sandwich') ||
    name.includes('burger') ||
    name.includes('漢堡') ||
    name.includes('sandwich') ||
    name.includes('三明治') ||
    name.includes('wrap') ||
    name.includes('捲餅') ||
    name.includes('cheesesteak');

  if (isBurgerOrSandwich) {
    return {
      categoryType: 'burger_sandwich',
      badgeTitle: { 'en': '🍔 Gourmet Burger & Sandwich', 'zh-TW': '🍔 手工漢堡與經典三明治', 'ja': '🍔 グルメバーガー＆サンドイッチ' },
      kitchenNotice: {
        'en': '🍔 Grill Station: Custom beef doneness, extra toppings (bacon/egg/cheddar), and sauce customizations available.',
        'zh-TW': '🍔 漢堡煎台提示：支援牛肉熟度、奢華加料（培根/煎蛋/切達起司）與去酸黃瓜/醬汁特製。',
        'ja': '🍔 バーガー案内：パティの焼き加減、ベーコン・目玉焼き等の追加トッピングに対応しております。',
      },
    };
  }

  // 8. Fries, Wings & Finger Foods
  const isFriesOrFingerFood =
    id === 'm-2' ||
    id === 'm-8' ||
    id === 'm-9' ||
    id === 'm-24' ||
    id === 'm-25' ||
    id === 'm-26' ||
    id === 'm-31' ||
    id === 'm-36' ||
    id === 'm-37' ||
    id === 'm-43' ||
    id === 'm-50' ||
    id === 'm-52' ||
    name.includes('fries') ||
    name.includes('薯條') ||
    name.includes('wings') ||
    name.includes('雞翅') ||
    name.includes('rings') ||
    name.includes('洋蔥圈') ||
    name.includes('tenders') ||
    name.includes('雞柳') ||
    name.includes('sticks') ||
    name.includes('起司條') ||
    name.includes('calamari') ||
    name.includes('魷魚') ||
    name.includes('corn dog') ||
    name.includes('熱狗') ||
    name.includes('hash brown') ||
    name.includes('薯餅');

  if (isFriesOrFingerFood) {
    return {
      categoryType: 'fries_sides',
      badgeTitle: { 'en': '🍟 Crispy Sides & Finger Food', 'zh-TW': '🍟 香脆炸物與招牌點心', 'ja': '🍟 フライ＆サイドメニュー' },
      kitchenNotice: {
        'en': '🍟 Fry Station: Dipping sauces (Truffle Aioli/Chipotle/BBQ) are served in 2oz portion cups.',
        'zh-TW': '🍟 炸物出餐提示：加選之手工蘸醬（黑松露美乃滋/煙燻BBQ/鄉村醬）均以獨立 2oz 醬料盅附上。',
        'ja': '🍟 フライ案内：追加ディップソースは2ozカップにて別添えでお付けいたします。',
      },
    };
  }

  return {
    categoryType: 'general_savory',
    badgeTitle: { 'en': '🍽️ Main Dish', 'zh-TW': '🍽️ 經典美饌', 'ja': '🍽️ お料理' },
  };
}

/**
 * Intelligent filter: determines which customization groups are applicable for a given dish based on culinary reality.
 */
export function getApplicableGroupsForItem(
  item: { id?: string; category?: string; name: string; description?: string } | null,
  allGroups: CustomizationGroup[] = getCustomizationGroups()
): CustomizationGroup[] {
  if (!item) return [];

  const profile = getItemCulinaryProfile(item);
  const type = profile.categoryType;
  const name = (item.name || '').toLowerCase();

  const isBeefBurgerOrSteak =
    name.includes('牛排') ||
    name.includes('steak') ||
    name.includes('wagyu') ||
    name.includes('和牛') ||
    name.includes('beef') ||
    name.includes('ribeye') ||
    name.includes('tomahawk') ||
    name.includes('smashburger') ||
    name.includes('burger');

  const isMilkDrink =
    type === 'drink' &&
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

  return allGroups.filter(group => {
    if (group.isActive === false) return false;

    // 1. Drinks logic
    if (type === 'drink') {
      if (group.target === 'drinks_ice' || group.target === 'drinks_sugar') return true;
      if (group.target === 'drinks_milk') return isMilkDrink;
      if (group.target === 'sizes') return true;
      return false;
    }

    // 2. Desserts logic
    if (type === 'dessert') {
      if (group.target === 'sizes') return true;
      return false;
    }

    // 3. Soups logic: NO dipping sauces, NO burger toppings! Show soup dietary and soup bread/truffle addons.
    if (type === 'soup') {
      if (group.target === 'sizes') return true;
      if (group.target === 'soup_dietary') return true;
      if (group.target === 'soup_addons') return true;
      // Strictly exclude dip sauces, burger toppings, drinks, meats
      return false;
    }

    // 4. Salads logic: Show salad dietary and salad protein add-ons.
    if (type === 'salad') {
      if (group.target === 'sizes') return true;
      if (group.target === 'salad_dietary') return true;
      if (group.target === 'salad_addons') return true;
      return false;
    }

    // 5. Pastas & Risottos logic: Show pasta dietary and pasta parmigiano/mushroom add-ons.
    if (type === 'pasta_risotto') {
      if (group.target === 'sizes') return true;
      if (group.target === 'pasta_dietary') return true;
      if (group.target === 'pasta_addons') return true;
      return false;
    }

    // 6. Steaks & Grills
    if (type === 'steak_grill') {
      if (group.target === 'sizes') return true;
      if (group.target === 'meats') return true;
      if (group.target === 'dietary_savory') return true;
      if (group.target === 'sauces') return true;
      if (group.target === 'toppings') return true;
      return false;
    }

    // 7. Burgers & Sandwiches
    if (type === 'burger_sandwich') {
      if (group.target === 'sizes') return true;
      if (group.target === 'meats') return isBeefBurgerOrSteak;
      if (group.target === 'dietary_savory') return true;
      if (group.target === 'sauces') return true;
      if (group.target === 'toppings') return true;
      return false;
    }

    // 8. Fries & Finger Foods
    if (type === 'fries_sides') {
      if (group.target === 'sizes') return true;
      if (group.target === 'dietary_savory') return true;
      if (group.target === 'sauces') return true;
      if (group.target === 'toppings') return true;
      return false;
    }

    // 9. General Savory Food
    if (group.target === 'sizes') return true;
    if (group.target === 'dietary_savory') return true;
    if (group.target === 'meats') return isBeefBurgerOrSteak;
    if (group.target === 'sauces') return true;
    if (group.target === 'toppings') return true;

    return group.target === 'all';
  });
}

