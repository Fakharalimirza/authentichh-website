/**
 * @fileoverview Price formatting utilities.
 */

import DirhamSymbol from '../components/public/DirhamSymbol';

/** Format a number with locale separators (no currency symbol). */
export function formatPrice(amount) {
  const formatted = Number(amount).toLocaleString();
  return `${formatted}`;
}

/** Renders a formatted price with the DirhamSymbol component. */
export function PriceDisplay({ amount, size = '1.1em', className = '' }) {
  return (
    <span className={className} style={{ whiteSpace: 'nowrap' }}>
      <DirhamSymbol size={size} /> {Number(amount).toLocaleString()}
    </span>
  );
}
