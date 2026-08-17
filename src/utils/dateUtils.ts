// Utilities for date and time formatting in UTC+8 (Asia/Shanghai) across POS & Google Sheets

export const TIMEZONE_UTC8 = 'Asia/Taipei';

/**
 * Get current date/time string in ISO format with +08:00 offset
 */
export function getUTC8ISOString(d: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE_UTC8,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const m: Record<string, string> = {};
    parts.forEach(p => {
      m[p.type] = p.value;
    });
    return `${m.year}-${m.month}-${m.day}T${m.hour}:${m.minute}:${m.second}+08:00`;
  } catch {
    return d.toISOString();
  }
}

/**
 * Today's date string 'YYYY-MM-DD' in UTC+8
 */
export function getTodayUTC8(): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE_UTC8 });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Format any date input to 'YYYY-MM-DD' in UTC+8 (Asia/Taipei)
 */
export function formatDateUTC8(val?: string | number | Date | null): string {
  if (!val) return getTodayUTC8();

  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      try {
        return val.toLocaleDateString('en-CA', { timeZone: TIMEZONE_UTC8 });
      } catch {
        return val.toISOString().split('T')[0];
      }
    }
  }

  const str = String(val).trim();
  if (!str) return getTodayUTC8();

  // Parse ISO string or timestamp if it includes time component or ISO markers
  if (str.includes('T') || str.includes('Z') || str.includes(':') || typeof val === 'number') {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      try {
        return parsed.toLocaleDateString('en-CA', { timeZone: TIMEZONE_UTC8 });
      } catch {
        return parsed.toISOString().split('T')[0];
      }
    }
  }

  // If already a plain date pattern like YYYY-MM-DD
  const dateMatch = str.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
  if (dateMatch) {
    const y = dateMatch[1];
    const m = dateMatch[2].padStart(2, '0');
    const d = dateMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    try {
      return parsed.toLocaleDateString('en-CA', { timeZone: TIMEZONE_UTC8 });
    } catch {
      return parsed.toISOString().split('T')[0];
    }
  }

  return str;
}

/**
 * Format any time/date input to 'HH:mm' (24-hour format) in UTC+8
 */
export function formatTimeUTC8(val?: string | number | Date | null): string {
  if (!val) return '19:00';
  const str = String(val).trim();

  // Handle Chinese '上午' / '下午' or 'AM' / 'PM'
  if (str.includes('上午') || str.includes('下午') || str.toLowerCase().includes('pm') || str.toLowerCase().includes('am')) {
    const isPM = str.includes('下午') || str.toLowerCase().includes('pm');
    const isAM = str.includes('上午') || str.toLowerCase().includes('am');
    const cleanStr = str.replace(/[^\d:]/g, ' ').trim();
    const timeMatch = cleanStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10) || 0;
      const m = parseInt(timeMatch[2], 10) || 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  // Handle ISO string like '2026-07-19T03:00:00.000Z' or '2026-07-19T11:00:00+08:00'
  if (str.includes('T') || str.endsWith('Z') || str.includes('+')) {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      try {
        return parsed.toLocaleTimeString('en-GB', {
          timeZone: TIMEZONE_UTC8,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      } catch {
        const parts = parsed.toISOString().split('T')[1]?.split(':');
        if (parts) return `${parts[0]}:${parts[1]}`;
      }
    }
  }

  // Handle standard HH:mm or HH:mm:ss string
  const simpleMatch = str.match(/(\d{1,2}):(\d{2})/);
  if (simpleMatch) {
    const h = simpleMatch[1].padStart(2, '0');
    const m = simpleMatch[2].padStart(2, '0');
    return `${h}:${m}`;
  }

  return str;
}

/**
 * Format full date and time string in UTC+8
 */
export function formatDateTimeUTC8(
  val?: string | number | Date | null,
  locale: string = 'zh-TW'
): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);

  try {
    return d.toLocaleString(locale, {
      timeZone: TIMEZONE_UTC8,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return d.toISOString();
  }
}

/**
 * Format time for display in UTC+8 (e.g. "上午 11:00" or "11:00 AM")
 */
export function formatTimeDisplayUTC8(
  val?: string | number | Date | null,
  locale: string = 'zh-TW'
): string {
  if (!val) return '';
  
  if (typeof val === 'string' && /^\d{1,2}:\d{2}$/.test(val)) {
    const [hStr, mStr] = val.split(':');
    const h = parseInt(hStr, 10);
    if (locale === 'zh-TW' || locale === 'zh-CN') {
      const period = h >= 12 ? '下午' : '上午';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${period} ${String(displayH).padStart(2, '0')}:${mStr}`;
    } else {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH}:${mStr} ${period}`;
    }
  }

  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);

  try {
    return d.toLocaleTimeString(locale, {
      timeZone: TIMEZONE_UTC8,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(val);
  }
}

