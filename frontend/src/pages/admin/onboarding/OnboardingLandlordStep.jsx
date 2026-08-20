/**
 * @fileoverview Wizard Step 2 — Landlord. Primary owner form (fed by EID/passport/
 * agreement scans) + optional "Add another owner" cards (manual entry with an
 * optional per-owner ID mini-scan).
 */

import { User, Plus, X, Loader2, IdCard, FileText, UserCheck } from 'lucide-react';
import OnboardingField from './OnboardingField';
import FieldReview from './OnboardingFieldReview';

const ID_TYPE_OPTIONS = [
  { value: 'emirates_id', label: 'Emirates ID' },
  { value: 'passport', label: 'Passport' },
];

export default function OnboardingLandlordStep({
  landlord,
  handleLandlordChange,
  onSetValue,
  getCandidates,
  fieldSources,
  owners,
  handleOwnerChange,
  scanOwnerId,
  addOwner,
  removeOwner,
  sourceFields,
}) {
  const src = (name) => fieldSources[name] || null;
  const cands = (name) => getCandidates(name);

  return (
    <div className="ob-step">
      {/* ── Primary owner ───────────────────────────────────── */}
      <div className="ob-form-card">
        <h4><UserCheck size={14} /> Primary Owner <span className="ob-owner-badge">Owner 1</span></h4>
        <p className="ob-card-note">
          Filled automatically from the Emirates ID / Passport / Property Management Agreement scans.
          Drag any extracted value into a field to use it, or type directly.
        </p>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Full Name" name="full_name" value={landlord.full_name} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('full_name')} candidates={cands('full_name')} required />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Arabic Name (الاسم بالعربية)" name="full_name_ar" value={landlord.full_name_ar} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('full_name_ar')} candidates={cands('full_name_ar')} dir="rtl" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Email" name="email" type="email" value={landlord.email} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('email')} candidates={cands('email')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Phone" name="phone" value={landlord.phone} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('phone')} candidates={cands('phone')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Emirates ID Number" name="identity_number" value={landlord.identity_number} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('identity_number')} candidates={cands('identity_number')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Passport Number" name="passport_number" value={landlord.passport_number} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('passport_number')} candidates={cands('passport_number')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Nationality" name="nationality" value={landlord.nationality} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('nationality')} candidates={cands('nationality')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Date of Birth" name="date_of_birth" type="date" value={landlord.date_of_birth} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('date_of_birth')} candidates={cands('date_of_birth')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Bank Name" name="bank_name" value={landlord.bank_name} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('bank_name')} candidates={cands('bank_name')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Account Holder" name="bank_account_holder" value={landlord.bank_account_holder} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('bank_account_holder')} candidates={cands('bank_account_holder')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Account Number" name="bank_account_number" value={landlord.bank_account_number} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('bank_account_number')} candidates={cands('bank_account_number')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="IBAN" name="iban" value={landlord.iban} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('iban')} candidates={cands('iban')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="SWIFT Code" name="swift_code" value={landlord.swift_code} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('swift_code')} candidates={cands('swift_code')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Bank Branch" name="bank_branch" value={landlord.bank_branch} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('bank_branch')} candidates={cands('bank_branch')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Account Currency" name="bank_account_currency" value={landlord.bank_account_currency} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('bank_account_currency')} candidates={cands('bank_account_currency')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Bank Address" name="bank_address" textarea value={landlord.bank_address} onChange={handleLandlordChange} onSetValue={onSetValue} source={src('bank_address')} candidates={cands('bank_address')} />
          </div>
        </div>
      </div>

      {/* ── Additional owners ───────────────────────────────── */}
      <div className="ob-form-card">
        <h4><User size={14} /> Additional Owners</h4>
        <p className="ob-card-note">
          One unit can have multiple owners (e.g. spouses / partners). By default we assume a single
          owner — add more only when needed. You will pick the primary owner in the Review step.
        </p>

        {owners.map((owner, idx) => (
          <div key={owner.key} className="ob-owner-card">
            <div className="ob-owner-header">
              <span className="ob-owner-badge">Owner {idx + 2}</span>
              <button type="button" className="ob-owner-remove" onClick={() => removeOwner(owner.key)} title="Remove owner">
                <X size={14} />
              </button>
            </div>

            {/* Optional mini-scan for this owner */}
            <div className="ob-owner-scan">
              <span className="ob-owner-scan-label">Scan this owner's ID (optional):</span>
              {ID_TYPE_OPTIONS.map(({ value, label }) => (
                <label key={value} className="btn btn-secondary ob-owner-scan-btn">
                  {owner.scanning ? <Loader2 size={12} className="ob-spin" /> : value === 'emirates_id' ? <IdCard size={12} /> : <FileText size={12} />}
                  {owner.idDocType === value ? 'Scanned ✓' : `Scan ${label}`}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="ob-scan-upload-input"
                    disabled={owner.scanning}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) scanOwnerId(owner.key, value, f);
                      e.target.value = '';
                    }}
                  />
                </label>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group form-group-grow">
                <OnboardingField label="Full Name" name="full_name" value={owner.landlord.full_name} onChange={(e) => handleOwnerChange(owner.key, e)} onSetValue={(n, v) => handleOwnerChange(owner.key, { target: { name: n, value: v } })} required />
              </div>
              <div className="form-group form-group-grow">
                <OnboardingField label="Arabic Name" name="full_name_ar" value={owner.landlord.full_name_ar} onChange={(e) => handleOwnerChange(owner.key, e)} onSetValue={(n, v) => handleOwnerChange(owner.key, { target: { name: n, value: v } })} dir="rtl" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group-grow">
                <OnboardingField label="Emirates ID Number" name="identity_number" value={owner.landlord.identity_number} onChange={(e) => handleOwnerChange(owner.key, e)} onSetValue={(n, v) => handleOwnerChange(owner.key, { target: { name: n, value: v } })} />
              </div>
              <div className="form-group form-group-grow">
                <OnboardingField label="Passport Number" name="passport_number" value={owner.landlord.passport_number} onChange={(e) => handleOwnerChange(owner.key, e)} onSetValue={(n, v) => handleOwnerChange(owner.key, { target: { name: n, value: v } })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group-grow">
                <OnboardingField label="Nationality" name="nationality" value={owner.landlord.nationality} onChange={(e) => handleOwnerChange(owner.key, e)} onSetValue={(n, v) => handleOwnerChange(owner.key, { target: { name: n, value: v } })} />
              </div>
              <div className="form-group form-group-grow">
                <OnboardingField label="Date of Birth" name="date_of_birth" type="date" value={owner.landlord.date_of_birth} onChange={(e) => handleOwnerChange(owner.key, e)} onSetValue={(n, v) => handleOwnerChange(owner.key, { target: { name: n, value: v } })} />
              </div>
            </div>

            {owner.idDocType && sourceFields?.[owner.idDocType] && (
              <FieldReview fields={sourceFields[owner.idDocType]} title={`Extracted from ${owner.idDocType === 'emirates_id' ? 'Emirates ID' : 'Passport'}`} />
            )}
          </div>
        ))}

        <button type="button" className="btn btn-secondary ob-add-owner" onClick={addOwner}>
          <Plus size={14} /> Add another owner
        </button>
      </div>
    </div>
  );
}