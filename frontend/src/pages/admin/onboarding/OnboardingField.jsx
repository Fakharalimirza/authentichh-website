/**
 * @fileoverview OnboardingField — shared form field used across every wizard step.
 * Shows the current value + a "from <doc>" source tag + a collapsible row of
 * extracted candidate chips. Chips can be DRAGGED into the field or CLICKED to
 * fill it (click = touch fallback). Filling calls onSetValue(name, value, source)
 * which the parent treats as a manual override (never overwritten by later scans).
 */

import { useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DOC_TYPE_LABEL } from './onboardingUtils';

export default function OnboardingField({
  label,
  name,
  value,
  onChange,
  onSetValue,
  source,
  candidates = [],
  type = 'text',
  dir,
  options,
  required,
  textarea,
  placeholder,
  hint,
  min,
  max,
}) {
  const [showCandidates, setShowCandidates] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fill = (val, src) => {
    if (val === '' || val === null || val === undefined) return;
    onSetValue?.(name, val, src);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const val = e.dataTransfer?.getData('text/plain');
    if (val) fill(val, source);
  };

  return (
    <div className="ob-field">
      <label className="admin-label">
        {label}{required ? ' *' : ''}
      </label>

      <div
        className={`ob-field-control${dragOver ? ' ob-drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {textarea ? (
          <textarea
            name={name} rows={3} value={value || ''} onChange={onChange}
            className="admin-textarea" dir={dir} placeholder={placeholder}
          />
        ) : options ? (
          <select name={name} value={value} onChange={onChange} className="admin-input">
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input
            name={name} type={type} value={value || ''} onChange={onChange}
            className="admin-input" dir={dir} placeholder={placeholder} min={min} max={max}
          />
        )}
        {dragOver && <span className="ob-drop-hint">Drop to fill</span>}
      </div>

      {source && <span className="ob-source-tag">from {DOC_TYPE_LABEL[source] || source}</span>}
      {hint && <span className="ob-field-hint">{hint}</span>}

      {candidates.length > 0 && (
        <div className="ob-candidates">
          <button
            type="button"
            className="ob-candidates-toggle"
            onClick={() => setShowCandidates((s) => !s)}
          >
            {showCandidates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showCandidates ? 'Hide' : 'Show'} extracted values ({candidates.length})
          </button>
          {showCandidates && (
            <div className="ob-chip-row">
              {candidates.map((c, i) => (
                <span
                  key={`${c.source}-${i}`}
                  className="ob-candidate-chip"
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(c.value)); }}
                  onClick={() => fill(c.value, c.source)}
                  title={`Drag into the field or click to fill — from ${DOC_TYPE_LABEL[c.source] || c.source}`}
                >
                  <GripVertical size={12} className="ob-chip-grip" />
                  <b>{String(c.value)}</b>
                  <em>from {DOC_TYPE_LABEL[c.source] || c.source}</em>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}