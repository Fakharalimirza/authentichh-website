/**
 * @fileoverview Wizard Step 5 — Agreement & Permit. Editable contract dates,
 * commission, DEWA premises + DTCM permit number/expiry — each with extracted
 * candidate chips (drag or click to fill).
 */

import { FileSignature, BadgeCheck } from 'lucide-react';
import OnboardingField from './OnboardingField';

export default function OnboardingAgreementStep({
  contract,
  handleContractChange,
  permit,
  handlePermitChange,
  handlePermitDewaChange,
  unit,
  handleUnitChange,
  onSetValue,
  getCandidates,
  fieldSources,
}) {
  const src = (name) => fieldSources[name] || null;
  const cands = (name) => getCandidates(name);

  return (
    <div className="ob-step">
      {/* ── Property Management Agreement (اتفاقية إدارة عقار) ── */}
      <div className="ob-form-card">
        <h4><FileSignature size={14} /> Property Management Agreement (اتفاقية إدارة عقار)</h4>
        <p className="ob-card-note">
          The agreement between you and the landlord. Dates are extracted from the scanned pages
          (1, 7, 8) — drag or click to use them, or type to correct.
        </p>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Contract Start" name="contract_start" type="date" value={contract.contract_start || ''} onChange={handleContractChange} onSetValue={onSetValue} source={src('contract_start')} candidates={cands('contract_start')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Contract End" name="contract_end" type="date" value={contract.contract_end || ''} onChange={handleContractChange} onSetValue={onSetValue} source={src('contract_end')} candidates={cands('contract_end')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Commission %" name="commission_percent" type="number" min="0" max="100" value={unit.commission_percent} onChange={handleUnitChange} onSetValue={onSetValue} source={src('commission_percent')} candidates={cands('commission_percent')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="DEWA Premises Number" name="dewa_premises_number" value={unit.dewa_premises_number} onChange={handlePermitDewaChange} onSetValue={onSetValue} source={src('dewa_premises_number')} candidates={cands('dewa_premises_number')} />
          </div>
        </div>
      </div>

      {/* ── DTCM Permit ─────────────────────────────────────── */}
      <div className="ob-form-card">
        <h4><BadgeCheck size={14} /> DTCM Permit</h4>
        <p className="ob-card-note">
          Optional — permits can take days to issue. Add it now or later from the Units page.
          The permit expiry is the lease expiry printed on the DTCM permit ("Date Expiry Lease").
        </p>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Permit Number" name="permit_number" value={permit.permit_number || ''} onChange={handlePermitChange} onSetValue={onSetValue} source={src('permit_number')} candidates={cands('permit_number')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Permit Expiry (Lease Expiry)" name="lease_expiry" type="date" value={permit.lease_expiry || ''} onChange={handlePermitChange} onSetValue={onSetValue} source={src('lease_expiry')} candidates={cands('lease_expiry')} />
          </div>
        </div>
      </div>
    </div>
  );
}