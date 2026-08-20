/** Generic shimmer placeholder. */
export function Skeleton({ width, height = 16, borderRadius = 6, style, className = '', ...props }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Skeleton matching the PropertyCard layout. */
export function PropertyCardSkeleton() {
  return (
    <div className="pcard" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ aspectRatio: '16 / 10', borderRadius: 0, height: 'auto' }} />
      <div style={{ padding: '16px 18px 18px' }}>
        <div className="skeleton" style={{ height: 14, width: '55%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 18, width: '90%', marginBottom: 6 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div className="skeleton" style={{ height: 14, width: 72 }} />
          <div className="skeleton" style={{ height: 14, width: 72 }} />
          <div className="skeleton" style={{ height: 14, width: 80 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ height: 20, width: 120 }} />
          <div className="skeleton" style={{ height: 14, width: 90 }} />
        </div>
      </div>
    </div>
  );
}

/** Skeleton matching the admin data-table layout. */
export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}><div className="skeleton" style={{ height: 14, width: 80 }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}><div className="skeleton" style={{ height: 14, width: c === 0 ? 140 : 80 }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
