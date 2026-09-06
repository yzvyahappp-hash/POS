import { useState, useEffect } from 'react';
import { Language, translations, Translations } from './translations';
import { safeGetItem, safeSetItem } from '../utils/storage';

const LANG_EVENT = 'pos_lang_changed';

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = safeGetItem<string>('pos_language', 'en');
    return (saved === 'zh-TW' || saved === 'ja' || saved === 'en') ? (saved as Language) : 'en';
  });

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    safeSetItem('pos_language', newLang);
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: newLang }));
  };

  useEffect(() => {
    const handleCustomLang = (e: Event) => {
      const customEv = e as CustomEvent<Language>;
      if (customEv.detail) {
        setLang(customEv.detail);
      }
    };
    const handleStorage = () => {
      const saved = safeGetItem<string>('pos_language', 'en');
      if (saved && (saved === 'zh-TW' || saved === 'ja' || saved === 'en')) {
        setLang(saved as Language);
      }
    };

    window.addEventListener(LANG_EVENT, handleCustomLang);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(LANG_EVENT, handleCustomLang);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const t = (key: keyof Translations): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return { lang, changeLanguage, t };
}
