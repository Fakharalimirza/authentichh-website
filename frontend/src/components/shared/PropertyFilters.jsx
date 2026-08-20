import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import Button from '../public/Button';
import { useI18n } from '../../i18n/I18nContext';

const types = ['Apartment', 'Studio', 'Penthouse', 'Villa'];

export default function PropertyFilters({ filters, onChange, onApply, onClear, count }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const { t } = useI18n();

  useEffect(() => {
    api.get('/communities/public').then(({ data }) => {
      if (Array.isArray(data)) setLocations(data);
    }).catch(() => {});
  }, []);

  const set = (key, value) => onChange(prev => ({ ...prev, [key]: value }));

  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  const filterContent = (
    <div className="filters-sidebar">
      <div className="filters-sidebar-header">
        <h3>{t('filters.title')}</h3>
        {activeCount > 0 && (
          <button className="filters-clear" onClick={onClear}>{t('filters.clear_all')}</button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('filters.location')}</label>
        <select value={filters.location} onChange={e => set('location', e.target.value)} className="filter-select">
          <option value="">{t('filters.all_locations')}</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('filters.property_type')}</label>
        <select value={filters.property_type} onChange={e => set('property_type', e.target.value)} className="filter-select">
          <option value="">{t('filters.all_types')}</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('filters.bedrooms')}</label>
        <div className="filter-chips">
          <button className={`filter-chip ${!filters.bedrooms ? 'active' : ''}`} onClick={() => set('bedrooms', '')}>{t('filters.any')}</button>
          {[1, 2, 3, 4].map(b => (
            <button key={b} className={`filter-chip ${filters.bedrooms === String(b) ? 'active' : ''}`} onClick={() => set('bedrooms', String(b))}>{b}</button>
          ))}
          <button className={`filter-chip ${filters.bedrooms === '5' ? 'active' : ''}`} onClick={() => set('bedrooms', '5')}>5+</button>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('filters.max_guests')}</label>
        <select value={filters.guests} onChange={e => set('guests', e.target.value)} className="filter-select">
          <option value="">{t('filters.any')}</option>
          {[2, 4, 6, 8].map(g => <option key={g} value={g}>{g}+ {t('filters.guests')}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">{t('filters.price_range')}</label>
        <div className="filter-price-row">
          <input type="number" placeholder={t('filters.min')} value={filters.min_price} onChange={e => set('min_price', e.target.value)} className="filter-input" />
          <span className="filter-price-sep">—</span>
          <input type="number" placeholder={t('filters.max')} value={filters.max_price} onChange={e => set('max_price', e.target.value)} className="filter-input" />
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={onApply}>{t('filters.apply')}</Button>
    </div>
  );

  return (
    <>
      <button className="filters-mobile-toggle" onClick={() => setMobileOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
        {t('filters.title')}{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>

      <div className={`filters-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className={`filters-drawer ${mobileOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="filters-drawer-header">
            <h3>{t('filters.title')}</h3>
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
