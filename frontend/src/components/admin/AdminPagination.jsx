/**
 * @fileoverview Pagination controls with page-number buttons, prev/next arrows,
 * and a per-page size selector.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export default function AdminPagination({ page, totalPages, total, perPage, onPerPageChange, onChange }) {
  if (totalPages <= 1 && (!total || total <= (perPage || 25))) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="admin-pagination">
      <div className="admin-pagination-pages">
        <button disabled={page <= 1} onClick={() => onChange(p => p - 1)}>
          <ChevronLeft size={16} />
        </button>
        {pages.map(p => (
          <button key={p} className={p === page ? 'active' : ''} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(p => p + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
      {onPerPageChange && (
        <div className="admin-pagination-perpage">
          <span>Show</span>
          <select
            value={perPage || 25}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
