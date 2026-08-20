/**
 * @fileoverview Lightweight i18n context — provides locale, dir, and t() for English/Arabic.
 * No external dependency — just React Context + JSON dictionaries.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './en.json';
import ar from './ar.json';

const dictionaries = { en, ar };
const I18nContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}

function interpolate(str, vars) {
  if (!str || !vars) return str;
  return Object.entries(vars).reduce(
    (result, [key, val]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), val),
    str
  );
}

function getPluralForm(locale, count) {
  if (locale === 'ar') {
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    if (count === 2) return 'two';
    if (count >= 3 && count <= 10) return 'few';
    return 'many';
  }
  return count === 1 ? 'one' : 'other';
}

export function I18nProvider({ children }) {
  const stored = localStorage.getItem('ahf-locale');
  const [locale, setLocaleState] = useState(
    stored === 'ar' || stored === 'en' ? stored : 'en'
  );

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const setLocale = useCallback((newLocale) => {
    if (newLocale !== 'en' && newLocale !== 'ar') return;
    setLocaleState(newLocale);
    localStorage.setItem('ahf-locale', newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  }, []);

  // Apply on mount
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, []);

  const t = useCallback((key, vars) => {
    const dict = dictionaries[locale] || dictionaries.en;
    let value = getNestedValue(dict, key);

    // Plural handling: try locale-specific plural form
    if (value === null && vars && vars.count !== undefined) {
      const form = getPluralForm(locale, vars.count);
      value = getNestedValue(dict, `${key}_${form}`);
    }

    // Fallback to English
    if (value === null) {
      value = getNestedValue(dictionaries.en, key);
    }

    // Last resort: return the key itself
    if (value === null) return key;

    return interpolate(String(value), vars);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
