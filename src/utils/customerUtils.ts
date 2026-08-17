import { Customer } from '../types';
import { formatDateUTC8, getTodayUTC8 } from './dateUtils';

/**
 * Normalizes a phone number by stripping all non-digit characters.
 * E.g., "+1 555-0123" -> "15550123", "(555) 012-3456" -> "5550123456"
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Checks if two phone numbers match, accounting for country codes or local zero prefixes.
 */
export function isPhoneMatch(p1?: string, p2?: string): boolean {
  const norm1 = normalizePhone(p1);
  const norm2 = normalizePhone(p2);
  if (!norm1 || !norm2) return false;
  if (norm1 === norm2) return true;

  // Compare trailing digits (last 7 to 10 digits for local number match)
  const len = Math.min(norm1.length, norm2.length);
  if (len >= 7) {
    const tail1 = norm1.slice(-7);
    const tail2 = norm2.slice(-7);
    if (tail1 === tail2) return true;
  }
  return false;
}

/**
 * Checks if two email addresses match (case-insensitive, trimmed).
 */
export function isEmailMatch(e1?: string, e2?: string): boolean {
  if (!e1 || !e2) return false;
  const clean1 = e1.trim().toLowerCase();
  const clean2 = e2.trim().toLowerCase();
  if (clean1 === '' || clean2 === '') return false;
  return clean1 === clean2;
}

/**
 * Checks if two names match closely (case-insensitive, trimmed).
 */
export function isNameMatch(n1?: string, n2?: string): boolean {
  if (!n1 || !n2) return false;
  const clean1 = n1.trim().toLowerCase();
  const clean2 = n2.trim().toLowerCase();
  if (
    clean1 === '' ||
    clean2 === '' ||
    clean1 === 'guest' ||
    clean2 === 'guest' ||
    clean1 === 'walk-in guest' ||
    clean2 === 'walk-in guest'
  ) {
    return false;
  }
  if (clean1 === clean2) return true;

  // Compare normalized string without bracketed content e.g. "Eric Chen (陳 先生)" -> "eric chen"
  const norm1 = clean1.replace(/[\(\)\（\）]/g, ' ').replace(/\s+/g, ' ').trim();
  const norm2 = clean2.replace(/[\(\)\（\）]/g, ' ').replace(/\s+/g, ' ').trim();

  if (norm1 === norm2) return true;

  return false;
}

/**
 * Smart check if two target records refer to the same customer profile.
 * Phone number match is the primary identity validator.
 * Two records with different phone numbers will NEVER be treated as the same customer.
 */
export function isSameCustomer(
  target: { id?: string; name?: string; phone?: string; email?: string },
  candidate: Customer
): boolean {
  // Direct ID match
  if (target.id && candidate.id && target.id === candidate.id) return true;

  // Phone number evaluation (Primary Identity Rule)
  const targetHasPhone = Boolean(target.phone && normalizePhone(target.phone).length >= 6);
  const candidateHasPhone = Boolean(candidate.phone && normalizePhone(candidate.phone).length >= 6);

  if (targetHasPhone && candidateHasPhone) {
    // If both have phone numbers, they ONLY match if phone numbers match!
    return isPhoneMatch(target.phone, candidate.phone);
  }

  // Email match
  if (isEmailMatch(target.email, candidate.email)) return true;

  // Phone match if only one side provided phone but it matches
  if (isPhoneMatch(target.phone, candidate.phone)) return true;

  // Name match ONLY if exact name match and neither record has conflicting phone
  if (isNameMatch(target.name, candidate.name)) return true;

  return false;
}

/**
 * Finds an existing customer in a list using smart identity matching.
 */
export function findExistingCustomer(
  customers: Customer[],
  target: { id?: string; name?: string; phone?: string; email?: string }
): Customer | undefined {
  if (!target.name && !target.phone && !target.email && !target.id) return undefined;

  // Ignore generic guest names
  const cleanName = target.name?.trim().toLowerCase();
  if (cleanName === 'guest' || cleanName === 'walk-in guest') {
    // Only search if phone or email exists
    if (!target.phone && !target.email) return undefined;
  }

  return customers.find(c => isSameCustomer(target, c));
}

/**
 * Scans a customer list and finds potential duplicate customer profiles.
 * Returns groups of duplicate customer profiles.
 */
export function findDuplicateCustomerGroups(customers: Customer[]): Customer[][] {
  const visited = new Set<string>();
  const duplicateGroups: Customer[][] = [];

  for (let i = 0; i < customers.length; i++) {
    const current = customers[i];
    if (visited.has(current.id)) continue;

    const group: Customer[] = [current];

    for (let j = i + 1; j < customers.length; j++) {
      const candidate = customers[j];
      if (visited.has(candidate.id)) continue;

      if (isSameCustomer({ name: current.name, phone: current.phone, email: current.email }, candidate)) {
        group.push(candidate);
        visited.add(candidate.id);
      }
    }

    if (group.length > 1) {
      visited.add(current.id);
      duplicateGroups.push(group);
    }
  }

  return duplicateGroups;
}

/**
 * Merges a list of duplicate customer profiles into a single consolidated Customer profile.
 */
export function mergeCustomerProfiles(primary: Customer, duplicates: Customer[]): Customer {
  let mergedSpent = primary.totalSpent || 0;
  let mergedVisits = primary.visitCount || 0;
  let mergedPoints = primary.loyaltyPoints || 0;
  const favoriteSet = new Set<string>(primary.favoriteDishes || []);
  const notesList: string[] = primary.notes ? [primary.notes] : [];

  let bestPhone = primary.phone || '';
  let bestEmail = primary.email || '';
  let bestBirthday = primary.birthday || '';
  let latestVisit = primary.lastVisit || '';

  duplicates.forEach(dup => {
    mergedSpent += dup.totalSpent || 0;
    mergedVisits += dup.visitCount || 0;
    mergedPoints += dup.loyaltyPoints || 0;

    (dup.favoriteDishes || []).forEach(d => favoriteSet.add(d));

    if (dup.notes && !notesList.includes(dup.notes)) {
      notesList.push(dup.notes);
    }

    if (!bestPhone && dup.phone) bestPhone = dup.phone;
    if (!bestEmail && dup.email) bestEmail = dup.email;
    if (!bestBirthday && dup.birthday) bestBirthday = dup.birthday;

    if (dup.lastVisit && (!latestVisit || new Date(dup.lastVisit).getTime() > new Date(latestVisit).getTime())) {
      latestVisit = dup.lastVisit;
    }
  });

  // Calculate updated tier based on total points & spent
  let tier: Customer['tier'] = primary.tier;
  if (mergedPoints >= 1000 || mergedSpent >= 1200) tier = 'VIP';
  else if (mergedPoints >= 500 || mergedSpent >= 600) tier = 'Gold';
  else if (mergedPoints >= 200 || mergedSpent >= 250) tier = 'Silver';
  else tier = 'Bronze';

  return {
    ...primary,
    phone: bestPhone,
    email: bestEmail,
    birthday: bestBirthday,
    totalSpent: mergedSpent,
    visitCount: mergedVisits,
    loyaltyPoints: mergedPoints,
    tier,
    favoriteDishes: Array.from(favoriteSet),
    notes: notesList.join(' | '),
    lastVisit: latestVisit ? formatDateUTC8(latestVisit) : getTodayUTC8(),
  };
}
