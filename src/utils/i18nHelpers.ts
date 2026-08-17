import { Language } from '../i18n/translations';

// Category translation
export function translateCategory(cat: string, lang: Language): string {
  if (lang === 'zh-TW') {
    switch (cat) {
      case 'Starters': return '前菜點心';
      case 'Mains': return '主餐排餐';
      case 'Drinks': return '飲料特調';
      case 'Desserts': return '精緻甜點';
      case 'Fries': return '炸物點心';
      case 'Others': return '其他商品';
      default: return cat;
    }
  } else if (lang === 'ja') {
    switch (cat) {
      case 'Starters': return '前菜・前菜料理';
      case 'Mains': return 'メインディッシュ';
      case 'Drinks': return 'ドリンク・お飲み物';
      case 'Desserts': return 'デザート・スイーツ';
      case 'Fries': return 'サイド・フライ';
      case 'Others': return 'その他';
      default: return cat;
    }
  }
  return cat;
}

// Order Status translation
export function translateOrderStatus(status: string, lang: Language): string {
  if (lang === 'zh-TW') {
    switch (status) {
      case 'Pending': return '待處理 (Pending)';
      case 'Cooking': return '烹調中 (Cooking)';
      case 'Ready': return '準備出餐 (Ready)';
      case 'Served': return '已出餐 (Served)';
      case 'Completed': return '已完成 (Completed)';
      case 'Cancelled': return '已取消 (Cancelled)';
      default: return status;
    }
  } else if (lang === 'ja') {
    switch (status) {
      case 'Pending': return '未調理';
      case 'Cooking': return '調理中';
      case 'Ready': return '提供可能';
      case 'Served': return '提供済み';
      case 'Completed': return '完了';
      case 'Cancelled': return 'キャンセル';
      default: return status;
    }
  }
  return status;
}

// Table Status translation
export function translateTableStatus(status: string, lang: Language): string {
  if (lang === 'zh-TW') {
    switch (status) {
      case 'Available': return '空桌';
      case 'Occupied': return '使用中';
      case 'Reserved': return '已預約';
      case 'Cleaning': return '清潔中';
      default: return status;
    }
  } else if (lang === 'ja') {
    switch (status) {
      case 'Available': return '空席';
      case 'Occupied': return '使用中';
      case 'Reserved': return '予約済み';
      case 'Cleaning': return 'バッシング中';
      default: return status;
    }
  }
  return status;
}

// Order Type translation
export function translateOrderType(type: string, lang: Language): string {
  if (lang === 'zh-TW') {
    switch (type) {
      case 'Dine-in': return '內用';
      case 'Takeaway': return '外帶';
      case 'Delivery': return '外送';
      default: return type;
    }
  } else if (lang === 'ja') {
    switch (type) {
      case 'Dine-in': return '店内飲食';
      case 'Takeaway': return 'テイクアウト';
      case 'Delivery': return 'デリバリー';
      default: return type;
    }
  }
  return type;
}

// Payment Method translation
export function translatePaymentMethod(method: string | undefined, lang: Language): string {
  if (!method) return lang === 'zh-TW' ? '未付款' : lang === 'ja' ? '未払い' : 'Unpaid';
  if (lang === 'zh-TW') {
    switch (method) {
      case 'Cash': return '現金支付';
      case 'Credit Card': return '信用卡';
      case 'Debit Card': return '簽帳金融卡';
      case 'QR Code': return '掃碼支付 (Line Pay / JKOPAY)';
      case 'Digital Wallet': return '電子錢包';
      case 'Split': return '分開結帳';
      default: return method;
    }
  } else if (lang === 'ja') {
    switch (method) {
      case 'Cash': return '現金';
      case 'Credit Card': return 'クレジットカード';
      case 'Debit Card': return 'デビットカード';
      case 'QR Code': return 'QRコード決済';
      case 'Digital Wallet': return '電子マネー';
      case 'Split': return '個別会計';
      default: return method;
    }
  }
  return method;
}

// Modifier translation helper
export function translateModifier(mod: string, lang: Language): string {
  if (!mod) return '';

  const modMap: Record<string, { zh: string; ja: string }> = {
    // Steaks & Meats
    '一分熟 (Rare)': { zh: '一分熟', ja: 'レア (Rare)' },
    '三分熟 (Medium Rare)': { zh: '三分熟', ja: 'ミディアムレア (Medium Rare)' },
    '五分熟 (Medium)': { zh: '五分熟', ja: 'ミディアム (Medium)' },
    '七分熟 (Medium Well)': { zh: '七分熟', ja: 'ミディアムウェル (Medium Well)' },
    '全熟 (Well Done)': { zh: '全熟', ja: 'ウェルダン (Well Done)' },
    'Rare': { zh: '一分熟', ja: 'レア' },
    'Medium Rare': { zh: '三分熟', ja: 'ミディアムレア' },
    'Medium': { zh: '五分熟', ja: 'ミディアム' },
    'Medium Well': { zh: '七分熟', ja: 'ミディアムウェル' },
    'Well Done': { zh: '全熟', ja: 'ウェルダン' },

    // Drinks / Ice / Sugar
    '正常冰': { zh: '正常冰', ja: '氷普通' },
    '少冰': { zh: '少冰', ja: '氷少なめ' },
    '微冰': { zh: '微冰', ja: '氷極少なめ' },
    '去冰': { zh: '去冰 (冷飲)', ja: '氷なし (コールド)' },
    '熱飲': { zh: '熱飲 (溫熱)', ja: 'ホット (温)' },
    '常溫': { zh: '常溫', ja: '常温' },
    'Regular Ice': { zh: '正常冰', ja: '氷普通' },
    'Less Ice': { zh: '少冰', ja: '氷少なめ' },
    'No Ice': { zh: '去冰', ja: '氷なし' },
    'Hot': { zh: '熱飲', ja: 'ホット' },

    '正常糖': { zh: '正常糖 (100%)', ja: '砂糖普通 (100%)' },
    '少糖': { zh: '少糖 (70%)', ja: '砂糖少なめ (70%)' },
    '半糖': { zh: '半糖 (50%)', ja: '半糖 (50%)' },
    '微糖': { zh: '微糖 (30%)', ja: '微糖 (30%)' },
    '無糖': { zh: '無糖 (0%)', ja: '無糖 (0%)' },

    // Spiciness
    '不辣': { zh: '不辣', ja: '辛さなし' },
    '微辣': { zh: '微辣', ja: 'ピリ辛' },
    '中辣': { zh: '中辣', ja: '中辛' },
    '大辣': { zh: '大辣', ja: '激辛' },
    'Mild': { zh: '微辣', ja: 'ピリ辛' },
    'Spicy': { zh: '中辣', ja: '中辛' },
    'Extra Hot': { zh: '大辣', ja: '激辛' },

    // Food preferences
    '醬料另附': { zh: '醬料另附', ja: 'ソース別添え' },
    '加起司': { zh: '加起司', ja: 'チーズ追加' },
    '去起司': { zh: '去起司', ja: 'チーズ抜き' },
    '去蒜': { zh: '去蒜', ja: 'ニンニク抜き' },
    '去洋蔥': { zh: '去洋蔥', ja: '玉ねぎ抜き' },
    '少鹽': { zh: '少鹽', ja: '塩分少なめ' },
    '加黑松露油': { zh: '加黑松露油', ja: '黒トリュフオイル追加' },
    '燕麥奶': { zh: '換燕麥奶', ja: 'オーツミルクに変更' },
    '杏仁奶': { zh: '換杏仁奶', ja: 'アーモンドミルクに変更' },
    '素食': { zh: '素食/蛋奶素', ja: 'ベジタリアン対応' },
    '無麩質': { zh: '無麩質', ja: 'グルテンフリー' },
  };

  if (lang === 'zh-TW') {
    return modMap[mod]?.zh || mod;
  } else if (lang === 'ja') {
    return modMap[mod]?.ja || mod;
  }
  return mod;
}
