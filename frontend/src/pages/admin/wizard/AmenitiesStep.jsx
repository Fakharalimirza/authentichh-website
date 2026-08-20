import { Search, X, Check } from 'lucide-react';
import { renderIcon } from '../../../utils/amenityIcons';

export default function AmenitiesStep({
  amenitySearch, setAmenitySearch,
  groupedAmenities, form, toggleAmenity, setForm
}) {
  return (
    <div className="wizard-step">
      <h2>Amenities</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }}>Select all amenities this property offers</p>

      <div className="wizard-amenities-search">
        <Search size={14} />
        <input
          type="text" placeholder="Search amenities..."
          value={amenitySearch}
          onChange={e => setAmenitySearch(e.target.value)}
        />
        {amenitySearch && (
          <button type="button" className="btn-icon-only" onClick={() => setAmenitySearch('')}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="wizard-amenities">
        {groupedAmenities.length === 0 ? (
          <p className="text-sm text-muted">
            {amenitySearch ? 'No amenities match your search.' : 'No amenities available. Please add amenities first.'}
          </p>
        ) : groupedAmenities.map(({ category, items }) => (
          <div key={category} className="amenity-category-group">
            <div className="amenity-category-header">
              <h4>{category}</h4>
              <div className="flex gap-2">
                <button type="button" className="btn-text-sm" onClick={() => {
                  const ids = items.filter(a => !form.amenities.includes(a.id)).map(a => a.id);
                  setForm(f => ({ ...f, amenities: [...f.amenities, ...ids] }));
                }}>
                  Select all
                </button>
                <button type="button" className="btn-text-sm" onClick={() => {
                  const ids = new Set(items.map(a => a.id));
                  setForm(f => ({ ...f, amenities: f.amenities.filter(id => !ids.has(id)) }));
                }}>
                  Clear
                </button>
              </div>
            </div>
            <div className="wizard-amenities-grid">
              {items.map(a => {
                const selected = form.amenities.includes(a.id);
                return (
                  <label key={a.id} className={`wizard-amenity-chip ${selected ? 'selected' : ''}`}>
                    <input type="checkbox" checked={selected} onChange={() => toggleAmenity(a.id)} />
                    {renderIcon(a.icon, 18)}
                    <span>{a.name}</span>
                    {selected && <Check size={14} />}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
