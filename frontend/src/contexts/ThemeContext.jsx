/**
 * @fileoverview Theme context supporting light, dark, and system-preference modes.
 * Persists choice to localStorage under 'ahf-theme'.
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const ThemeContext = createContext(null);

/** Read the user's saved preference or default to 'system'. */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('ahf-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

/** Detect OS-level dark-mode preference. */
function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Resolve 'system' preference to actual light/dark value. */
function resolveTheme(preference) {
  if (preference === 'system') return getSystemTheme();
  return preference;
}

/**
 * Provides theme context. Listens to system preference changes when mode is 'system'.
 */
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(getInitialTheme);
  const [theme, setTheme] = useState(() => resolveTheme(getInitialTheme()));
  const mediaRef = useRef(null);

  const applyTheme = useCallback((t) => {
    const resolved = t === 'system' ? getSystemTheme() : t;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
    setTheme(resolved);
  }, []);

  const changePreference = useCallback((newPref) => {
    setPreference(newPref);
    localStorage.setItem('ahf-theme', newPref);
    applyTheme(newPref);
  }, [applyTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mediaRef.current = mq;

    const handler = () => {
      if (preference === 'system') {
        applyTheme('system');
      }
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference, applyTheme]);

  useEffect(() => {
    applyTheme(preference);
  }, [preference, applyTheme]);

  useEffect(() => {
    const stored = localStorage.getItem('ahf-theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setPreference(stored);
      applyTheme(stored);
    }
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, changePreference, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Returns theme context — must be used within <ThemeProvider>. */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
