import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export default function SearchableSelect({ options = [], value, onChange, placeholder, id }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const { t } = useI18n();
  const searchPlaceholder = placeholder || t('searchable_select.search');

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const select = (opt) => {
    onChange(opt);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        id={id}
        value={open ? query : value}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={searchPlaceholder}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8, border: 'none',
          background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 14,
          fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              {t('searchable_select.no_matches')}
            </div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt}
                onClick={() => select(opt)}
                style={{
                  padding: '10px 14px', cursor: 'pointer', color: 'white', fontSize: 14,
                  background: opt === value ? 'rgba(201,169,110,0.2)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => { e.currentTarget.style.background = opt === value ? 'rgba(201,169,110,0.2)' : 'transparent'; }}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
