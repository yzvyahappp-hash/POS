import { OrderItem, PromoRule, AppliedPromo, MenuItem } from '../types';

/**
 * Evaluates active automatic promo rules against order items and subtotal.
 * Returns the list of applied promos (with title, reason, and discount amount)
 * and the calculated total promo discount.
 */
export function evaluateOrderPromos(
  items: OrderItem[],
  subtotal: number,
  promoRules: PromoRule[],
  menuItems?: MenuItem[]
): { appliedPromos: AppliedPromo[]; totalPromoDiscount: number } {
  if (!items || items.length === 0 || !promoRules || promoRules.length === 0) {
    return { appliedPromos: [], totalPromoDiscount: 0 };
  }

  // Filter only active automatic promo rules
  const activeRules = promoRules.filter(r => r.isActive && r.isAutomatic);
  const appliedPromos: AppliedPromo[] = [];
  let totalPromoDiscount = 0;

  // Build a map of category counts from items
  const categoryCountMap: Record<string, number> = {};
  items.forEach(item => {
    let cat = (item as any).category;
    if (!cat && menuItems) {
      const found = menuItems.find(m => m.id === item.menuItemId || m.name === item.name);
      if (found) cat = found.category;
    }
    // Fallback heuristic if category property is missing:
    if (!cat) {
      const nameLower = item.name.toLowerCase();
      if (
        nameLower.includes('latte') ||
        nameLower.includes('mocktail') ||
        nameLower.includes('ale') ||
        nameLower.includes('drink') ||
        nameLower.includes('tea') ||
        nameLower.includes('coffee') ||
        nameLower.includes('sangria')
      ) {
        cat = 'Drinks';
      } else if (
        nameLower.includes('steak') ||
        nameLower.includes('burger') ||
        nameLower.includes('salmon') ||
        nameLower.includes('carbonara') ||
        nameLower.includes('risotto') ||
        nameLower.includes('paella') ||
        nameLower.includes('chicken')
      ) {
        cat = 'Mains';
      } else if (
        nameLower.includes('fries') ||
        nameLower.includes('bruschetta') ||
        nameLower.includes('calamari') ||
        nameLower.includes('salad') ||
        nameLower.includes('skewers')
      ) {
        cat = 'Appetizers';
      } else if (
        nameLower.includes('cake') ||
        nameLower.includes('tiramisu') ||
        nameLower.includes('panna cotta')
      ) {
        cat = 'Desserts';
      } else {
        cat = 'Mains';
      }
    }

    categoryCountMap[cat] = (categoryCountMap[cat] || 0) + item.quantity;
  });

  for (const rule of activeRules) {
    let qualifies = true;
    const reasons: string[] = [];

    // 1. Check category conditions (e.g. 1 Mains + 2 Drinks)
    if (rule.categoryConditions && rule.categoryConditions.length > 0) {
      for (const cond of rule.categoryConditions) {
        const currentCount = categoryCountMap[cond.category] || 0;
        if (currentCount < cond.minQuantity) {
          qualifies = false;
          break;
        } else {
          reasons.push(`${cond.minQuantity}x ${cond.category}`);
        }
      }
    }

    // 2. Check minimum subtotal
    if (qualifies && rule.minSubtotal && rule.minSubtotal > 0) {
      if (subtotal < rule.minSubtotal) {
        qualifies = false;
      } else {
        reasons.push(`Subtotal ≥ $${rule.minSubtotal}`);
      }
    }

    // 3. Check required item IDs
    if (qualifies && rule.requiredMenuItemIds && rule.requiredMenuItemIds.length > 0) {
      for (const reqId of rule.requiredMenuItemIds) {
        const foundItem = items.find(it => it.menuItemId === reqId);
        if (!foundItem) {
          qualifies = false;
          break;
        }
      }
    }

    if (qualifies) {
      let discount = 0;
      if (rule.discountType === 'fixed') {
        discount = rule.discountValue;
      } else if (rule.discountType === 'percentage') {
        discount = (subtotal * rule.discountValue) / 100;
      }

      discount = Math.min(subtotal - totalPromoDiscount, Math.max(0, discount));
      if (discount > 0) {
        totalPromoDiscount += discount;
        const reasonStr =
          reasons.length > 0
            ? `${rule.title} (${reasons.join(' + ')})`
            : rule.description || rule.title;

        appliedPromos.push({
          promoId: rule.id,
          title: rule.title,
          reason: reasonStr,
          discountAmount: discount,
        });
      }
    }
  }

  return { appliedPromos, totalPromoDiscount };
}
