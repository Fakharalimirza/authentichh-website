import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function RowActions({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!actions || actions.length === 0) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 6,
          border: 'none', background: 'transparent',
          color: 'var(--color-text-muted)', cursor: 'pointer',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-secondary)'; e.currentTarget.style.color = 'var(--color-text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        aria-label="Actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 4,
          minWidth: 160, zIndex: 50,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: '4px 0',
          animation: 'fadeIn 150ms ease-out',
        }}>
          {actions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { action.onClick(); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 14px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)',
                color: action.variant === 'danger' ? 'var(--color-error)' : 'var(--color-text)',
                textAlign: 'left',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = action.variant === 'danger' ? 'rgba(var(--color-error-rgb, 220,38,38), 0.08)' : 'var(--color-surface-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <action.icon size={15} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
