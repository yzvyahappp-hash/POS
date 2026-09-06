/**
 * Safe LocalStorage utility with QuotaExceeded error recovery and fallback.
 * Prevents DOMException / QuotaExceededError from crashing React components.
 */

export function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === null || saved === undefined) {
      return fallback;
    }
    try {
      const parsed = JSON.parse(saved);
      return (parsed ?? fallback) as T;
    } catch {
      // If it's a raw string rather than JSON
      return saved as unknown as T;
    }
  } catch (err) {
    console.warn(`[Storage] Failed to get item for key "${key}":`, err);
    return fallback;
  }
}

export function safeSetItem(key: string, value: unknown): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  try {
    window.localStorage.setItem(key, stringValue);
    return true;
  } catch (err) {
    console.warn(`[Storage] Quota or access error while setting "${key}". Attempting auto-cleanup...`, err);

    // Auto-recovery for quota exceeded: Prune non-critical cache & large activity logs
    try {
      // Prune activity logs to last 30
      const rawLogs = window.localStorage.getItem('pos_activity_logs');
      if (rawLogs) {
        try {
          const parsedLogs = JSON.parse(rawLogs);
          if (Array.isArray(parsedLogs) && parsedLogs.length > 30) {
            window.localStorage.setItem('pos_activity_logs', JSON.stringify(parsedLogs.slice(0, 30)));
          }
        } catch {
          window.localStorage.removeItem('pos_activity_logs');
        }
      }

      // Try setting the item again
      window.localStorage.setItem(key, stringValue);
      return true;
    } catch (secondErr) {
      console.error(`[Storage] Failed to recover from quota error for key "${key}":`, secondErr);
      return false;
    }
  }
}

export function safeRemoveItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to remove item for key "${key}":`, err);
  }
}
