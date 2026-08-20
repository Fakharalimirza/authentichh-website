/**
 * @fileoverview Wizard Step 6 — Review & Save. Shows the resolution summary
 * (existing vs new landlord/building/unit), the renewal banner, the primary-owner
 * picker, and a conflicts list. Save happens in the parent's nav bar.
 */

import { UserCheck, Loader2, CircleCheck, CircleAlert, RefreshCcw, AlertTriangle, FileSignature } from 'lucide-react';
import FieldReview from './OnboardingFieldReview';
import { DOC_TYPE_LABEL, FIELD_LABELS, FIELD_SOURCES, fallbackLabel } from './onboardingUtils';

function ResolutionRow({ label, state }) {
  if (!state) return null;
  if (state.exists === null) {
    return (
      <div className="ob-res-row">
        <span className="ob-res-label">{label}</span>
        <span className="ob-res-value ob-res-unknown"><Loader2 size={12} className="ob-spin" /> resolving…</span>
      </div>
    );
  }
  return (
    <div className="ob-res-row">
      <span className="ob-res-label">{label}</span>
      <span className={`ob-res-value ${state.exists ? 'ob-res-existing' : 'ob-res-new'}`}>
        {state.exists ? (
          <>
            <CircleCheck size={13} /> existing
            {state.id ? ` #${state.id}` : ''}
            {state.matchedBy && <em> (matched by {state.matchedBy.replace(/_/g, ' ')})</em>}
            {state.name && <em> — {state.name}</em>}
          </>
        ) : (
          <>
            <CircleAlert size={13} /> new
            {state.matchedBy && <em> (no match)</em>}
          </>
        )}
      </span>
    </div>
  );
}

export default function OnboardingReviewStep({
  landlord,
  owners,
  primaryOwnerIndex,
  setPrimaryOwnerIndex,
  resolution,
  resolutionLoading,
  getCandidates,
  fieldSources,
  contract,
  permit,
  sourceFields,
}) {
  const allOwners = [landlord, ...owners.map((o) => o.landlord)];
  const isRenewal = resolution?.unit?.mode === 'renewal';

  // Conflicts = target fields with 2+ distinct extracted candidates
  const conflicts = Object.keys(FIELD_SOURCES).filter((target) => {
    const cands = getCandidates(target);
    return cands.length > 1;
  });

  return (
    <div className="ob-step">
      {/* ── Resolution summary ──────────────────────────────── */}
      <div className="ob-form-card">
        <h4><RefreshCcw size={14} /> What will happen on Save</h4>
        {resolutionLoading && (
          <div className="ob-building-checking">
            <Loader2 size={14} className="ob-spin" /> Checking the database…
          </div>
        )}
        {!resolutionLoading && resolution && (
          <div className="ob-res-summary">
            <ResolutionRow label="Landlord" state={resolution.landlord} />
            <ResolutionRow label="Building" state={resolution.building} />
            <ResolutionRow label="Community" state={resolution.community} />
            <ResolutionRow label="Unit" state={resolution.unit} />
          </div>
        )}
      </div>

      {/* ── Renewal banner ───────────────────────────────────── */}
      {isRenewal && (
        <div className="ob-renewal-banner">
          <AlertTriangle size={18} />
          <div>
            <b>This unit already exists</b> — this onboarding will <b>renew</b> the Property
            Management Agreement and DTCM Permit for the existing unit. It will NOT create a new
            unit. A new contract/permit document row is kept for history.
          </div>
        </div>
      )}

      {/* ── Primary owner picker ─────────────────────────────── */}
      <div className="ob-form-card">
        <h4><UserCheck size={14} /> Owners — pick the primary</h4>
        <div className="ob-owner-picker">
          {allOwners.map((owner, i) => (
            <label key={i} className={`ob-owner-option${i === primaryOwnerIndex ? ' selected' : ''}`}>
              <input
                type="radio"
                name="primary-owner"
                checked={i === primaryOwnerIndex}
                onChange={() => setPrimaryOwnerIndex(i)}
              />
              <div className="ob-owner-option-body">
                <b>{owner.full_name || `Owner ${i + 1}`}</b>
                <span>
                  {owner.identity_number ? `EID: ${owner.identity_number}` : ''}
                  {owner.identity_number && owner.phone ? ' · ' : ''}
                  {owner.phone ? `Phone: ${owner.phone}` : ''}
                </span>
              </div>
              {i === primaryOwnerIndex && <span className="ob-owner-primary-tag">Primary</span>}
            </label>
          ))}
        </div>
      </div>

      {/* ── Conflicts to review ──────────────────────────────── */}
      {conflicts.length > 0 && (
        <div className="ob-form-card">
          <h4><AlertTriangle size={14} /> Fields where documents disagree</h4>
          <p className="ob-card-note">
            These fields have multiple different extracted values. Go back to the relevant step and
            drag the correct value into the field.
          </p>
          <div className="ob-conflict-list">
            {conflicts.map((target) => (
              <div key={target} className="ob-conflict-row">
                <b>{FIELD_LABELS[target] || fallbackLabel(target)}</b>
                <div className="ob-conflict-cands">
                  {getCandidates(target).map((c, i) => (
                    <span key={i} className="ob-conflict-cand">
                      <em>from {DOC_TYPE_LABEL[c.source] || c.source}:</em> {String(c.value)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Extracted summary from Agreement & Permit ────────── */}
      <div className="ob-form-card">
        <h4><FileSignature size={14} /> Scanned values — Agreement &amp; Permit</h4>
        <FieldReview fields={contract} title="Property Management Agreement" />
        <FieldReview fields={permit} title="DTCM Permit" />
      </div>
    </div>
  );
}