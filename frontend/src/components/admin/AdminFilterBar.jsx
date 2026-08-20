/**
 * @fileoverview Reusable admin filter bar — search input, filter dropdowns/date inputs,
 * and an optional results count. Standardizes the look across all admin list pages.
 *
 * Props:
 *   search   — { value, placeholder, onChange } | null
 *   filters  — [{ label, placeholder?, value, onChange, options?: [{value,label}], type?: 'select'|'date' }]
 *   count    — number | undefined  (renders "{count} {countLabel}" pushed right)
 *   countLabel — string | (n) => string
 */

import { Search } from 'lucide-react';
import AdminSearchSelect from './AdminSearchSelect';

export default function AdminFilterBar({ search, filters = [], count, countLabel }) {
  const hasAnything = search || filters.length > 0 || count !== undefined;
  if (!hasAnything) return null;

  const isSearchable = (f) => {
    if (typeof f.searchable === 'boolean') return f.searchable;
    return (f.options?.length || 0) >= 8;
  };

  return (
    <div className="admin-filter-bar">
      {search && (
        <div className="input-field input-sm" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <span className="input-prefix" style={{ paddingInline: '0.625rem' }}>
            <Search size={16} />
          </span>
          <input
            className="input-element"
            type="text"
            placeholder={search.placeholder || 'Search...'}
            value={search.value || ''}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
      )}

      {filters.map((f, i) => {
        if (f.type === 'date') {
          return (
            <input
              key={i}
              type="date"
              value={f.value || ''}
              onChange={(e) => f.onChange(e.target.value)}
              title={f.placeholder || f.label}
            />
          );
        }
        if (isSearchable(f)) {
          return (
            <AdminSearchSelect
              key={i}
              options={f.options || []}
              value={f.value || ''}
              onChange={f.onChange}
              placeholder={f.placeholder || `All ${f.label}`}
            />
          );
        }
        return (
          <select
            key={i}
            className="filter-select"
            value={f.value || ''}
            onChange={(e) => f.onChange(e.target.value)}
          >
            <option value="">{f.placeholder || `All ${f.label}`}</option>
            {(f.options || []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );
      })}

      {typeof count === 'number' && count > 0 && (
        <span className="text-sm text-muted" style={{ marginInlineStart: 'auto' }}>
          {count} {typeof countLabel === 'function' ? countLabel(count) : countLabel}
        </span>
      )}
    </div>
  );
}
