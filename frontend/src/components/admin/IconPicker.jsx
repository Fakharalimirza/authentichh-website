/**
 * @fileoverview Amenity icon picker with search — used in the amenity admin form.
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import { ICON_OPTIONS } from '../../utils/amenityIcons';

export default function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = ICON_OPTIONS.filter(o =>
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="icon-picker">
      <div className="icon-picker-search">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="icon-picker-grid">
        {filtered.map(({ value: key, component: IconComp }) => (
          <button
            key={key}
            type="button"
            className={`icon-picker-item ${value === key ? 'selected' : ''}`}
            onClick={() => onChange(key)}
            title={key}
          >
            <IconComp size={20} />
            <span>{key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

