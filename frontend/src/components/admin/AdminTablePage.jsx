/**
 * @fileoverview Shared admin list page skeleton — standardizes header (title/actions),
 * filter bar, loading skeleton, empty state, data table, mobile card list, and pagination
 * so every admin list page looks identical.
 *
 * Props:
 *   title, actions          → forwarded to AdminLayout
 *   loading                 → show TableSkeleton while true (and items empty)
 *   items, rowKey           → row data
 *   columns                 → [{ label, align?, render(item)?, key? }]
 *   search, filters, count, countLabel → forwarded to AdminFilterBar
 *   empty                   → { icon?, title, hint, action? } for the empty state
 *   mobileCard              → (item) => MobileCard props | undefined (renders MobileCardList)
 *   mobileCardEmpty         → empty message for mobile list (defaults to empty.title)
 *   pagination              → { page, totalPages, total, perPage, onPerPageChange, onChange }
 */

import AdminLayout from './AdminLayout';
import AdminFilterBar from './AdminFilterBar';
import AdminPagination from './AdminPagination';
import TableSkeleton from './TableSkeleton';
import MobileCardList from './MobileCardList';
import { Search } from 'lucide-react';

export default function AdminTablePage({
  title,
  actions,
  loading = false,
  items = [],
  rowKey = 'id',
  columns = [],
  search,
  filters = [],
  count,
  countLabel,
  empty,
  mobileCard,
  mobileCardEmpty,
  pagination,
  beforeTable,
}) {
  const hasActiveCriteria = Boolean(
    (search?.value || '').trim() || filters.some((f) => (f.value || '') !== '')
  );
  const isEmpty = !loading && items.length === 0;
  const hasData = !loading && items.length > 0;

  const renderBody = () => {
    if (loading && items.length === 0) {
      return <TableSkeleton rows={5} cols={Math.max(columns.length, 4)} />;
    }

    if (isEmpty) {
      return (
        <div className="admin-content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              {empty?.icon || <Search size={28} />}
            </div>
            <h3>{empty?.title || 'No items found'}</h3>
            <p>{hasActiveCriteria ? 'Try adjusting your search or filter criteria.' : (empty?.hint || 'Get started by adding your first item.')}</p>
            {empty?.action}
          </div>
        </div>
      );
    }

    return (
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} style={c.align ? { textAlign: c.align } : undefined}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item[rowKey]}>
                {columns.map((c, i) => (
                  <td key={i} style={c.align ? { textAlign: c.align } : undefined}>
                    {c.render ? c.render(item) : (item[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AdminLayout title={title} actions={actions}>
      {(search || filters.length > 0 || typeof count === 'number') && (
        <AdminFilterBar search={search} filters={filters} count={count} countLabel={countLabel} />
      )}

      {beforeTable}

      {renderBody()}

      {hasData && mobileCard && (
        <MobileCardList
          items={items}
          loading={false}
          emptyMessage={mobileCardEmpty || empty?.title || 'No items found.'}
          renderCard={mobileCard}
        />
      )}

      {hasData && pagination && (
        <AdminPagination {...pagination} />
      )}
    </AdminLayout>
  );
}
