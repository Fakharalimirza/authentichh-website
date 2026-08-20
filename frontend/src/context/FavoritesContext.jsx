/**
 * @fileoverview Favorites context — persists saved property IDs to localStorage.
 * Heart toggles on cards and the /favorites page share the same saved state.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FavoritesContext = createContext(null);

const STORAGE_KEY = 'ahf-favorites';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((id) => {
    const pid = Number(id);
    return favorites.includes(pid);
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    const pid = Number(id);
    setFavorites(prev => prev.includes(pid) ? prev.filter(f => f !== pid) : [...prev, pid]);
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

/** Returns favorites context — must be used within <FavoritesProvider>. */
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
