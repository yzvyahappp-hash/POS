import { Language } from './translations';
import { MenuItem } from '../types';

export const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'All': { 'en': 'All', 'zh-TW': '全部餐點', 'ja': 'すべて' },
  'Starters': { 'en': 'Starters', 'zh-TW': '開胃前菜', 'ja': '前菜' },
  'Mains': { 'en': 'Mains', 'zh-TW': '精緻主餐', 'ja': 'メイン' },
  'Fries': { 'en': 'Fries & Sides', 'zh-TW': '炸物小點', 'ja': 'サイド' },
  'Drinks': { 'en': 'Drinks & Beverages', 'zh-TW': '特調飲品', 'ja': 'ドリンク' },
  'Desserts': { 'en': 'Desserts', 'zh-TW': '手作甜點', 'ja': 'デザート' },
};

export const DISH_ID_NAMES: Record<string, Record<Language, string>> = {
  'm-1': { 'en': 'Truffle Mushroom Soup', 'zh-TW': '黑松露野菇濃湯', 'ja': 'トリュフきのこのポタージュ' },
  'm-2': { 'en': 'Crispy Calamari', 'zh-TW': '金黃酥炸魷魚圈', 'ja': 'サクサクカラマリフライ' },
  'm-3': { 'en': 'Caprese Salad', 'zh-TW': '經典卡布里莫札瑞拉沙拉', 'ja': 'カプレーゼサラダ' },
  'm-4': { 'en': 'Prime Ribeye Steak', 'zh-TW': '頂級肋眼牛排 (300g)', 'ja': '極上プライムリブアイステーキ' },
  'm-5': { 'en': 'Artisanal Wagyu Burger', 'zh-TW': '手作頂級和牛漢堡', 'ja': '極上和牛クラフトバーガー' },
  'm-6': { 'en': 'Pan-Seared Atlantic Salmon', 'zh-TW': '香煎大西洋尊爵鮭魚排', 'ja': 'アトランティックサーモンのソテー' },
  'm-7': { 'en': 'Classic Creamy Carbonara', 'zh-TW': '經典羅馬奶油培根蛋黃麵', 'ja': '濃厚クラシックカルボナーラ' },
  'm-8': { 'en': 'Truffle Parmesan Fries', 'zh-TW': '黑松露帕瑪森起司薯條', 'ja': 'トリュフパルメザンポテト' },
  'm-9': { 'en': 'Loaded Sweet Potato Fries', 'zh-TW': '熔岩雙起司烤地瓜條', 'ja': '濃厚チーズさつまいもフライ' },
  'm-10': { 'en': 'Signature Citrus Lemonade', 'zh-TW': '招牌百香柑橘特調氣泡飲', 'ja': '特製シトラスレモネード' },
  'm-11': { 'en': 'Iced Vanilla Oat Latte', 'zh-TW': '靜岡香草燕麥奶拿鐵', 'ja': 'アイスバニラオーツラテ' },
  'm-12': { 'en': 'Craft IPA Amber Ale', 'zh-TW': '精釀 IPA 琥珀啤酒', 'ja': 'クラフトIPAアンバーエール' },
  'm-13': { 'en': 'Molten Belgian Chocolate Cake', 'zh-TW': '比利時黑巧克力熔岩蛋糕', 'ja': 'ベルギーチョコフォンダンショコラ' },
  'm-14': { 'en': 'Classic Espresso Tiramisu', 'zh-TW': '主廚經典義式提拉米蘇', 'ja': '本格エスプレッソティ拉米斯' },
  'm-15': { 'en': 'Gourmet Steak & Seafood Dinner', 'zh-TW': '豪華牛排海鮮海陸大餐', 'ja': '極上ステーキ＆シーフードディナー' },
  'm-16': { 'en': 'Wild Garlic & Herb Chicken', 'zh-TW': '普羅旺斯大蒜香草烤半雞', 'ja': 'ガーリック＆ハーブローストチキン' },
  'm-17': { 'en': 'Charred Octopus Salad', 'zh-TW': '炭烤章魚溫洋芋沙拉', 'ja': 'タコと温ポテトのグリルサラダ' },
  'm-18': { 'en': 'Wild Mushroom Risotto', 'zh-TW': '黑松露牛肝菌野菇燉飯', 'ja': 'ポルチーニとキノコのリゾット' },
  'm-19': { 'en': 'Smoked Jalapeño Poppers', 'zh-TW': '煙燻培根起司墨西哥辣椒捲', 'ja': 'スモークハラペーニョポッパー' },
  'm-20': { 'en': 'Wild Berry Hibiscus Tea', 'zh-TW': '野莓洛神花果茶特調', 'ja': 'ミックスベリーハイビスカスティー' },
  'm-21': { 'en': 'Artisan Mango Cheesecake', 'zh-TW': '手作愛文芒果生乳酪蛋糕', 'ja': '濃厚マンゴーレアチーズケーキ' },
  'm-22': { 'en': 'Seafood Paella Feast', 'zh-TW': '西班牙經典海鮮大狂歡燉飯', 'ja': '極上シーフードパエリア' },
  'm-23': { 'en': 'Bacon Double Cheeseburger', 'zh-TW': '雙層培根厚起司牛肉堡', 'ja': 'ダブルベーコンチーズバーガー' },
  'm-24': { 'en': 'Crispy Chicken Tenders', 'zh-TW': '美式黃金香脆無骨炸雞柳', 'ja': 'サクサククリスピーチキンテンダー' },
  'm-25': { 'en': 'Loaded Chili Cheese Fries', 'zh-TW': '美式肉醬起司重磅薯條', 'ja': 'チリチーズポテト' },
  'm-26': { 'en': 'Buffalo Chicken Wings', 'zh-TW': '經典紐約水牛城酸辣烤雞翅', 'ja': 'ニューヨークバッファローウィング' },
  'm-27': { 'en': 'Classic Meatloaf & Mash', 'zh-TW': '主廚經典美式肉捲佐洋芋泥', 'ja': 'クラシックミートローフ＆マッシュ' },
  'm-28': { 'en': 'Country Fried Steak', 'zh-TW': '德州鄉村酥炸牛排佐白肉汁', 'ja': 'カントリーフライドステーキ' },
  'm-29': { 'en': 'BBQ Baby Back Ribs', 'zh-TW': '煙燻美式碳烤豬肋排', 'ja': 'スモークBBQベイビーバックリブ' },
  'm-30': { 'en': 'Grilled Cheese Sandwich', 'zh-TW': '經典金黃熔岩烤起司三明治', 'ja': 'グリルドチーズサンドイッチ' },
  'm-31': { 'en': 'Mozzarella Sticks', 'zh-TW': '金黃拉絲莫札瑞拉起司條', 'ja': '伸びるモッツァレラチーズスティック' },
  'm-32': { 'en': 'Philly Cheesesteak', 'zh-TW': '費城經典鐵板起司牛肉堡', 'ja': 'フィリーチーズステーキサンド' },
  'm-33': { 'en': 'Chocolate Milkshake', 'zh-TW': '濃郁比利時巧克力重磅奶昔', 'ja': '濃厚チョコレートミルクシェイク' },
  'm-34': { 'en': 'Classic Apple Pie', 'zh-TW': '美式傳統肉桂烤蘋果派', 'ja': 'クラシックアップルパイ' },
  'm-35': { 'en': 'Burger Fries & Soda Meal', 'zh-TW': '經典漢堡薯條可樂特惠套餐', 'ja': '定番バーガー＆ポテトドリンクセット' },
  'm-36': { 'en': 'Honey BBQ Wings', 'zh-TW': '香甜蜂蜜煙燻BBQ烤雞翅', 'ja': 'ハニーBBQチキンウィング' },
  'm-37': { 'en': 'Beer-Battered Onion Rings', 'zh-TW': '精釀啤酒麵衣巨無霸洋蔥圈', 'ja': 'ビール衣のオニオンリング' },
  'm-38': { 'en': 'Pulled Pork Sandwich', 'zh-TW': '手撕慢燻黑豚豬肉堡', 'ja': 'プルドポークサンドイッチ' },
  'm-39': { 'en': 'Classic Macaroni and Cheese', 'zh-TW': '四重起司焗烤通心粉', 'ja': '濃厚マカロニ＆チーズ' },
  'm-40': { 'en': 'Southern Fried Chicken Bucket', 'zh-TW': '美南鄉村金黃酥脆炸雞桶', 'ja': '南部風フライドチキンバケット' },
  'm-41': { 'en': 'Clam Chowder Soup Bread Bowl', 'zh-TW': '舊金山酸種麵包碗蛤蜊濃湯', 'ja': 'クラムチャウダー・ブレッドボウル' },
  'm-42': { 'en': 'Spicy Jalapeño Bacon Burger', 'zh-TW': '墨西哥香辣培根牛肉堡', 'ja': 'スパイシーハラペーニョベーコンバーガー' },
  'm-43': { 'en': 'Cajun Seasoned Waffle Fries', 'zh-TW': '紐奧良肯瓊香料格紋薯餅', 'ja': 'ケイジャンワッフルポテト' },
  'm-44': { 'en': 'Grilled Chicken Caesar Salad', 'zh-TW': '炭烤嫩雞胸經典凱撒沙拉', 'ja': 'グリルチキンシーザーサラダ' },
  'm-45': { 'en': 'Sno-Cone Root Beer Float', 'zh-TW': '美式經典麥根沙士冰淇淋漂浮', 'ja': 'ルートビアフロート' },
  'm-46': { 'en': 'Strawberry Milkshake', 'zh-TW': '新鮮草莓純鮮奶手打奶昔', 'ja': 'ストロベリーミルクシェイク' },
  'm-47': { 'en': 'Warm Brownie Sundae', 'zh-TW': '溫熱核桃布朗尼冰淇淋聖代', 'ja': '温かいブラウニーサンデー' },
  'm-48': { 'en': 'New York Style Cheesecake', 'zh-TW': '紐約經典重乳酪蛋糕', 'ja': 'ニューヨークスタイルチーズケーキ' },
  'm-49': { 'en': 'Buffalo Chicken Wrap', 'zh-TW': '水牛城辣雞酥炸菠菜捲餅', 'ja': 'バッファローチキンラップ' },
  'm-50': { 'en': 'Classic Corn Dogs (3pcs)', 'zh-TW': '美式金黃香脆玉米熱狗棒 3入', 'ja': 'アメリカンドッグ 3本' },
  'm-51': { 'en': 'BBQ Bacon Chicken Tender Sandwich', 'zh-TW': '煙燻培根BBQ炸雞柳長堡', 'ja': 'BBQベーコンチキンサンド' },
  'm-52': { 'en': 'Crispy Hash Browns', 'zh-TW': '美式黃金酥脆三角薯餅', 'ja': 'カリカリハッシュドポテト' },
  'm-53': { 'en': 'Southern Sweet Tea', 'zh-TW': '美南經典冰鎮檸檬甜紅茶', 'ja': '南部風アイススイートティー' },
  'm-54': { 'en': 'Family Ribs & Wings Combo', 'zh-TW': '家庭超值分享餐：碳烤豬肋排＋水牛城辣雞翅', 'ja': 'ファミリーリブ＆ウィングセット' },
  'm-55': { 'en': 'Pecan Pie Slice', 'zh-TW': '美南傳統焦糖胡桃派', 'ja': '南部風香ばしピーカンパイ' },
};

export const DISH_ID_DESCS: Record<string, Record<Language, string>> = {
  'm-1': {
    'en': 'Rich and creamy wild mushroom soup infused with aromatic black truffle oil, fresh herbs, and served with toasted garlic crostini.',
    'zh-TW': '濃郁滑順的野生蕈菇濃湯，融入頂級黑松露油與新鮮香草，附現烤香蒜脆法棍。',
    'ja': '芳醇な黒トリュフオイルとハーブを効かせた濃厚なキノコのポタージュ。ガーリックラスク添え。'
  },
  'm-2': {
    'en': 'Tender ocean squid rings lightly dusted in seasoned flour, fried to golden perfection, served with zesty house marinara and lemon wedges.',
    'zh-TW': '特選深海鮮魷裹上特調酥脆麵衣炸至金黃，附主廚特調酸甜番茄沾醬與新鮮黃檸檬角。',
    'ja': '柔らかなイカをサクサクの衣で黄金色に揚げました。自家製特製トマトソースとレモン添え。'
  },
  'm-3': {
    'en': 'Vine-ripened tomatoes, fresh buffalo mozzarella, and fragrant sweet basil leaves drizzled with aged Modena balsamic glaze and extra virgin olive oil.',
    'zh-TW': '完熟牛番茄切片、頂級莫札瑞拉起司與甜羅勒葉，淋上義大利陳年巴薩米克醋膏與特級初榨橄欖油。',
    'ja': '完熟トマト、フレッシュモッツァレラ、スイートバジルに熟成バルサミコとオリーブオイルを添えて。'
  },
  'm-4': {
    'en': 'USDA Prime 300g ribeye steak grilled over oak wood coals, finished with garlic-herb butter, served with roasted seasonal vegetables and sea salt.',
    'zh-TW': '特選 USDA Prime 300g 頂級肋眼牛排，橡木炭火直烤至外酥內嫩，佐蒜香草本奶油與爐烤時蔬。',
    'ja': 'オーク炭火で香ばしく焼き上げたUSDAプライム300gリブアイ。特製ハーブバターと温野菜添え。'
  },
  'm-5': {
    'en': 'Juicy 200g Wagyu beef patty on a toasted buttery brioche bun with aged cheddar, caramelized balsamic onions, crisp lettuce, and truffle aioli.',
    'zh-TW': '200g 多汁手打和牛肉排，搭配香烤布里歐許麵包、陳年切達起司、焦糖洋蔥與黑松露大蒜蛋黃醬。',
    'ja': 'ジューシーな和牛200gパティ、熟成チェダー、キャラメルオニオン、トリュフマヨネーズをブリオッシュでサンド。'
  },
  'm-6': {
    'en': 'Fresh Atlantic salmon fillet with crispy golden skin, served over creamy dill sauce, butter-glazed asparagus, and lemon-herb crushed potatoes.',
    'zh-TW': '大西洋鮮鮭魚排慢煎至外皮香脆、肉質滑嫩，佐法式蒔蘿白醬、奶油蘆筍與檸檬香草洋芋。',
    'ja': 'パリッと香ばしく焼き上げたサーモンフィレ。ディルクリームソースとアスパラガス添え。'
  },
  'm-7': {
    'en': 'Traditional Roman spaghetti with crispy Italian pancetta, rich egg yolk sauce, aged Pecorino Romano, and freshly cracked black pepper.',
    'zh-TW': '正統道地羅馬風味義大利麵，搭配香脆義式培根、濃郁放牧蛋黃、佩克里諾羊乳起司與現磨黑胡椒。',
    'ja': 'カリカリのパンチェッタ、濃厚な卵黄、ペコリーノチーズ、黒胡椒で仕上げた本場ローマ風パスタ。'
  },
  'm-8': {
    'en': 'Crispy hand-cut golden fries tossed in pure white truffle oil, finely grated aged Parmesan cheese, and fresh Italian parsley.',
    'zh-TW': '現炸金黃手工薯條，均勻裹上白松露油、現刮義大利帕瑪森起司絲與新鮮巴西里碎。',
    'ja': 'カリッと揚げたポテトに白トリュフオイルと削りたてパルメザンチーズを贅沢にトッピング。'
  },
  'm-9': {
    'en': 'Golden fried sweet potato fries smothered in warm cheddar cheese sauce, crispy bacon crumbles, pickled jalapeños, and sliced scallions.',
    'zh-TW': '香甜酥脆現炸地瓜薯條，淋上雙色切達起司熔岩醬、香脆培根碎、醃漬墨西哥辣椒與翠綠青蔥。',
    'ja': '甘みのあるさつまいもフライに濃厚チェダーチーズソース、ベーコン、ハラペーニョをたっぷりトッピング。'
  },
  'm-10': {
    'en': 'Handcrafted sparkling lemonade infused with fresh Meyer lemons, ruby pink grapefruit, passionfruit, and wild garden mint sprigs.',
    'zh-TW': '現榨黃檸檬汁融合紅葡萄柚、百香果果泥、沁涼氣泡水與新鮮薄荷葉，酸甜清爽生津解渴。',
    'ja': '搾りたてレモン、ピンクグレープフルーツ、パッションフルーツに炭酸とミントを合わせた爽快ドリンク。'
  },
  'm-11': {
    'en': 'Specialty espresso shots layered with creamy oat milk and natural Madagascar bourbon vanilla bean syrup over crystal clear ice.',
    'zh-TW': '精選義式濃縮咖啡，注入絲滑燕麥奶與馬達加斯加純天然香草籽糖漿，濃郁順口。',
    'ja': '深煎りエスプレッソと濃厚オーツミルク、マダガスカル産バニラシロップの贅沢なアイスラテ。'
  },
  'm-12': {
    'en': 'Artisanal local craft amber ale brewed with Cascade and Mosaic hops, featuring bold citrus aromas and a velvety caramel malt finish.',
    'zh-TW': '在地酒廠手作精釀琥珀啤酒，散發迷人柑橘酒花香氣與烘烤焦糖麥芽尾韻，泡沫綿密。',
    'ja': 'カスケードホップの爽やかな柑橘香と香ばしいキャラメルモルトの余韻が楽しめるクラフトIPAビール。'
  },
  'm-13': {
    'en': 'Decadent Belgian dark chocolate cake baked with a warm molten lava center, paired with a scoop of artisanal vanilla bean ice cream.',
    'zh-TW': '現烤溫熱比利時頂級苦甜黑巧克力蛋糕，切開流出濃郁爆漿熔岩，佐一球馬達加斯加香草冰淇淋。',
    'ja': '温めると中から濃厚なベルギー産ダークチョコがとろけ出す特製ケーキ。バニラアイス添え。'
  },
  'm-14': {
    'en': 'Traditional Italian savoiardi ladyfingers soaked in dark espresso and coffee liqueur, layered with fluffy mascarpone cream and cocoa powder.',
    'zh-TW': '手指餅乾吸飽濃縮咖啡與咖啡甜酒，層層堆疊絲滑馬斯卡彭起司霜，撒上法芙娜純可可粉。',
    'ja': 'エスプレッソとリキュールを染み込ませたサヴォイアルディに、濃厚マスカルポーネとココアパウダー。'
  },
  'm-15': {
    'en': 'Tender charbroiled prime ribeye steak paired with jumbo garlic butter shrimp skewers, truffle mashed potatoes, and a glass of house wine.',
    'zh-TW': '頂級炭烤肋眼牛排搭檔炙烤蒜香大蝦串，附黑松露洋芋泥、季節烤蔬菜與精選佐餐紅白酒乙杯。',
    'ja': '炭火焼きプライムリブアイとガーリックシュリンプ、トリュフポテト、ハウスワインが揃った豪華セット。'
  },
  'm-16': {
    'en': 'Oven-roasted half chicken marinated in French garlic, fresh rosemary, and thyme, served with crispy roast baby potatoes and natural pan jus.',
    'zh-TW': '法式野放烤半雞以大量大蒜、新鮮迷迭香與百里香醃漬入味，烤至金黃酥脆，附奶油香烤小洋芋。',
    'ja': 'ローズマリー、タイム、ガーリックでじっくりローストしたジューシーな半羽チキン。小芋添え。'
  },
  'm-17': {
    'en': 'Tender Spanish octopus charred over open flames, tossed with warm fingerling potatoes, smoked Spanish paprika, and lemon-caper vinaigrette.',
    'zh-TW': '西班牙巨無霸章魚腳直火炭烤至微焦香嫩，搭配溫熱指狀洋芋、煙燻紅椒粉與檸檬酸豆油醋汁。',
    'ja': '直火で香ばしく焼いたタコと温かいジャガイモをスモークパプリカとレモンドレッシングで和えた一品。'
  },
  'm-18': {
    'en': 'Creamy Carnaroli arborio risotto simmered with porcini mushroom stock, sautéed wild mushrooms, white wine, and aged Parmigiano-Reggiano.',
    'zh-TW': '義大利頂級燉飯米以牛肝菌高湯慢火煨煮，融入野生蕈菇、白酒、黑松露醬與現刨帕馬森起司薄片。',
    'ja': 'ポルチーニ茸の出汁でじっくり炊き上げたクリーミーなリゾット。削りたてパルミジャーノ添え。'
  },
  'm-19': {
    'en': 'Fresh jalapeño peppers stuffed with cream cheese, sharp cheddar, wrapped in hickory-smoked bacon, and roasted until bubbling.',
    'zh-TW': '新鮮墨西哥綠辣椒填入濃郁奶油起司與切達起司，外層裹上胡桃木煙燻厚培根烤至金黃微焦。',
    'ja': 'クリームチーズとチェダーを詰めたハラペーニョをスモークベーコンで巻き、香ばしく焼き上げました。'
  },
  'm-20': {
    'en': 'Refreshing herbal iced tea brewed with Egyptian hibiscus flowers, infused with muddled blackberries, raspberries, and a hint of wild honey.',
    'zh-TW': '嚴選有機洛神花茶沖泡，融入新鮮黑莓、覆盆子碎果肉與天然百花蜜，酸甜紅潤無咖啡因。',
    'ja': 'エジプト産ハイビスカスにブラックベリーとラズベリー、蜂蜜を加えた華やかで爽やかなハーブティー。'
  },
  'm-21': {
    'en': 'Velvety smooth cream cheesecake infused with fresh ripe mango purée over a buttery graham cracker crust, topped with diced mango cubes.',
    'zh-TW': '濃郁滑順生乳酪融入新鮮熟成愛文芒果純果泥，底層鋪滿香脆麥香餅乾底，頂部點綴鮮切芒果丁。',
    'ja': '濃厚なめらかなクリームチーズにフレッシュマンゴーピューレを合わせた手作りチーズケーキ。'
  },
  'm-22': {
    'en': 'Traditional Spanish saffron rice pan loaded with giant tiger prawns, blue mussels, tender calamari rings, and chorizo sausage slices.',
    'zh-TW': '道地西班牙番紅花鐵鍋燉飯，鋪滿野生大草蝦、智利淡菜、鮮甜魷魚圈與西班牙辣肉腸，鍋巴香脆。',
    'ja': 'サフランライスに大エビ、ムール貝、イカ、チョリソーをふんだんに敷き詰めた本場スペインの味。'
  },
  'm-23': {
    'en': 'Two juicy beef smash patties, four strips of crispy applewood bacon, double melted American cheese, pickles, and special burger sauce.',
    'zh-TW': '雙片厚實多汁純牛肉排，搭配四條蘋果木煙燻香脆培根、雙倍融化切達起司、酸黃瓜與秘密特調漢堡醬。',
    'ja': 'ジューシーなビーフパティ2枚、スモーキーベーコン4枚、とろけるダブルチーズの贅沢バーガー。'
  },
  'm-24': {
    'en': 'Hand-breaded chicken breast tenderloins marinated in buttermilk, fried to ultra-crispy perfection, served with honey mustard and BBQ sauce.',
    'zh-TW': '特選去骨雞柳以酪乳香料醃製入味，裹上特調酥脆麵衣現點現炸，附蜂蜜芥末醬與煙燻BBQ沾醬。',
    'ja': 'バターミルクに漬け込んだ柔らかな鶏ささみをサクサクに揚げました。ハニーマスタードソース添え。'
  },
  'm-25': {
    'en': 'Crispy shoestring fries topped with hearty slow-cooked beef chili con carne, melted cheddar queso sauce, and sliced jalapeños.',
    'zh-TW': '現炸酥脆細金黃薯條，淋上滿滿慢燉美式香辣牛肉肉醬、濃郁切達起司熔岩與墨西哥醃辣椒片。',
    'ja': 'カリカリポテトにじっくり煮込んだ特製ビーフチリミートソースと温かいチェダーチーズがたっぷり。'
  },
  'm-26': {
    'en': 'Crispy fried jumbo chicken wings tossed in tangy authentic Frank\'s RedHot Buffalo sauce, served with crisp celery and ranch dip.',
    'zh-TW': '酥炸多汁特大雞翅裹上經典紐約水牛城甜酸香辣熱醬，附清脆芹菜棒與手作香濃鄉村沙拉醬。',
    'ja': '本場NYスタイルのスパイシーで酸味の効いた特製ホットソースで和えたジューシーチキンウィング。'
  },
  'm-27': {
    'en': 'Savory homestyle baked beef and pork meatloaf with sweet tangy tomato glaze, served with creamy garlic mashed potatoes and rich brown gravy.',
    'zh-TW': '經典美式家庭烘烤牛肉豬肉捲，抹上濃郁酸甜番茄焦糖淋醬，搭配香蒜奶油洋芋泥與自慢肉汁醬。',
    'ja': '旨味たっぷりの自家製ミートローフに甘辛トマトグレーズ、滑らかなガーリックマッシュポテト添え。'
  },
  'm-28': {
    'en': 'Tenderized beef steak coated in seasoned country breading, fried crispy golden, smothered in rich southern peppered white cream gravy.',
    'zh-TW': '德州傳統酥炸牛排，外皮金黃酥脆肉質軟嫩，淋上經典美南黑胡椒白濃肉汁醬與奶油玉米粒。',
    'ja': 'カリッと揚げた柔らかビーフカツレツに、濃厚なブラックペッパーホワイトグレービーソース。'
  },
  'm-29': {
    'en': 'Slow-smoked tender baby back pork ribs glazed with sticky honey-hickory BBQ sauce, served with coleslaw and buttered corn on the cob.',
    'zh-TW': '櫻桃木低溫慢燻8小時極嫩黑豚豬肋排，刷上自製蜂蜜炭烤BBQ醬，骨肉輕易分離，附高麗菜沙拉與烤玉米。',
    'ja': 'ヒッコリー薪でじっくりスモークした柔らかバックリブに甘辛BBQソースをたっぷり塗った逸品。'
  },
  'm-30': {
    'en': 'Thick-sliced artisanal sourdough bread toasted with butter, filled with a blend of melted sharp cheddar, mozzarella, and gruyère cheeses.',
    'zh-TW': '厚切手工酸種麵包抹上發酵奶油慢煎至金黃酥脆，夾入陳年切達、莫札瑞拉與葛瑞爾三重起司拉絲。',
    'ja': '香ばしく焼いたサワードウにチェダー、モッツァレラ、グリュイエールがとろけ出す定番サンド。'
  },
  'm-31': {
    'en': 'Herb-seasoned Italian breadcrumb-crusted whole milk mozzarella sticks, fried crispy, served with warm house marinara dipping sauce.',
    'zh-TW': '嚴選純乳莫札瑞拉起司條裹上義式草本香料麵包粉炸至酥脆，超長拉絲，附溫熱大蒜番茄沾醬。',
    'ja': 'ハーブ香る衣で包んでカリッと揚げたモッツァレラ。熱々のトマトマリナラソースでお召し上がりください。'
  },
  'm-32': {
    'en': 'Thinly sliced ribeye steak sautéed on a flat-top grill with caramelized onions, bell peppers, melted provolone cheese in a soft hoagie roll.',
    'zh-TW': '鐵板高溫爆炒肋眼牛肉薄片、甜熟洋蔥與彩椒，鋪上融化普羅伏洛起司，夾入軟香長堡麵包。',
    'ja': '鉄板で香ばしく炒めた薄切りリブアイビーフ、玉ねぎ、パプリカにとろけるチーズを挟んだ名物サンド。'
  },
  'm-33': {
    'en': 'Thick and creamy hand-spun milkshake made with rich Dutch chocolate gelato, whole milk, chocolate syrup, and whipped cream.',
    'zh-TW': '純手工手打純濃奶昔，融合荷蘭頂級可可冰淇淋、純鮮奶與濃黑巧克力淋醬，擠上現打鮮奶油。',
    'ja': '濃厚チョコレートアイスと新鮮なミルクをブレンドした、リッチでクリーミーなクラシックシェイク。'
  },
  'm-34': {
    'en': 'Flaky golden butter crust filled with spiced Granny Smith apples, cinnamon, and nutmeg, served warm with vanilla ice cream.',
    'zh-TW': '手工香酥千層奶油派皮，包裹蜜糖肉桂煨煮的青蘋果片，出爐熱騰騰，附香草冰淇淋與焦糖醬。',
    'ja': 'シナモン香るリンゴをぎっしり詰めて香ばしく焼き上げた手作りパイ。温かいバニラアイス添え。'
  },
  'm-35': {
    'en': 'Artisanal Wagyu Burger or Cheeseburger + crispy golden french fries + ice cold fountain drink of your choice.',
    'zh-TW': '手作頂級漢堡（牛肉堡或起司堡） + 現炸金黃酥脆薯條 + 沁涼氣泡飲/可樂乙杯，超值滿足。',
    'ja': '人気のクラフトバーガーにサクサクポテトフライとお好きなソフトドリンクがついたお得なセット。'
  },
  'm-36': {
    'en': 'Crispy fried chicken wings smothered in sweet honey-barbecue glaze with a hint of smoky chipotle and toasted sesame seeds.',
    'zh-TW': '酥炸金黃雞翅裹上主廚特調野花蜂蜜煙燻炭烤BBQ醬汁，撒上香脆白芝麻，香甜多汁不辣口。',
    'ja': 'はちみつのコクとスモーキーなBBQソースが絡み合う、子供から大人まで大人気のチキンウィング。'
  },
  'm-37': {
    'en': 'Thick-cut sweet Spanish onions dipped in craft IPA beer batter and fried ultra-crispy, served with spicy chipotle ranch sauce.',
    'zh-TW': '厚切香甜洋蔥圈裹入精釀 IPA 啤酒調製的特製粉漿炸至金黃超酥脆，附煙燻墨西哥辣椒鄉村醬。',
    'ja': 'クラフトビールを混ぜた特製衣でサクッと揚げた肉厚スイートオニオンリング。特製ソース添え。'
  },
  'm-38': {
    'en': '12-hour slow-smoked pork shoulder shredded and tossed in tangy Carolina BBQ sauce, piled high on a brioche bun with creamy coleslaw.',
    'zh-TW': '櫻桃木低溫慢烤12小時手撕黑豚豬肉，拌入卡羅萊納酸甜BBQ醬，夾入布里歐堡，搭配爽脆涼拌捲心菜。',
    'ja': '12時間じっくりスモークした柔らか豚肉を手でほぐし、特製BBQソースとコールスローをサンド。'
  },
  'm-39': {
    'en': 'Elbow macaroni tossed in a velvety four-cheese blend of cheddar, gouda, mozzarella, and parmesan, baked with buttery breadcrumb crust.',
    'zh-TW': '彎管通心粉裹滿切達、高達、莫札瑞拉與帕瑪森四重起司濃郁白醬，撒上蒜香奶油麵包粉焗烤金黃。',
    'ja': '4種のチーズを使った濃厚チーズソースにマカロニを絡め、サクサクのパン粉をのせて焼き上げました。'
  },
  'm-40': {
    'en': '6 pieces of tender bone-in chicken marinated in spiced buttermilk, fried with 11 secret herbs and spices, served with honey butter biscuits.',
    'zh-TW': '6塊帶骨鮮嫩雞肉以酪乳與11種秘密香料醃製，外皮鱗片狀極致酥脆肉汁爆發，附蜂蜜奶油比司吉。',
    'ja': '特製スパイスとバターミルクで漬け込みカリッと揚げた絶品フライドチキン6ピースセット。'
  },
  'm-41': {
    'en': 'Rich and creamy New England clam chowder with tender sea clams and diced potatoes served in a fresh crusty sourdough bread bowl.',
    'zh-TW': '舊金山招牌名菜：烤熱酥脆酸種麵包碗，盛裝濃郁新英格蘭蛤蜊濃湯、鮮甜海蛤肉與洋芋培根丁。',
    'ja': 'カリッと香ばしいサワードウブレッドを器にして注いだ、具だくさんでクリーミーなクラムチャウダー。'
  },
  'm-42': {
    'en': 'Flame-grilled beef patty topped with grilled pickled jalapeño slices, crispy bacon, pepper jack cheese, and spicy chipotle mayo.',
    'zh-TW': '直火炭烤純牛肉排，鋪上煎烤墨西哥辣椒片、香脆培根、胡椒傑克起司與煙燻是拉差辣蛋黃醬。',
    'ja': '直火焼きパティにスパイシーなハラペーニョ、クリスピーベーコン、ペッパージャックチーズが刺激的。'
  },
  'm-43': {
    'en': 'Crispy lattice waffle-cut potatoes seasoned generously with spicy Louisiana Cajun spices, served with garlic aioli.',
    'zh-TW': '經典蜂巢格紋厚切薯餅炸至香酥脆口，撒上紐奧良肯瓊辣椒粉、大蒜香料，附蒜香蛋黃沾醬。',
    'ja': 'ルイジアナ風ケイジャンスパイスをたっぷりまぶした、サクサク食感のワッフルカットポテト。'
  },
  'm-44': {
    'en': 'Juicy grilled marinated chicken breast slices over crisp romaine lettuce, tossed with creamy Caesar dressing, garlic croutons, and parmesan.',
    'zh-TW': '香烤鮮嫩雞胸肉切片，搭配鮮脆羅曼萵苣、自製鯷魚凱撒醬、現刨帕瑪森起司與蒜香酥麵包丁。',
    'ja': '炭火で香ばしく焼いたチキン、シャキシャキのロメインレタス、パルメザンとクルトンの王道サラダ。'
  },
  'm-45': {
    'en': 'Ice-cold draft root beer poured over two generous scoops of premium vanilla bean ice cream in a frosted beer mug.',
    'zh-TW': '冰鎮厚玻璃杯注入道地美式麥根沙士，漂浮兩大球香醇馬達加斯加香草冰淇淋，氣泡香草交融。',
    'ja': 'キンキンに冷えたルートビアに濃厚なバニラアイスクリームを浮かべたアメリカのレトロフロート。'
  },
  'm-46': {
    'en': 'Sweet and creamy shake blended with real strawberry purée, vanilla ice cream, fresh strawberries, and topped with whipped cream.',
    'zh-TW': '新鮮熟成大湖草莓純果泥、頂級香草冰淇淋與全脂鮮奶現打而成，粉紅絲滑，飾上手打鮮奶油。',
    'ja': 'たっぷりのいちごピューレとバニラアイスをブレンドした、甘酸っぱくクリーミーな極上シェイク。'
  },
  'm-47': {
    'en': 'Freshly baked fudgy chocolate walnut brownie topped with vanilla ice cream, hot chocolate fudge sauce, whipped cream, and a maraschino cherry.',
    'zh-TW': '現烤溫熱濃郁核桃黑巧克力布朗尼，頂部放上一大球香草冰淇淋，淋上滾燙熱巧克力醬與糖漬櫻桃。',
    'ja': '焼きたて濃厚チョコブラウニーにバニラアイス、熱々のチョコファッジソースをかけた贅沢サンデー。'
  },
  'm-48': {
    'en': 'Rich and dense baked New York cheesecake with a buttery graham crust, served with a fresh strawberry-raspberry reduction.',
    'zh-TW': '道地紐約重烘焙乳酪蛋糕，口感紮實濃郁奶香撲鼻，搭配香脆麥香派底與手工熬煮綜合野莓果醬。',
    'ja': '濃厚でなめらかな舌触りの本場NYスタイルベイクドチーズケーキ。ベリーソース添え。'
  },
  'm-49': {
    'en': 'Crispy Buffalo chicken tenders, crisp shredded lettuce, diced tomatoes, cheddar cheese, and creamy ranch rolled in a warm spinach tortilla.',
    'zh-TW': '酥炸水牛城辣雞柳條、鮮脆生菜絲、番茄丁、切達起司絲與香濃鄉村醬，包裹在溫熱菠菜綠薄餅中。',
    'ja': 'ピリ辛バッファローチキン、レタス、トマト、チーズ、ランチドレッシングをトルティーヤで巻いた一品。'
  },
  'm-50': {
    'en': '3 all-beef hot dogs skewered and coated in sweet cornmeal batter, fried to a golden crisp, served with yellow mustard and ketchup.',
    'zh-TW': '3支特選全牛熱狗腸裹上香甜玉米粉漿現炸至金黃酥脆，外脆內爆汁，附黃芥末醬與番茄醬。',
    'ja': 'コーンミール生地でほんのり甘くカリッと揚げた本格アメリカンドッグ3本セット。'
  },
  'm-51': {
    'en': 'Crispy fried chicken tenders, smoked bacon, melted provolone cheese, and smoky sweet BBQ sauce inside a toasted garlic brioche roll.',
    'zh-TW': '現炸酥脆無骨雞柳條，搭配煙燻香脆培根、融化普羅伏洛起司與香甜煙燻BBQ醬，夾入蒜香烤布里歐長堡。',
    'ja': 'サクサクのチキンテンダーとスモークベーコン、とろけるチーズにBBQソースを合わせたボリュームサンド。'
  },
  'm-52': {
    'en': 'Shredded russet potatoes seasoned and pan-fried until ultra-crispy on the outside, fluffy on the inside.',
    'zh-TW': '特選馬鈴薯細絲調味壓製，高溫油炸至外層金黃酥脆、內層鬆軟綿密，附特調沾醬。',
    'ja': '外はカリッ、中はホクホクに香ばしく揚げた定番のハッシュドポテト。'
  },
  'm-53': {
    'en': 'Traditional southern black tea slow-steeped with cane sugar and chilled with fresh lemon slices and mint.',
    'zh-TW': '道地美南傳統紅茶慢火萃取，加入天然蔗糖調和，冰鎮透心涼，附新鮮黃檸檬厚片與薄荷。',
    'ja': '本場アメリカ南部スタイルの、すっきりとした甘みとレモンが爽やかな伝統のアイスティー。'
  },
  'm-54': {
    'en': 'Full rack of BBQ Baby Back Ribs + 12 Buffalo Wings + loaded chili cheese fries + 4 soft drinks.',
    'zh-TW': '超大份全排煙燻BBQ黑豚豬肋排 + 12支水牛城酸辣雞翅 + 重磅肉醬起司薯條 + 4杯氣泡冷飲。',
    'ja': 'バックリブ1ラック、バッファローウィング12本、チリチーズポテト、ドリンク4杯がついた超豪華ファミリーセット。'
  },
  'm-55': {
    'en': 'Southern heirloom recipe with crunchy roasted Georgia pecans baked in a rich caramelized brown sugar bourbon custard filling.',
    'zh-TW': '美南傳統百年配方，香烤喬治亞香脆胡桃粒，融入濃郁焦糖黑糖波本威士忌卡士達餡，派皮香酥。',
    'ja': '香ばしくローストしたピーカンナッツと濃厚なキャラメルカスタードを焼き上げた伝統のパイ。'
  },
};

export const DISH_NAME_TRANSLATIONS: Record<string, Record<Language, string>> = {
  // English name keys
  'Truffle Mushroom Soup': { 'en': 'Truffle Mushroom Soup', 'zh-TW': '黑松露野菇濃湯', 'ja': 'トリュフきのこのポタージュ' },
  'Truffle Mushroom Bruschetta': { 'en': 'Truffle Mushroom Bruschetta', 'zh-TW': '黑松露野菇普斯凱塔', 'ja': 'トリュフきのこのブルスケッタ' },
  'Crispy Calamari': { 'en': 'Crispy Calamari', 'zh-TW': '金黃酥炸魷魚圈', 'ja': 'サクサクカラマリフライ' },
  'Crispy Calamari Rings': { 'en': 'Crispy Calamari Rings', 'zh-TW': '金黃酥炸魷魚圈', 'ja': 'サクサクカラマリフライ' },
  'Caprese Salad': { 'en': 'Caprese Salad', 'zh-TW': '經典卡布里莫札瑞拉沙拉', 'ja': 'カプレーゼサラダ' },
  'Caprese Salad Skewers': { 'en': 'Caprese Salad Skewers', 'zh-TW': '卡布里義式莫札瑞拉番茄串', 'ja': 'カプレーゼ串' },
  'Prime Ribeye Steak': { 'en': 'Prime Ribeye Steak', 'zh-TW': '頂級肋眼牛排 (300g)', 'ja': '極上プライムリブアイステーキ' },
  'Prime Ribeye Steak (300g)': { 'en': 'Prime Ribeye Steak (300g)', 'zh-TW': '頂級肋眼牛排 (300g)', 'ja': '極上プライムリブアイステーキ (300g)' },
  'Artisanal Wagyu Burger': { 'en': 'Artisanal Wagyu Burger', 'zh-TW': '手作頂級和牛漢堡', 'ja': '極上和牛クラフトバーガー' },
  'Pan-Seared Atlantic Salmon': { 'en': 'Pan-Seared Atlantic Salmon', 'zh-TW': '香煎大西洋尊爵鮭魚排', 'ja': 'アトランティックサーモンのソテー' },
  'Classic Creamy Carbonara': { 'en': 'Classic Creamy Carbonara', 'zh-TW': '經典羅馬奶油培根蛋黃麵', 'ja': '濃厚クラシックカルボナーラ' },
  'Truffle Parmesan Fries': { 'en': 'Truffle Parmesan Fries', 'zh-TW': '黑松露帕瑪森起司薯條', 'ja': 'トリュフパルメザンポテト' },
  'Loaded Sweet Potato Fries': { 'en': 'Loaded Sweet Potato Fries', 'zh-TW': '熔岩雙起司烤地瓜條', 'ja': '濃厚チーズさつまいもフライ' },
  'Signature Citrus Lemonade': { 'en': 'Signature Citrus Lemonade', 'zh-TW': '招牌百香柑橘特調氣泡飲', 'ja': '特製シトラスレモネード' },
  'Signature Citrus Passion Mocktail': { 'en': 'Signature Citrus Passion Mocktail', 'zh-TW': '招牌百香柑橘特調氣泡飲', 'ja': 'シトラスパッションモクテル' },
  'Iced Vanilla Oat Latte': { 'en': 'Iced Vanilla Oat Latte', 'zh-TW': '靜岡香草燕麥奶拿鐵', 'ja': 'アイスバニラオーツラテ' },
  'Iced Vanilla Oat Matcha Latte': { 'en': 'Iced Vanilla Oat Matcha Latte', 'zh-TW': '靜岡香草燕麥奶抹茶拿鐵', 'ja': 'アイスバニラオーツ抹茶ラテ' },
  'Craft IPA Amber Ale': { 'en': 'Craft IPA Amber Ale', 'zh-TW': '精釀 IPA 琥珀啤酒', 'ja': 'クラフトIPAアンバーエール' },
  'Molten Belgian Chocolate Cake': { 'en': 'Molten Belgian Chocolate Cake', 'zh-TW': '比利時黑巧克力熔岩蛋糕', 'ja': 'ベルギーチョコフォンダンショコラ' },
  'Molten Belgian Chocolate Lava Cake': { 'en': 'Molten Belgian Chocolate Lava Cake', 'zh-TW': '比利時黑巧克力熔岩蛋糕', 'ja': 'ベルギーチョコフォンダンショコラ' },
  'Classic Espresso Tiramisu': { 'en': 'Classic Espresso Tiramisu', 'zh-TW': '主廚經典義式提拉米蘇', 'ja': '本格エスプレッソティ拉米斯' },
  'Gourmet Steak & Seafood Dinner': { 'en': 'Gourmet Steak & Seafood Dinner', 'zh-TW': '豪華牛排海鮮海陸大餐', 'ja': '極上ステーキ＆シーフードディナー' },
  'Gourmet Steak & Wine Combo': { 'en': 'Gourmet Steak & Wine Combo', 'zh-TW': '豪華肋眼牛排佐紅酒套餐', 'ja': '極上ステーキ＆ワインセット' },
  'Wild Garlic & Herb Chicken': { 'en': 'Wild Garlic & Herb Chicken', 'zh-TW': '普羅旺斯大蒜香草烤半雞', 'ja': 'ガーリック＆ハーブローストチキン' },
  'Wild Garlic & Herb Roasted Chicken': { 'en': 'Wild Garlic & Herb Roasted Chicken', 'zh-TW': '普羅旺斯大蒜香草烤半雞', 'ja': 'ガーリック＆ハーブローストチキン' },
  'Charred Octopus Salad': { 'en': 'Charred Octopus Salad', 'zh-TW': '炭烤章魚溫洋芋沙拉', 'ja': 'タコと温ポテトのグリルサラダ' },
  'Charred Octopus & Potato Salad': { 'en': 'Charred Octopus & Potato Salad', 'zh-TW': '炭烤章魚溫洋芋沙拉', 'ja': 'タコと温ポテトのグリルサラダ' },
  'Wild Mushroom Risotto': { 'en': 'Wild Mushroom Risotto', 'zh-TW': '黑松露牛肝菌野菇燉飯', 'ja': 'ポルチーニとキノコのリゾット' },
  'Wild Mushroom Truffle Risotto': { 'en': 'Wild Mushroom Truffle Risotto', 'zh-TW': '黑松露牛肝菌野菇燉飯', 'ja': 'ポルチーニとキノコのリゾット' },
  'Smoked Jalapeño Poppers': { 'en': 'Smoked Jalapeño Poppers', 'zh-TW': '煙燻培根起司墨西哥辣椒捲', 'ja': 'スモークハラペーニョポッパー' },
  'Smoked Jalapeño Queso Fries': { 'en': 'Smoked Jalapeño Queso Fries', 'zh-TW': '煙燻墨西哥切達起司醬薯條', 'ja': 'スモークハラペーニョポテト' },
  'Wild Berry Hibiscus Tea': { 'en': 'Wild Berry Hibiscus Tea', 'zh-TW': '野莓洛神花果茶特調', 'ja': 'ミックスベリーハイビスカスティー' },
  'Wild Berry Hibiscus Sangria': { 'en': 'Wild Berry Hibiscus Sangria', 'zh-TW': '野莓洛神花桑格利亞特調', 'ja': 'ベリーサングリアモクテル' },
  'Artisan Mango Cheesecake': { 'en': 'Artisan Mango Cheesecake', 'zh-TW': '手作愛文芒果生乳酪蛋糕', 'ja': '濃厚マンゴーレアチーズケーキ' },
  'Artisan Mango Coconut Panna Cotta': { 'en': 'Artisan Mango Coconut Panna Cotta', 'zh-TW': '手作芒果椰奶奶酪', 'ja': 'マンゴーココナッツパンナコッタ' },
  'Seafood Paella Feast': { 'en': 'Seafood Paella Feast', 'zh-TW': '西班牙經典海鮮大狂歡燉飯', 'ja': '極上シーフードパエリア' },
  'Seafood Paella & Sangria Combo': { 'en': 'Seafood Paella & Sangria Combo', 'zh-TW': '西班牙海鮮燉飯雙人套餐', 'ja': 'シーフードパエリアセット' },
  'Bacon Double Cheeseburger': { 'en': 'Bacon Double Cheeseburger', 'zh-TW': '雙層培根厚起司牛肉堡', 'ja': 'ダブルベーコンチーズバーガー' },
  'Crispy Chicken Tenders': { 'en': 'Crispy Chicken Tenders', 'zh-TW': '美式黃金香脆無骨炸雞柳', 'ja': 'サクサククリスピーチキンテンダー' },
  'Loaded Chili Cheese Fries': { 'en': 'Loaded Chili Cheese Fries', 'zh-TW': '美式肉醬起司重磅薯條', 'ja': 'チリチーズポテト' },
  'Buffalo Chicken Wings': { 'en': 'Buffalo Chicken Wings', 'zh-TW': '經典紐約水牛城酸辣烤雞翅', 'ja': 'ニューヨークバッファローウィング' },
  'Classic Meatloaf & Mash': { 'en': 'Classic Meatloaf & Mash', 'zh-TW': '主廚經典美式肉捲佐洋芋泥', 'ja': 'クラシックミートローフ＆マッシュ' },
  'Country Fried Steak': { 'en': 'Country Fried Steak', 'zh-TW': '德州鄉村酥炸牛排佐白肉汁', 'ja': 'カントリーフライドステーキ' },
  'BBQ Baby Back Ribs': { 'en': 'BBQ Baby Back Ribs', 'zh-TW': '煙燻美式碳烤豬肋排', 'ja': 'スモークBBQベイビーバックリブ' },
  'Grilled Cheese Sandwich': { 'en': 'Grilled Cheese Sandwich', 'zh-TW': '經典金黃熔岩烤起司三明治', 'ja': 'グリルドチーズサンドイッチ' },
  'Mozzarella Sticks': { 'en': 'Mozzarella Sticks', 'zh-TW': '金黃拉絲莫札瑞拉起司條', 'ja': '伸びるモッツァレラチーズスティック' },
  'Philly Cheesesteak': { 'en': 'Philly Cheesesteak', 'zh-TW': '費城經典鐵板起司牛肉堡', 'ja': 'フィリーチーズステーキサンド' },
  'Chocolate Milkshake': { 'en': 'Chocolate Milkshake', 'zh-TW': '濃郁比利時巧克力重磅奶昔', 'ja': '濃厚チョコレートミルクシェイク' },
  'Classic Apple Pie': { 'en': 'Classic Apple Pie', 'zh-TW': '美式傳統肉桂烤蘋果派', 'ja': 'クラシックアップルパイ' },
  'Burger Fries & Soda Meal': { 'en': 'Burger Fries & Soda Meal', 'zh-TW': '經典漢堡薯條可樂特惠套餐', 'ja': '定番バーガー＆ポテトドリンクセット' },
  'Honey BBQ Wings': { 'en': 'Honey BBQ Wings', 'zh-TW': '香甜蜂蜜煙燻BBQ烤雞翅', 'ja': 'ハニーBBQチキンウィング' },
  'Beer-Battered Onion Rings': { 'en': 'Beer-Battered Onion Rings', 'zh-TW': '精釀啤酒麵衣巨無霸洋蔥圈', 'ja': 'ビール衣のオニオンリング' },
  'Pulled Pork Sandwich': { 'en': 'Pulled Pork Sandwich', 'zh-TW': '手撕慢燻黑豚豬肉堡', 'ja': 'プルドポークサンドイッチ' },
  'Classic Macaroni and Cheese': { 'en': 'Classic Macaroni and Cheese', 'zh-TW': '四重起司焗烤通心粉', 'ja': '濃厚マカロニ＆チーズ' },
  'Southern Fried Chicken Bucket': { 'en': 'Southern Fried Chicken Bucket', 'zh-TW': '美南鄉村金黃酥脆炸雞桶', 'ja': '南部風フライドチキンバケット' },
  'Clam Chowder Soup Bread Bowl': { 'en': 'Clam Chowder Soup Bread Bowl', 'zh-TW': '舊金山酸種麵包碗蛤蜊濃湯', 'ja': 'クラムチャウダー・ブレッドボウル' },
  'Spicy Jalapeño Bacon Burger': { 'en': 'Spicy Jalapeño Bacon Burger', 'zh-TW': '墨西哥香辣培根牛肉堡', 'ja': 'スパイシーハラペーニョベーコンバーガー' },
  'Cajun Seasoned Waffle Fries': { 'en': 'Cajun Seasoned Waffle Fries', 'zh-TW': '紐奧良肯瓊香料格紋薯餅', 'ja': 'ケイジャンワッフルポテト' },
  'Grilled Chicken Caesar Salad': { 'en': 'Grilled Chicken Caesar Salad', 'zh-TW': '炭烤嫩雞胸經典凱撒沙拉', 'ja': 'グリルチキンシーザーサラダ' },
  'Sno-Cone Root Beer Float': { 'en': 'Sno-Cone Root Beer Float', 'zh-TW': '美式經典麥根沙士冰淇淋漂浮', 'ja': 'ルートビアフロート' },
  'Strawberry Milkshake': { 'en': 'Strawberry Milkshake', 'zh-TW': '新鮮草莓純鮮奶手打奶昔', 'ja': 'ストロベリーミルクシェイク' },
  'Warm Brownie Sundae': { 'en': 'Warm Brownie Sundae', 'zh-TW': '溫熱核桃布朗尼冰淇淋聖代', 'ja': '温かいブラウニーサンデー' },
  'New York Style Cheesecake': { 'en': 'New York Style Cheesecake', 'zh-TW': '紐約經典重乳酪蛋糕', 'ja': 'ニューヨークスタイルチーズケーキ' },
  'Buffalo Chicken Wrap': { 'en': 'Buffalo Chicken Wrap', 'zh-TW': '水牛城辣雞酥炸菠菜捲餅', 'ja': 'バッファローチキンラップ' },
  'Classic Corn Dogs (3pcs)': { 'en': 'Classic Corn Dogs (3pcs)', 'zh-TW': '美式金黃香脆玉米熱狗棒 3入', 'ja': 'アメリカンドッグ 3本' },
  'BBQ Bacon Chicken Tender Sandwich': { 'en': 'BBQ Bacon Chicken Tender Sandwich', 'zh-TW': '煙燻培根BBQ炸雞柳長堡', 'ja': 'BBQベーコンチキンサンド' },
  'Crispy Hash Browns': { 'en': 'Crispy Hash Browns', 'zh-TW': '美式黃金酥脆三角薯餅', 'ja': 'カリカリハッシュドポテト' },
  'Southern Sweet Tea': { 'en': 'Southern Sweet Tea', 'zh-TW': '美南經典冰鎮檸檬甜紅茶', 'ja': '南部風アイススイートティー' },
  'Family Ribs & Wings Combo': { 'en': 'Family Ribs & Wings Combo', 'zh-TW': '家庭超值分享餐：碳烤豬肋排＋水牛城辣雞翅', 'ja': 'ファミリーリブ＆ウィングセット' },
  'Pecan Pie Slice': { 'en': 'Pecan Pie Slice', 'zh-TW': '美南傳統焦糖胡桃派', 'ja': '南部風香ばしピーカンパイ' },

  // Traditional Chinese keys (for reverse lookup)
  '黑松露野菇濃湯': { 'en': 'Truffle Mushroom Soup', 'zh-TW': '黑松露野菇濃湯', 'ja': 'トリュフきのこのポタージュ' },
  '黑松露野菇普斯凱塔': { 'en': 'Truffle Mushroom Bruschetta', 'zh-TW': '黑松露野菇普斯凱塔', 'ja': 'トリュフきのこのブルスケッタ' },
  '金黃酥炸香酥魷魚圈': { 'en': 'Crispy Calamari', 'zh-TW': '金黃酥炸魷魚圈', 'ja': 'サクサクカラマリフライ' },
  '金黃酥炸魷魚圈': { 'en': 'Crispy Calamari', 'zh-TW': '金黃酥炸魷魚圈', 'ja': 'サクサクカラマリフライ' },
  '經典卡布里莫札瑞拉沙拉': { 'en': 'Caprese Salad', 'zh-TW': '經典卡布里莫札瑞拉沙拉', 'ja': 'カプレーゼサラダ' },
  '卡布里義式莫札瑞拉番茄串': { 'en': 'Caprese Salad Skewers', 'zh-TW': '卡布里義式莫札瑞拉番茄串', 'ja': 'カプレーゼ串' },
  '頂級肋眼牛排 (300g)': { 'en': 'Prime Ribeye Steak', 'zh-TW': '頂級肋眼牛排 (300g)', 'ja': '極上プライムリブアイステーキ' },
  '手作頂級和牛漢堡': { 'en': 'Artisanal Wagyu Burger', 'zh-TW': '手作頂級和牛漢堡', 'ja': '極上和牛クラフトバーガー' },
  '香煎大西洋尊爵鮭魚排': { 'en': 'Pan-Seared Atlantic Salmon', 'zh-TW': '香煎大西洋尊爵鮭魚排', 'ja': 'アトランティックサーモンのソテー' },
  '經典羅馬奶油培根蛋黃麵': { 'en': 'Classic Creamy Carbonara', 'zh-TW': '經典羅馬奶油培根蛋黃麵', 'ja': '濃厚クラシックカルボナーラ' },
  '黑松露帕瑪森起司薯條': { 'en': 'Truffle Parmesan Fries', 'zh-TW': '黑松露帕瑪森起司薯條', 'ja': 'トリュフパルメザンポテト' },
  '熔岩雙起司烤地瓜條': { 'en': 'Loaded Sweet Potato Fries', 'zh-TW': '熔岩雙起司烤地瓜條', 'ja': '濃厚チーズさつまいもフライ' },
  '招牌百香柑橘特調氣泡飲': { 'en': 'Signature Citrus Lemonade', 'zh-TW': '招牌百香柑橘特調氣泡飲', 'ja': '特製シトラスレモネード' },
  '靜岡香草燕麥奶抹茶拿鐵': { 'en': 'Iced Vanilla Oat Latte', 'zh-TW': '靜岡香草燕麥奶抹茶拿鐵', 'ja': 'アイスバニラオーツ抹茶ラテ' },
  '精釀 IPA 琥珀啤酒': { 'en': 'Craft IPA Amber Ale', 'zh-TW': '精釀 IPA 琥珀啤酒', 'ja': 'クラフトIPAアンバーエール' },
  '比利時黑巧克力熔岩蛋糕': { 'en': 'Molten Belgian Chocolate Cake', 'zh-TW': '比利時黑巧克力熔岩蛋糕', 'ja': 'ベルギーチョコフォンダンショコラ' },
  '主廚經典義式提拉米蘇': { 'en': 'Classic Espresso Tiramisu', 'zh-TW': '主廚經典義式提拉米蘇', 'ja': '本格エスプレッソティ拉米斯' },
  '豪華肋眼牛排佐紅酒套餐': { 'en': 'Gourmet Steak & Seafood Dinner', 'zh-TW': '豪華肋眼牛排佐紅酒套餐', 'ja': '極上ステーキ＆シーフードディナー' },
  '普羅旺斯大蒜香草烤半雞': { 'en': 'Wild Garlic & Herb Chicken', 'zh-TW': '普羅旺斯大蒜香草烤半雞', 'ja': 'ガーリック＆ハーブローストチキン' },
  '炭烤章魚溫洋芋沙拉': { 'en': 'Charred Octopus Salad', 'zh-TW': '炭烤章魚溫洋芋沙拉', 'ja': 'タコと温ポテトのグリルサラダ' },
  '黑松露野菇牛肝菌燉飯': { 'en': 'Wild Mushroom Risotto', 'zh-TW': '黑松露野菇牛肝菌燉飯', 'ja': 'ポルチーニとキノコのリゾット' },
  '黑松露牛肝菌野菇燉飯': { 'en': 'Wild Mushroom Risotto', 'zh-TW': '黑松露牛肝菌野菇燉飯', 'ja': 'ポルチーニとキノコのリゾット' },
  '煙燻墨西哥切達起司醬薯條': { 'en': 'Smoked Jalapeño Poppers', 'zh-TW': '煙燻墨西哥切達起司醬薯條', 'ja': 'スモークハラペーニョポッパー' },
  '野莓洛神花桑格利亞特調': { 'en': 'Wild Berry Hibiscus Tea', 'zh-TW': '野莓洛神花桑格利亞特調', 'ja': 'ミックスベリーハイビスカスティー' },
  '手作芒果椰奶奶酪': { 'en': 'Artisan Mango Cheesecake', 'zh-TW': '手作芒果椰奶奶酪', 'ja': '濃厚マンゴーレアチーズケーキ' },
  '西班牙海鮮燉飯雙人套餐': { 'en': 'Seafood Paella Feast', 'zh-TW': '西班牙海鮮燉飯雙人套餐', 'ja': '極上シーフードパエリア' },
  '雙層培根厚起司牛肉堡': { 'en': 'Bacon Double Cheeseburger', 'zh-TW': '雙層培根厚起司牛肉堡', 'ja': 'ダブルベーコンチーズバーガー' },
  '美式黃金香脆無骨炸雞柳': { 'en': 'Crispy Chicken Tenders', 'zh-TW': '美式黃金香脆無骨炸雞柳', 'ja': 'サクサククリスピーチキンテンダー' },
  '美式肉醬起司重磅薯條': { 'en': 'Loaded Chili Cheese Fries', 'zh-TW': '美式肉醬起司重磅薯條', 'ja': 'チリチーズポテト' },
  '經典紐約水牛城酸辣烤雞翅': { 'en': 'Buffalo Chicken Wings', 'zh-TW': '經典紐約水牛城酸辣烤雞翅', 'ja': 'ニューヨークバッファローウィング' },
  '主廚經典美式肉捲佐洋芋泥': { 'en': 'Classic Meatloaf & Mash', 'zh-TW': '主廚經典美式肉捲佐洋芋泥', 'ja': 'クラシックミートローフ＆マッシュ' },
  '德州鄉村酥炸牛排佐白肉汁': { 'en': 'Country Fried Steak', 'zh-TW': '德州鄉村酥炸牛排佐白肉汁', 'ja': 'カントリーフライドステーキ' },
  '煙燻美式碳烤豬肋排': { 'en': 'BBQ Baby Back Ribs', 'zh-TW': '煙燻美式碳烤豬肋排', 'ja': 'スモークBBQベイビーバックリブ' },
  '經典金黃熔岩烤起司三明治': { 'en': 'Grilled Cheese Sandwich', 'zh-TW': '經典金黃熔岩烤起司三明治', 'ja': 'グリルドチーズサンドイッチ' },
  '金黃拉絲莫札瑞拉起司條': { 'en': 'Mozzarella Sticks', 'zh-TW': '金黃拉絲莫札瑞拉起司條', 'ja': '伸びるモッツァレラチーズスティック' },
  '費城經典鐵板起司牛肉堡': { 'en': 'Philly Cheesesteak', 'zh-TW': '費城經典鐵板起司牛肉堡', 'ja': 'フィリーチーズステーキサンド' },
  '濃郁比利時巧克力重磅奶昔': { 'en': 'Chocolate Milkshake', 'zh-TW': '濃郁比利時巧克力重磅奶昔', 'ja': '濃厚チョコレートミルクシェイク' },
  '美式傳統肉桂烤蘋果派': { 'en': 'Classic Apple Pie', 'zh-TW': '美式傳統肉桂烤蘋果派', 'ja': 'クラシックアップルパイ' },
  '經典漢堡薯條可樂特惠套餐': { 'en': 'Burger Fries & Soda Meal', 'zh-TW': '經典漢堡薯條可樂特惠套餐', 'ja': '定番バーガー＆ポテトドリンクセット' },
  '香甜蜂蜜煙燻BBQ烤雞翅': { 'en': 'Honey BBQ Wings', 'zh-TW': '香甜蜂蜜煙燻BBQ烤雞翅', 'ja': 'ハニーBBQチキンウィング' },
  '精釀啤酒麵衣巨無霸洋蔥圈': { 'en': 'Beer-Battered Onion Rings', 'zh-TW': '精釀啤酒麵衣巨無霸洋蔥圈', 'ja': 'ビール衣のオニオンリング' },
  '手撕慢燻黑豚豬肉堡': { 'en': 'Pulled Pork Sandwich', 'zh-TW': '手撕慢燻黑豚豬肉堡', 'ja': 'プルドポークサンドイッチ' },
  '四重起司焗烤通心粉': { 'en': 'Classic Macaroni and Cheese', 'zh-TW': '四重起司焗烤通心粉', 'ja': '濃厚マカロニ＆チーズ' },
  '美南鄉村金黃酥脆炸雞桶': { 'en': 'Southern Fried Chicken Bucket', 'zh-TW': '美南鄉村金黃酥脆炸雞桶', 'ja': '南部風フライドチキンバケット' },
  '舊金山酸種麵包碗蛤蜊濃湯': { 'en': 'Clam Chowder Soup Bread Bowl', 'zh-TW': '舊金山酸種麵包碗蛤蜊濃湯', 'ja': 'クラムチャウダー・ブレッドボウル' },
  '墨西哥香辣培根牛肉堡': { 'en': 'Spicy Jalapeño Bacon Burger', 'zh-TW': '墨西哥香辣培根牛肉堡', 'ja': 'スパイシーハラペーニョベーコンバーガー' },
  '紐奧良肯瓊香料格紋薯餅': { 'en': 'Cajun Seasoned Waffle Fries', 'zh-TW': '紐奧良肯瓊香料格紋薯餅', 'ja': 'ケイジャンワッフルポテト' },
  '炭烤嫩雞胸經典凱撒沙拉': { 'en': 'Grilled Chicken Caesar Salad', 'zh-TW': '炭烤嫩雞胸經典凱撒沙拉', 'ja': 'グリルチキンシーザーサラダ' },
  '美式經典麥根沙士冰淇淋漂浮': { 'en': 'Sno-Cone Root Beer Float', 'zh-TW': '美式經典麥根沙士冰淇淋漂浮', 'ja': 'ルートビアフロート' },
  '新鮮草莓純鮮奶手打奶昔': { 'en': 'Strawberry Milkshake', 'zh-TW': '新鮮草莓純鮮奶手打奶昔', 'ja': 'ストロベリーミルクシェイク' },
  '溫熱核桃布朗尼冰淇淋聖代': { 'en': 'Warm Brownie Sundae', 'zh-TW': '溫熱核桃布朗尼冰淇淋聖代', 'ja': '温かいブラウニーサンデー' },
  '紐約經典重乳酪蛋糕': { 'en': 'New York Style Cheesecake', 'zh-TW': '紐約經典重乳酪蛋糕', 'ja': 'ニューヨークスタイルチーズケーキ' },
  '水牛城辣雞酥炸菠菜捲餅': { 'en': 'Buffalo Chicken Wrap', 'zh-TW': '水牛城辣雞酥炸菠菜捲餅', 'ja': 'バッファローチキンラップ' },
  '美式金黃香脆玉米熱狗棒 3入': { 'en': 'Classic Corn Dogs (3pcs)', 'zh-TW': '美式金黃香脆玉米熱狗棒 3入', 'ja': 'アメリカンドッグ 3本' },
  '煙燻培根BBQ炸雞柳長堡': { 'en': 'BBQ Bacon Chicken Tender Sandwich', 'zh-TW': '煙燻培根BBQ炸雞柳長堡', 'ja': 'BBQベーコンチキンサンド' },
  '美式黃金酥脆三角薯餅': { 'en': 'Crispy Hash Browns', 'zh-TW': '美式黃金酥脆三角薯餅', 'ja': 'カリカリハッシュドポテト' },
  '美南經典冰鎮檸檬甜紅茶': { 'en': 'Southern Sweet Tea', 'zh-TW': '美南經典冰鎮檸檬甜紅茶', 'ja': '南部風アイススイートティー' },
  '家庭超值分享餐：碳烤豬肋排＋水牛城辣雞翅': { 'en': 'Family Ribs & Wings Combo', 'zh-TW': '家庭超值分享餐：碳烤豬肋排＋水牛城辣雞翅', 'ja': 'ファミリーリブ＆ウィングセット' },
  '美南傳統焦糖胡桃派': { 'en': 'Pecan Pie Slice', 'zh-TW': '美南傳統焦糖胡桃派', 'ja': '南部風香ばしピーカンパイ' },
};

export const DISH_DESC_TRANSLATIONS: Record<string, Record<Language, string>> = {
  ...DISH_ID_DESCS,
  ...Object.fromEntries(
    Object.entries(DISH_ID_NAMES).map(([id, names]) => [names.en, DISH_ID_DESCS[id]])
  ),
  ...Object.fromEntries(
    Object.entries(DISH_ID_NAMES).map(([id, names]) => [names['zh-TW'], DISH_ID_DESCS[id]])
  ),
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
  if (!category) return '';
  const match = CATEGORY_TRANSLATIONS[category]?.[lang];
  if (match) return match;
  
  // Dynamic category matching
  const catLower = category.toLowerCase().trim();
  if (catLower.includes('starter') || catLower.includes('appetizer') || catLower.includes('前菜')) {
    return lang === 'zh-TW' ? '開胃前菜' : lang === 'ja' ? '前菜・アペタイザー' : 'Starters';
  }
  if (catLower.includes('main') || catLower.includes('主餐') || catLower.includes('主食')) {
    return lang === 'zh-TW' ? '精緻主餐' : lang === 'ja' ? 'メインディッシュ' : 'Mains';
  }
  if (catLower.includes('drink') || catLower.includes('beverage') || catLower.includes('飲料') || catLower.includes('飲品')) {
    return lang === 'zh-TW' ? '特調飲品' : lang === 'ja' ? 'ドリンク・お飲み物' : 'Drinks';
  }
  if (catLower.includes('dessert') || catLower.includes('sweet') || catLower.includes('甜點')) {
    return lang === 'zh-TW' ? '手作甜點' : lang === 'ja' ? 'デザート・スイーツ' : 'Desserts';
  }
  if (catLower.includes('fry') || catLower.includes('side') || catLower.includes('炸物') || catLower.includes('點心')) {
    return lang === 'zh-TW' ? '炸物小點' : lang === 'ja' ? 'サイド・フライ' : 'Sides & Fries';
  }
  if (catLower.includes('combo') || catLower.includes('set') || catLower.includes('套餐')) {
    return lang === 'zh-TW' ? '超值套餐' : lang === 'ja' ? 'お得セット' : 'Combos';
  }
  return category;
}

// Culinary keyword vocabulary for dynamic translation of custom items from Google Sheets
const CULINARY_TERMS: { en: string; zh: string; ja: string }[] = [
  { en: 'Truffle', zh: '松露', ja: 'トリュフ' },
  { en: 'Mushroom', zh: '野菇', ja: 'きのこ' },
  { en: 'Bruschetta', zh: '普斯凱塔', ja: 'ブルスケッタ' },
  { en: 'Crispy', zh: '酥脆', ja: 'サクサク' },
  { en: 'Calamari', zh: '魷魚圈', ja: 'カラマリ' },
  { en: 'Caprese', zh: '卡布里', ja: 'カプレーゼ' },
  { en: 'Salad', zh: '沙拉', ja: 'サラダ' },
  { en: 'Skewers', zh: '串', ja: '串焼き' },
  { en: 'Prime Ribeye Steak', zh: '頂級肋眼牛排', ja: '極上リブアイステーキ' },
  { en: 'Ribeye Steak', zh: '肋眼牛排', ja: 'リブアイステーキ' },
  { en: 'Steak', zh: '牛排', ja: 'ステーキ' },
  { en: 'Wagyu', zh: '和牛', ja: '和牛' },
  { en: 'Burger', zh: '漢堡', ja: 'バーガー' },
  { en: 'Pan-Seared', zh: '香煎', ja: 'ソテー' },
  { en: 'Salmon', zh: '鮭魚', ja: 'サーモン' },
  { en: 'Carbonara', zh: '培根蛋黃麵', ja: 'カルボナーラ' },
  { en: 'Parmesan', zh: '帕瑪森起司', ja: 'パルメザン' },
  { en: 'Fries', zh: '薯條', ja: 'ポテトフライ' },
  { en: 'Sweet Potato', zh: '地瓜', ja: 'さつまいも' },
  { en: 'Mocktail', zh: '特調氣泡飲', ja: 'モクテル' },
  { en: 'Matcha Latte', zh: '抹茶拿鐵', ja: '抹茶ラテ' },
  { en: 'Matcha', zh: '抹茶', ja: '抹茶' },
  { en: 'Latte', zh: '拿鐵', ja: 'ラテ' },
  { en: 'Ale', zh: '愛爾啤酒', ja: 'エールビール' },
  { en: 'Beer', zh: '啤酒', ja: 'ビール' },
  { en: 'Chocolate Lava Cake', zh: '巧克力熔岩蛋糕', ja: 'フォンダンショコラ' },
  { en: 'Cake', zh: '蛋糕', ja: 'ケーキ' },
  { en: 'Tiramisu', zh: '提拉米蘇', ja: 'ティラミス' },
  { en: 'Roasted Chicken', zh: '香烤半雞', ja: 'ローストチキン' },
  { en: 'Chicken', zh: '雞肉', ja: 'チキン' },
  { en: 'Octopus', zh: '章魚', ja: 'タコ' },
  { en: 'Risotto', zh: '燉飯', ja: 'リゾット' },
  { en: 'Pasta', zh: '義大利麵', ja: 'パスタ' },
  { en: 'Spaghetti', zh: '義大利直麵', ja: 'スパゲッティ' },
  { en: 'Pizza', zh: '披薩', ja: 'ピザ' },
  { en: 'Sangria', zh: '桑格利亞', ja: 'サングリア' },
  { en: 'Panna Cotta', zh: '義式奶酪', ja: 'パンナコッタ' },
  { en: 'Paella', zh: '海鮮燉飯', ja: 'パエリア' },
  { en: 'Soup', zh: '濃湯', ja: 'スープ' },
  { en: 'Bread', zh: '麵包', ja: 'パン' },
  { en: 'Garlic Bread', zh: '香蒜麵包', ja: 'ガーリックトースト' },
  { en: 'Cheese', zh: '起司', ja: 'チーズ' },
  { en: 'Mozzarella', zh: '莫札瑞拉起司', ja: 'モッツァレラ' },
  { en: 'Garlic', zh: '大蒜', ja: 'ガーリック' },
  { en: 'Herb', zh: '香草', ja: 'ハーブ' },
  { en: 'Bacon', zh: '培根', ja: 'ベーコン' },
  { en: 'Egg', zh: '雞蛋', ja: 'たまご' },
  { en: 'Wine', zh: '紅酒/白酒', ja: 'ワイン' },
  { en: 'Coffee', zh: '咖啡', ja: 'コーヒー' },
  { en: 'Espresso', zh: '義式濃縮咖啡', ja: 'エスプレッソ' },
  { en: 'Vanilla', zh: '香草', ja: 'バニラ' },
  { en: 'Mango', zh: '芒果', ja: 'マンゴー' },
  { en: 'Coconut', zh: '椰奶', ja: 'ココナッツ' },
  { en: 'Avocado', zh: '酪梨', ja: 'アボカド' },
  { en: 'Lobster', zh: '龍蝦', ja: 'ロブスター' },
  { en: 'Shrimp', zh: '鮮蝦', ja: 'エビ' },
  { en: 'Pork', zh: '豬排', ja: 'ポーク' },
  { en: 'Beef', zh: '牛肉', ja: 'ビーフ' },
  { en: 'Combo', zh: '超值套餐', ja: 'セット' },
];

/**
 * Intelligent dish name translator that checks ID first, then dictionary,
 * then tries culinary keyword translation if fetched directly from Google Sheets.
 */
export function getDishName(name: string, lang: Language, id?: string): string {
  // 0. Direct ID lookup if available
  if (id && DISH_ID_NAMES[id]?.[lang]) {
    return DISH_ID_NAMES[id][lang];
  }

  if (!name) return '';
  const trimmed = name.trim();
  
  // 1. Direct dictionary match
  if (DISH_NAME_TRANSLATIONS[trimmed]?.[lang]) {
    return DISH_NAME_TRANSLATIONS[trimmed][lang];
  }

  // 2. If English requested and already English
  if (lang === 'en') {
    // Check if input was Chinese/Japanese mapped to English
    for (const [enKey, map] of Object.entries(DISH_NAME_TRANSLATIONS)) {
      if (map['zh-TW'] === trimmed || map['ja'] === trimmed) {
        return enKey;
      }
    }
    return trimmed;
  }

  // 3. Reverse lookup if input was Chinese and target is Japanese, etc.
  for (const [, map] of Object.entries(DISH_NAME_TRANSLATIONS)) {
    if (map['zh-TW'] === trimmed && map[lang]) {
      return map[lang];
    }
    if (map['ja'] === trimmed && map[lang]) {
      return map[lang];
    }
  }

  // 4. Dynamic keyword synthesis for custom items from DB
  let translated = trimmed;
  let hasReplacement = false;
  for (const term of CULINARY_TERMS) {
    const reg = new RegExp(`\\b${term.en}\\b`, 'gi');
    if (reg.test(translated)) {
      const targetWord = lang === 'zh-TW' ? term.zh : lang === 'ja' ? term.ja : term.en;
      translated = translated.replace(reg, targetWord);
      hasReplacement = true;
    }
  }

  return hasReplacement ? translated.replace(/\s+/g, ' ').trim() : trimmed;
}

/**
 * Intelligent description translator for items from Google Sheets DB.
 */
export function getDishDescription(item: MenuItem, lang: Language): string {
  if (!item) return '';
  const id = (item.id || '').trim();
  const nameTrimmed = (item.name || '').trim();
  const descTrimmed = (item.description || '').trim();

  // 0. Direct lookup by ID if available (handles m-1 through m-55)
  if (id && DISH_ID_DESCS[id]?.[lang]) {
    // If no custom user description is present, or if it matches default English/Chinese desc, return localized desc
    if (!descTrimmed || descTrimmed === DISH_ID_DESCS[id]['en'] || descTrimmed === DISH_ID_DESCS[id]['zh-TW'] || descTrimmed === DISH_ID_DESCS[id]['ja']) {
      return DISH_ID_DESCS[id][lang];
    }
  }

  // 1. Check if known translation exists for the dish name
  const nameDescTrans = DISH_DESC_TRANSLATIONS[nameTrimmed]?.[lang];
  if (nameDescTrans && (!descTrimmed || descTrimmed === DISH_DESC_TRANSLATIONS[nameTrimmed]?.['en'])) {
    return nameDescTrans;
  }

  // 2. If item has custom description from Google Sheets DB
  if (descTrimmed) {
    // Check if exact description text matches any known translation
    for (const [, map] of Object.entries(DISH_DESC_TRANSLATIONS)) {
      if (map['en'] === descTrimmed && map[lang]) {
        return map[lang];
      }
      if (map['zh-TW'] === descTrimmed && map[lang]) {
        return map[lang];
      }
      if (map['ja'] === descTrimmed && map[lang]) {
        return map[lang];
      }
    }

    // If English requested and description is already in English
    if (lang === 'en') {
      return descTrimmed;
    }

    // Dynamic term translation for custom Google Sheets descriptions
    let dynamicText = descTrimmed;
    let didTranslate = false;
    for (const term of CULINARY_TERMS) {
      const reg = new RegExp(`\\b${term.en}\\b`, 'gi');
      if (reg.test(dynamicText)) {
        const replacement = lang === 'zh-TW' ? term.zh : lang === 'ja' ? term.ja : term.en;
        dynamicText = dynamicText.replace(reg, replacement);
        didTranslate = true;
      }
    }

    if (didTranslate) {
      return dynamicText;
    }

    return descTrimmed;
  }

  // Fallback to name-based or ID-based description translation if available
  return (id && DISH_ID_DESCS[id]?.[lang]) || DISH_DESC_TRANSLATIONS[nameTrimmed]?.[lang] || '';
}

export function getModifierLabel(mod: string, lang: Language): string {
  if (!mod) return '';
  return MODIFIER_TRANSLATIONS[mod]?.[lang] || (lang === 'zh-TW' ? MODIFIER_TRANSLATIONS[mod]?.['zh-TW'] : mod) || mod;
}
