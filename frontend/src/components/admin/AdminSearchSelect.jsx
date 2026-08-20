/**
 * @fileoverview Searchable admin filter dropdown. Used by AdminFilterBar for filters
 * with many options (>= 8). Trigger is styled like .filter-select so the filter bar
 * layout stays uniform; typing filters the option list live.
 *
 * Props:
 *   options     — [{ value, label }]
 *   value       — current value
 *   onChange    — (value) => void
 *   placeholder — shown when nothing selected (e.g. "All Buildings")
 */

import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export default function AdminSearchSelect({ options = [], value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const optId = (i) => `${uid}-opt-${i}`;

  const selected = options.find((o) => String(o.value) === String(value));
  const hasValue = value !== '' && value !== null && value !== undefined;

  const filtered = options.filter((o) =>
    !query || String(o.label).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
        setHighlight(0);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector('[data-active="true"]');
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlight, open]);

  // Clamp highlight to valid range when the filtered list shrinks (e.g. typing a query
  // that removes previously-highlighted options). Depends only on list length.
  useEffect(() => {
    setHighlight((h) => (h > filtered.length ? Math.max(0, filtered.length) : h));
  }, [filtered.length]);

  const select = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
    setHighlight(0);
  };

  const clear = () => {
    onChange('');
    setOpen(false);
    setQuery('');
    setHighlight(0);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % (filtered.length + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + (filtered.length + 1)) % (filtered.length + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlight === 0) clear();
      else if (highlight > 0 && filtered[highlight - 1]) select(filtered[highlight - 1]);
      else if (filtered.length === 1) select(filtered[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      setHighlight(0);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="admin-search-select"
      onClick={() => setOpen(true)}
      role="group"
    >
      <input
        ref={inputRef}
        type="text"
        className="admin-search-select-trigger"
        placeholder={selected ? '' : placeholder}
        value={open ? query : (selected ? selected.label : '')}
        readOnly={!open}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optId(highlight) : undefined}
      />
      {hasValue && (
        <span
          className="admin-search-select-clear"
          role="button"
          aria-label="Clear filter"
          onClick={(e) => { e.stopPropagation(); clear(); }}
        >×</span>
      )}
      <ChevronDown size={14} className="admin-search-select-chevron" />
      {open && (
        <div
          className="admin-search-select-panel"
          ref={listRef}
          role="listbox"
          id={listId}
        >
          <div
            id={optId(0)}
            role="option"
            aria-selected={!hasValue}
            className={highlight === 0 ? 'admin-search-select-option active' : 'admin-search-select-option'}
            data-active={highlight === 0 ? 'true' : 'false'}
            onClick={clear}
            onMouseEnter={() => setHighlight(0)}
          >
            {placeholder || 'All'}
          </div>
          {filtered.length === 0 ? (
            <div className="admin-search-select-empty">No matches</div>
          ) : (
            filtered.map((o, i) => (
              <div
                key={o.value}
                id={optId(i + 1)}
                role="option"
                aria-selected={String(o.value) === String(value)}
                className={`${String(o.value) === String(value) ? 'selected' : ''} ${highlight === i + 1 ? 'active' : ''}`.trim()}
                data-active={highlight === i + 1 ? 'true' : 'false'}
                onClick={() => select(o)}
                onMouseEnter={() => setHighlight(i + 1)}
              >
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
