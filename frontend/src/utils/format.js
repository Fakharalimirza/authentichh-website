import DirhamSymbol from '../components/ui/DirhamSymbol';

export function formatPrice(amount) {
  const formatted = Number(amount).toLocaleString();
  return `${formatted}`;
}

export function PriceDisplay({ amount, size = '1.1em', className = '' }) {
  return (
    <span className={className} style={{ whiteSpace: 'nowrap' }}>
      <DirhamSymbol size={size} /> {Number(amount).toLocaleString()}
    </span>
  );
}
