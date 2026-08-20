/**
 * @fileoverview Toast notification system with context provider, auto-dismiss, and pause-on-hover.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 10l3 3 7-7" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="10" r="7" /><path d="M7 7l6 6M13 7l-6 6" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2L2 18h16L10 2z" /><path d="M10 8v4M10 14h0" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" /><path d="M10 9v5M10 7h0" />
    </svg>
  ),
};

let toastId = 0;

/**
 * Wraps the app to provide toast notification context.
 * Renders a toast container with auto-dismiss timers.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      timers.current[id] = setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const pauseToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const resumeToast = useCallback((id, duration = 4000) => {
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => removeToast(id), duration || 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, pauseToast, resumeToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-label="Notifications">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            role="status"
            onMouseEnter={() => pauseToast(t.id)}
            onMouseLeave={() => resumeToast(t.id)}
          >
            <div className="toast-icon">{icons[t.type] || icons.info}</div>
            <div className="toast-content">
              {t.title && <p className="toast-title">{t.title}</p>}
              {t.message && <p className="toast-message">{t.message}</p>}
            </div>
            <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns toast context — must be used within <ToastProvider>. */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
