import { Language } from './translations';
import { MenuItem } from '../types';

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'All': { 'en': 'All', 'zh-TW': '全部餐點', 'ja': 'すべて' },
  'Starters': { 'en': 'Starters', 'zh-TW': '開胃前菜', 'ja': '前菜' },
  'Mains': { 'en': 'Mains', 'zh-TW': '精緻主餐', 'ja': 'メイン' },
  'Fries': { 'en': 'Fries & Sides', 'zh-TW': '炸物小點', 'ja': 'サイド' },
  'Drinks': { 'en': 'Drinks & Beverages', 'zh-TW': '特調飲品', 'ja': 'ドリンク' },
  'Desserts': { 'en': 'Desserts', 'zh-TW': '手作甜點', 'ja': 'デザート' },
  'Combos': { 'en': 'Combos & Sets', 'zh-TW': '超值套餐', 'ja': 'セット' },
};

export const DISH_NAME_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Truffle Mushroom Bruschetta': { 'en': 'Truffle Mushroom Bruschetta', 'zh-TW': '黑松露野菇普斯凱塔', 'ja': 'トリュフきのこのブルスケッタ' },
  'Crispy Calamari Rings': { 'en': 'Crispy Calamari Rings', 'zh-TW': '金黃酥炸香酥魷魚圈', 'ja': 'サクサクカラマリフライ' },
  'Caprese Salad Skewers': { 'en': 'Caprese Salad Skewers', 'zh-TW': '卡布里義式莫札瑞拉番茄串', 'ja': 'カプレーゼ串' },
  'Prime Ribeye Steak (300g)': { 'en': 'Prime Ribeye Steak (300g)', 'zh-TW': '頂級肋眼牛排 (300g)', 'ja': '極上リブアイステーキ (300g)' },
  'Artisanal Wagyu Burger': { 'en': 'Artisanal Wagyu Burger', 'zh-TW': '手作頂級和牛漢堡', 'ja': '和牛クラフトバーガー' },
  'Pan-Seared Atlantic Salmon': { 'en': 'Pan-Seared Atlantic Salmon', 'zh-TW': '香煎大西洋尊爵鮭魚排', 'ja': 'アトランティックサーモンのソテー' },
  'Classic Creamy Carbonara': { 'en': 'Classic Creamy Carbonara', 'zh-TW': '經典羅馬奶油培根蛋黃麵', 'ja': '濃厚カルボナーラ' },
  'Truffle Parmesan Fries': { 'en': 'Truffle Parmesan Fries', 'zh-TW': '黑松露帕瑪森起司薯條', 'ja': 'トリュフパルメザンポテト' },
  'Loaded Sweet Potato Fries': { 'en': 'Loaded Sweet Potato Fries', 'zh-TW': '熔岩雙起司烤地瓜條', 'ja': 'ダブルチーズさつまいもポテト' },
  'Signature Citrus Passion Mocktail': { 'en': 'Signature Citrus Passion Mocktail', 'zh-TW': '招牌百香柑橘特調氣泡飲', 'ja': 'シトラスパッションモクテル' },
  'Iced Vanilla Oat Matcha Latte': { 'en': 'Iced Vanilla Oat Matcha Latte', 'zh-TW': '靜岡香草燕麥奶抹茶拿鐵', 'ja': 'アイスバニラオーツ抹茶ラテ' },
  'Craft IPA Amber Ale': { 'en': 'Craft IPA Amber Ale', 'zh-TW': '精釀 IPA 琥珀啤酒', 'ja': 'クラフトIPAアンバーエール' },
  'Molten Belgian Chocolate Lava Cake': { 'en': 'Molten Belgian Chocolate Lava Cake', 'zh-TW': '比利時黑巧克力熔岩蛋糕', 'ja': 'ベルギーチョコフォンダンショコラ' },
  'Classic Espresso Tiramisu': { 'en': 'Classic Espresso Tiramisu', 'zh-TW': '主廚經典義式提拉米蘇', 'ja': '自家製ティラミス' },
  'Gourmet Steak & Wine Combo': { 'en': 'Gourmet Steak & Wine Combo', 'zh-TW': '豪華肋眼牛排佐紅酒套餐', 'ja': '極上ステーキ＆ワインセット' },
  'Wild Garlic & Herb Roasted Chicken': { 'en': 'Wild Garlic & Herb Roasted Chicken', 'zh-TW': '普羅旺斯大蒜香草烤半雞', 'ja': 'ガーリックハーブローストチキン' },
  'Charred Octopus & Potato Salad': { 'en': 'Charred Octopus & Potato Salad', 'zh-TW': '炭烤章魚溫洋芋沙拉', 'ja': 'タコとジャガイモのグリルサラダ' },
  'Wild Mushroom Truffle Risotto': { 'en': 'Wild Mushroom Truffle Risotto', 'zh-TW': '黑松露野菇牛肝菌燉飯', 'ja': 'ポルチーニトリュフリゾット' },
  'Smoked Jalapeño Queso Fries': { 'en': 'Smoked Jalapeño Queso Fries', 'zh-TW': '煙燻墨西哥切達起司醬薯條', 'ja': 'スモークハラペーニョポテト' },
  'Wild Berry Hibiscus Sangria': { 'en': 'Wild Berry Hibiscus Sangria', 'zh-TW': '野莓洛神花桑格利亞特調', 'ja': 'ベリーサングリアモクテル' },
  'Artisan Mango Coconut Panna Cotta': { 'en': 'Artisan Mango Coconut Panna Cotta', 'zh-TW': '手作芒果椰奶奶酪', 'ja': 'マンゴーココナッツパンナコッタ' },
  'Seafood Paella & Sangria Combo': { 'en': 'Seafood Paella & Sangria Combo', 'zh-TW': '西班牙海鮮燉飯雙人套餐', 'ja': 'シーフードパエリアセット' },
};

export const DISH_DESC_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Truffle Mushroom Bruschetta': {
    'en': 'Toasted sourdough topped with wild forest mushrooms, black truffle oil, garlic butter, and shaved parmesan.',
    'zh-TW': '烘烤香酥酸麵包，鋪滿炒野菇、黑松露油、蒜香奶油與現刨帕瑪森起司。',
    'ja': '香ばしく焼いたサワードウにきのこソテー、黒トリュフオイル、ニンニクバターを添えて。'
  },
  'Crispy Calamari Rings': {
    'en': 'Lightly battered calamari served with house-made zesty marinara and fresh lemon wedges.',
    'zh-TW': '特製薄粉酥炸新鮮魷魚圈，附主廚自製塔塔醬與新鮮檸檬角。',
    'ja': 'サクサク衣のイカフライ。自家製特製ソースとレモンを添えて。'
  },
  'Caprese Salad Skewers': {
    'en': 'Fresh mozzarella balls, sweet cherry tomatoes, and basil leaves drizzled with aged balsamic glaze.',
    'zh-TW': '新鮮莫札瑞拉起司球、甜熟櫻桃番茄與羅勒葉，淋上陳年巴薩米克醋膏。',
    'ja': 'フレッシュモッツァレラ、チェリートマト、バジルのバルサミコドレッシング掛け。'
  },
  'Prime Ribeye Steak (300g)': {
    'en': 'USDA Prime 300g ribeye grilled over oak wood, served with truffle herb butter and roasted garlic.',
    'zh-TW': '美規 USDA Prime 300g 肋眼牛排，橡木炭火直烤，搭配松露草本奶油與炙烤大蒜。',
    'ja': 'USDAプライム300gリブアイステーキ。オーク薪で香ばしく焼き上げました。'
  },
  'Artisanal Wagyu Burger': {
    'en': '200g A5 Wagyu patty, aged cheddar, caramelized onions, smoked bacon, and truffle aioli on brioche.',
    'zh-TW': '200g A5 和牛肉排，搭配陳年切達起司、焦糖洋蔥、煙燻培根與松露蛋黃醬。',
    'ja': '200g A5和牛パティ、熟成チェダー、キャラメルオニオン、トリュフマヨネーズ。'
  },
  'Pan-Seared Atlantic Salmon': {
    'en': 'Crispy skin salmon fillet with creamy dill sauce, roasted asparagus, and lemon herb quinoa.',
    'zh-TW': '香煎金黃酥皮大西洋鮭魚菲力，搭配奶油茴香醬、炙烤蘆筍與檸檬藜麥。',
    'ja': '皮目をパリッと焼き上げたサーモンのソテー、ディルクリームソース添え。'
  },
  'Classic Creamy Carbonara': {
    'en': 'Traditional Roman recipe with crispy guanciale, egg yolks, Pecorino Romano, and cracked black pepper.',
    'zh-TW': '正宗羅馬風味，嚴選義大利培根、濃郁蛋黃、佩克里諾起司與現磨黑胡椒。',
    'ja': 'パンチェッタ、卵黄、ペコリーノチーズ、黒コショウの本格派カルボナーラ。'
  },
  'Truffle Parmesan Fries': {
    'en': 'Hand-cut golden fries tossed in white truffle oil, parsley, and aged parmesan cheese.',
    'zh-TW': '現切金黃薯條，拌入白松露油、新鮮巴西里與現刨陳年帕瑪森起司。',
    'ja': '白トリュフオイルとパルメザンチーズを贅沢にまぶしたフレンチフライ。'
  },
  'Loaded Sweet Potato Fries': {
    'en': 'Crispy sweet potato fries drizzled with melted cheddar queso, jalapeño slices, and green onions.',
    'zh-TW': '酥脆地瓜條，淋上融化雙色切達起司醬、墨西哥辣椒片與青蔥花。',
    'ja': 'チェダーチーズソースとハラペーニョをのせたさつまいもフライ。'
  },
  'Signature Citrus Passion Mocktail': {
    'en': 'Fresh passionfruit, ruby grapefruit, mint leaves, sparkling water, and honey blossom.',
    'zh-TW': '鮮摘百香果、紅葡萄柚、薄荷葉、氣泡水與百花蜜調配而成的爽口飲品。',
    'ja': 'パッションフルーツ、グレープフルーツ、ミントの爽やかなスパークリング。'
  },
  'Iced Vanilla Oat Matcha Latte': {
    'en': 'Premium Shizuoka ceremonial matcha whisked with Madagascar vanilla and creamy oat milk.',
    'zh-TW': '日本靜岡頂級儀式級抹茶，搭配馬達加斯加香草與濃郁燕麥奶。',
    'ja': '静岡産抹茶とオーツミルク、マダガスカルバニラの贅沢な抹茶ラテ。'
  },
  'Craft IPA Amber Ale': {
    'en': 'Locally brewed amber ale featuring citrus aromas, moderate bitterness, and smooth caramel finish.',
    'zh-TW': '在地精釀琥珀啤酒，帶有柑橘果香、適度苦韻與滑順焦糖餘韻。',
    'ja': 'シトラスの香りと香ばしいキャラメル風味のクラフトIPAビール。'
  },
  'Molten Belgian Chocolate Lava Cake': {
    'en': 'Warm Belgian dark chocolate cake with a molten center, served with artisanal Madagascar vanilla gelato.',
    'zh-TW': '現烤溫熱比利時黑巧克力蛋糕，切開流出香濃夾心，附手作香草冰淇淋。',
    'ja': '温かい濃厚とろけるショコラケーキ。バニラジェラート添え。'
  },
  'Classic Espresso Tiramisu': {
    'en': 'Layered Italian ladyfingers soaked in dark espresso and Marsala wine, layered with mascarpone cream.',
    'zh-TW': '義大利手指餅乾汲滿濃縮咖啡與瑪莎拉酒，交織濃郁馬斯卡彭起司抹醬。',
    'ja': 'エスプレッソとマスカルポーネのクラシックティラミス。'
  },
  'Gourmet Steak & Wine Combo': {
    'en': 'Prime Ribeye Steak + Truffle Parmesan Fries + Glass of Red Wine / Mocktail.',
    'zh-TW': '頂級肋眼牛排 (300g) + 黑松露帕瑪森起司薯條 + 精選紅酒/特調飲品乙杯。',
    'ja': '極上リブアイステーキ ＋ トリュフポテト ＋ ワインまたは特製ドリンク。'
  },
  'Wild Garlic & Herb Roasted Chicken': {
    'en': 'Provencal herbs, garlic-butter basting, roasted baby potatoes.',
    'zh-TW': '普羅旺斯草本香料、蒜香奶油淋烤半雞，搭配烤小洋芋。',
    'ja': 'プロヴァンス風ハーブとガーリックで焼き上げたローストチキン。'
  },
  'Charred Octopus & Potato Salad': {
    'en': 'Grilled octopus tentacles, warm fingerling potatoes, smoked paprika oil.',
    'zh-TW': '炭烤鮮嫩章魚腳、溫熱小洋芋、煙燻紅椒油與西班牙橄欖。',
    'ja': '炭火焼きタコとほくほくジャガイモのグリルサラダ。'
  },
  'Wild Mushroom Truffle Risotto': {
    'en': 'Carnaroli rice, porcini reduction, black truffle cream, aged parmesan crisp.',
    'zh-TW': '義大利燉飯米、牛肝菌濃縮精華、黑松露奶油與帕瑪森起司薄餅。',
    'ja': 'ポルチーニ茸と黒トリュフ香る本格イタリアンリゾット。'
  },
  'Smoked Jalapeño Queso Fries': {
    'en': 'Smoked jalapeño queso, crispy bacon bits, sour cream, scallions.',
    'zh-TW': '煙燻墨西哥切達起司醬、香脆培根碎、酸奶油與青蔥。',
    'ja': 'ハラペーニョチーズと香ばしいベーコンの特製ポテト。'
  },
  'Wild Berry Hibiscus Sangria': {
    'en': 'Muddled wild berries, hibiscus infusion, fresh citrus, sparkling soda.',
    'zh-TW': '搗碎野莓、洛神花萃取液、新鮮柑橘與氣泡蘇打。',
    'ja': 'ミックスベリーとハイビスカスのノンアルコールサングリア。'
  },
  'Artisan Mango Coconut Panna Cotta': {
    'en': 'Silky coconut cream panna cotta, fresh Alphonso mango coulis.',
    'zh-TW': '絲滑椰奶義式奶酪，淋上愛文芒果純果醬與烤椰子片。',
    'ja': 'ココナッツパンナコッタと濃厚マンゴーソース。'
  },
  'Seafood Paella & Sangria Combo': {
    'en': 'Seafood Paella for two + 2 Wild Berry Sangria Mocktails + Garlic Bread.',
    'zh-TW': '西班牙海鮮燉飯 (雙人份) + 野莓桑格利亞特調 2 杯 + 香蒜麵包。',
    'ja': 'シーフードパエリア（2人前）＋ Berryサングリア2杯 ＋ ガーリックブレッド。'
  },
};

export const MODIFIER_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Extra Truffle Oil': { 'en': 'Extra Truffle Oil', 'zh-TW': '加濃黑松露油', 'ja': '追加トリュフオイル' },
  'Gluten Free Bread': { 'en': 'Gluten Free Bread', 'zh-TW': '換無麩質麵包', 'ja': 'グルテンフリーパン変更' },
  'No Cheese': { 'en': 'No Cheese', 'zh-TW': '去起司', 'ja': 'チーズ抜き' },
  'Add Poached Egg': { 'en': 'Add Poached Egg', 'zh-TW': '加水波蛋', 'ja': 'ポーチドエッグ追加' },
  'Extra Garlic Aioli': { 'en': 'Extra Garlic Aioli', 'zh-TW': '加大蒜蛋黃醬', 'ja': '追加ガーリックマヨ' },
  'Spicy Marinara': { 'en': 'Spicy Marinara', 'zh-TW': '附辣味番茄醬', 'ja': 'スパイシーマリナラ追加' },
  'Extra Lemon': { 'en': 'Extra Lemon', 'zh-TW': '加檸檬角', 'ja': '追加レモン' },
  'Rare': { 'en': 'Rare (1/10)', 'zh-TW': '一分熟 (Rare)', 'ja': 'レア (Rare)' },
  'Medium Rare': { 'en': 'Medium Rare (3/10)', 'zh-TW': '三分熟 (Medium Rare)', 'ja': 'ミディアムレア' },
  'Medium': { 'en': 'Medium (5/10)', 'zh-TW': '五分熟 (Medium)', 'ja': 'ミディアム' },
  'Medium Well': { 'en': 'Medium Well (7/10)', 'zh-TW': '七分熟 (Medium Well)', 'ja': 'ミディアムウェル' },
  'Well Done': { 'en': 'Well Done (10/10)', 'zh-TW': '全熟 (Well Done)', 'ja': 'ウェルダン' },
  'Peppercorn Sauce': { 'en': 'Peppercorn Sauce', 'zh-TW': '經典黑胡椒醬', 'ja': 'ペッパーソース' },
  'Mushroom Gravy': { 'en': 'Mushroom Gravy', 'zh-TW': '濃郁野菇醬', 'ja': 'マッシュルームソース' },
  'No Onions': { 'en': 'No Onions', 'zh-TW': '去洋蔥', 'ja': '玉ねぎ抜き' },
  'Gluten-Free Bun': { 'en': 'Gluten-Free Bun', 'zh-TW': '換無麩質漢堡包', 'ja': 'グルテンフリーバンズ' },
  'Medium Rare Patty': { 'en': 'Medium Rare Patty', 'zh-TW': '肉排三分熟', 'ja': 'パティミディアムレア' },
  'Well Done Patty': { 'en': 'Well Done Patty', 'zh-TW': '肉排全熟', 'ja': 'パティウェルダン' },
  'Extra Crispy Bacon': { 'en': 'Extra Crispy Bacon', 'zh-TW': '加香脆培根', 'ja': '追加クリスピーベーコン' },
  'Fried Egg': { 'en': 'Fried Egg', 'zh-TW': '加太陽煎蛋', 'ja': '目玉焼き追加' },
  'Less Ice': { 'en': 'Less Ice', 'zh-TW': '少冰', 'ja': '氷少なめ' },
  'No Ice': { 'en': 'No Ice', 'zh-TW': '去冰', 'ja': '氷なし' },
  'Less Sugar': { 'en': 'Less Sugar', 'zh-TW': '微糖', 'ja': '甘さ控えめ' },
  'Oat Milk': { 'en': 'Oat Milk', 'zh-TW': '換燕麥奶', 'ja': 'オーツミルク変更' },
};

export function getCategoryLabel(category: string, lang: Language): string {
  return CATEGORY_TRANSLATIONS[category]?.[lang] || CATEGORY_TRANSLATIONS[category]?.['en'] || category;
}

export function getDishName(name: string, lang: Language): string {
  if (!name) return '';
  return DISH_NAME_TRANSLATIONS[name]?.[lang] || (lang === 'zh-TW' ? DISH_NAME_TRANSLATIONS[name]?.['zh-TW'] : name) || name;
}

export function getDishDescription(item: MenuItem, lang: Language): string {
  if (!item) return '';
  const trans = DISH_DESC_TRANSLATIONS[item.name]?.[lang];
  if (trans) return trans;
  return item.description || '';
}

export function getModifierLabel(mod: string, lang: Language): string {
  if (!mod) return '';
  return MODIFIER_TRANSLATIONS[mod]?.[lang] || (lang === 'zh-TW' ? MODIFIER_TRANSLATIONS[mod]?.['zh-TW'] : mod) || mod;
}
