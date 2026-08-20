/**
 * @fileoverview Wizard Step 3 — Building & Community. Building name(_ar), plot,
 * community(_ar), plus_code. Shows the building-match panel (reuse vs new).
 */

import { Building2, Loader2, CircleCheck, CircleAlert } from 'lucide-react';
import OnboardingField from './OnboardingField';

export default function OnboardingBuildingStep({
  deed,
  handleDeedChange,
  onSetValue,
  getCandidates,
  fieldSources,
  buildingMatch,
  matchLoading,
}) {
  const src = (name) => fieldSources[name] || null;
  const cands = (name) => getCandidates(name);

  return (
    <div className="ob-step">
      <div className="ob-form-card">
        <h4><Building2 size={14} /> Building &amp; Community</h4>
        <p className="ob-card-note">
          Filled from the Title Deed / Property Management Agreement / DTCM Permit scans.
          The system automatically reuses an existing building — no duplicates.
        </p>

        <div className="ob-field">
          <OnboardingField label="Building Name" name="name" value={deed.name} onChange={handleDeedChange} onSetValue={onSetValue} source={src('name')} candidates={cands('name')} required />
        </div>

        {matchLoading && (
          <div className="ob-building-checking">
            <Loader2 size={14} className="ob-spin" /> Checking for an existing building…
          </div>
        )}
        {!matchLoading && buildingMatch && (
          <div className="ob-building-match">
            <div className="ob-building-match-title">
              <CircleCheck size={16} /> We already have this building: <b>&nbsp;{buildingMatch.name}</b>
            </div>
            <div className="ob-building-match-note">It will be reused — no duplicate will be created.</div>
          </div>
        )}
        {!matchLoading && !buildingMatch && deed.name.trim() && (
          <div className="ob-building-new">
            <div className="ob-building-new-title">
              <CircleAlert size={16} /> New building
            </div>
            <div className="ob-building-new-note">This building is not in the database — it will be created when you link.</div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Building Name (Arabic)" name="name_ar" value={deed.name_ar} onChange={handleDeedChange} onSetValue={onSetValue} source={src('name_ar')} candidates={cands('name_ar')} dir="rtl" />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Plot Number" name="plot_number" value={deed.plot_number} onChange={handleDeedChange} onSetValue={onSetValue} source={src('plot_number')} candidates={cands('plot_number')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Community / Area (English)" name="community" value={deed.community || ''} onChange={handleDeedChange} onSetValue={onSetValue} source={src('community')} candidates={cands('community')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Community / Area (Arabic)" name="community_ar" value={deed.community_ar || ''} onChange={handleDeedChange} onSetValue={onSetValue} source={src('community_ar')} candidates={cands('community_ar')} dir="rtl" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Plus Code" name="plus_code" value={deed.plus_code || ''} onChange={handleDeedChange} onSetValue={onSetValue} hint={buildingMatch ? '(optional — building already exists)' : '* required for a new building'} placeholder="e.g. 8G2X+5M Dubai" />
          </div>
        </div>
      </div>
    </div>
  );
}