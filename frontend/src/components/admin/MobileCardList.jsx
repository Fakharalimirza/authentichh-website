/**
 * @fileoverview Responsive card list for mobile — replaces the data-table on small screens.
 */

import MobileCard from './MobileCard';
import TableSkeleton from './TableSkeleton';

export default function MobileCardList({
  items = [],
  renderCard,
  loading = false,
  emptyMessage = 'No items found.',
  emptyIcon,
  skeletonCount = 5,
  onLoadMore,
  hasMore = false,
}) {
  if (loading) {
    return (
      <div className="mobile-card-list">
        <TableSkeleton rows={skeletonCount} cols={3} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mobile-card-list">
        <div className="flex flex-col items-center justify-center py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>
          {emptyIcon && <div className="mb-3" style={{ opacity: 0.4 }}>{emptyIcon}</div>}
          <p style={{ fontSize: 'var(--text-sm)' }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-card-list">
      {items.map((item, i) => (
        <MobileCard key={item.id || i} {...(renderCard ? renderCard(item) : {})} />
      ))}
      {hasMore && (
        <button type="button" className="load-more-btn" onClick={onLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
}
