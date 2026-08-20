export default function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="admin-table">
      <table>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c}>
                  <div
                    className="skeleton"
                    style={{ height: 14, width: c === 0 ? '70%' : '40%' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
