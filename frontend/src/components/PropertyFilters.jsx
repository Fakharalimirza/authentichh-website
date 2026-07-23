import { useState } from 'react';
import Button from './ui/Button';

const locations = ['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'JBR', 'Business Bay'];
const types = ['Apartment', 'Studio', 'Penthouse', 'Villa'];

export default function PropertyFilters({ filters, onChange, onApply, onClear, count }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const set = (key, value) => onChange(prev => ({ ...prev, [key]: value }));

  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  const filterContent = (
    <div className="filters-sidebar">
      <div className="filters-sidebar-header">
        <h3>Filters</h3>
        {activeCount > 0 && (
          <button className="filters-clear" onClick={onClear}>Clear all</button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">Location</label>
        <select value={filters.location} onChange={e => set('location', e.target.value)} className="filter-select">
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Property Type</label>
        <select value={filters.property_type} onChange={e => set('property_type', e.target.value)} className="filter-select">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Bedrooms</label>
        <div className="filter-chips">
          <button className={`filter-chip ${!filters.bedrooms ? 'active' : ''}`} onClick={() => set('bedrooms', '')}>Any</button>
          {[1, 2, 3, 4].map(b => (
            <button key={b} className={`filter-chip ${filters.bedrooms === String(b) ? 'active' : ''}`} onClick={() => set('bedrooms', String(b))}>{b}</button>
          ))}
          <button className={`filter-chip ${filters.bedrooms === '5' ? 'active' : ''}`} onClick={() => set('bedrooms', '5')}>5+</button>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Max Guests</label>
        <select value={filters.guests} onChange={e => set('guests', e.target.value)} className="filter-select">
          <option value="">Any</option>
          {[2, 4, 6, 8].map(g => <option key={g} value={g}>{g}+ Guests</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Price Range</label>
        <div className="filter-price-row">
          <input type="number" placeholder="Min" value={filters.min_price} onChange={e => set('min_price', e.target.value)} className="filter-input" />
          <span className="filter-price-sep">—</span>
          <input type="number" placeholder="Max" value={filters.max_price} onChange={e => set('max_price', e.target.value)} className="filter-input" />
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={onApply}>Apply Filters</Button>
    </div>
  );

  return (
    <>
      <button className="filters-mobile-toggle" onClick={() => setMobileOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      <div className={`filters-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className={`filters-drawer ${mobileOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="filters-drawer-header">
            <h3>Filters</h3>
            <button className="filters-drawer-close" onClick={() => setMobileOpen(false)}>✕</button>
          </div>
          {filterContent}
        </div>
      </div>

      <aside className="filters-desktop">
        {filterContent}
      </aside>
    </>
  );
}
