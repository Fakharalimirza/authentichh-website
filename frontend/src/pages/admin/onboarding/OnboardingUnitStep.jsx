/**
 * @fileoverview Wizard Step 4 — Unit. All unit operational details (apartment,
 * type, floor, DEWA, areas, beds/baths/parking/guests, commission, internet, WiFi).
 */

import { Building2 } from 'lucide-react';
import OnboardingField from './OnboardingField';

const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Studio', label: 'Studio' },
  { value: 'Penthouse', label: 'Penthouse' },
];

const HOUSE_TYPES = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Corner', label: 'Corner' },
  { value: 'Middle', label: 'Middle' },
  { value: 'End Unit', label: 'End Unit' },
  { value: 'Duplex', label: 'Duplex' },
];

const INTERNET_PROVIDERS = [
  { value: 'Etisalat', label: 'Etisalat' },
  { value: 'Du', label: 'Du' },
  { value: 'Other', label: 'Other' },
];

const UTILITY_BILLS = [
  { value: 'management', label: 'Management' },
  { value: 'owner', label: 'Owner' },
];

export default function OnboardingUnitStep({
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
      <div className="ob-form-card">
        <h4><Building2 size={14} /> Unit Details</h4>
        <p className="ob-card-note">
          Filled from the Title Deed / Contract / Permit scans. Drag extracted values into any field.
        </p>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Apartment Number" name="apartment_number" value={unit.apartment_number} onChange={handleUnitChange} onSetValue={onSetValue} source={src('apartment_number')} candidates={cands('apartment_number')} required />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Property Type" name="property_type" options={PROPERTY_TYPES} value={unit.property_type} onChange={handleUnitChange} onSetValue={onSetValue} source={src('property_type')} candidates={cands('property_type')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="House Type" name="house_type" options={HOUSE_TYPES} value={unit.house_type || 'Standard'} onChange={handleUnitChange} onSetValue={onSetValue} source={src('house_type')} candidates={cands('house_type')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Floor" name="floor" value={unit.floor} onChange={handleUnitChange} onSetValue={onSetValue} source={src('floor')} candidates={cands('floor')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Utility Bills Paid By" name="utility_bills_paid_by" options={UTILITY_BILLS} value={unit.utility_bills_paid_by} onChange={handleUnitChange} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="DEWA Account Number" name="dewa_account_number" value={unit.dewa_account_number} onChange={handleUnitChange} onSetValue={onSetValue} source={src('dewa_account_number')} candidates={cands('dewa_account_number')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="DEWA Premises Number" name="dewa_premises_number" value={unit.dewa_premises_number} onChange={handleUnitChange} onSetValue={onSetValue} source={src('dewa_premises_number')} candidates={cands('dewa_premises_number')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Area (sqm)" name="size_sqm" type="number" min="0" value={unit.size_sqm} onChange={handleUnitChange} onSetValue={onSetValue} source={src('size_sqm')} candidates={cands('size_sqm')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Area (sqft)" name="size_sqft" type="number" min="0" value={unit.size_sqft} onChange={handleUnitChange} onSetValue={onSetValue} source={src('size_sqft')} candidates={cands('size_sqft')} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Bedrooms" name="bedrooms" type="number" min="0" value={unit.bedrooms} onChange={handleUnitChange} onSetValue={onSetValue} source={src('bedrooms')} candidates={cands('bedrooms')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Bathrooms" name="bathrooms" type="number" min="0" value={unit.bathrooms} onChange={handleUnitChange} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Parking Spots" name="parking_spots" type="number" min="0" value={unit.parking_spots} onChange={handleUnitChange} onSetValue={onSetValue} source={src('parking_spots')} candidates={cands('parking_spots')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Guest Capacity" name="max_guests" type="number" min="0" value={unit.max_guests} onChange={handleUnitChange} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Commission %" name="commission_percent" type="number" min="0" max="100" value={unit.commission_percent} onChange={handleUnitChange} onSetValue={onSetValue} source={src('commission_percent')} candidates={cands('commission_percent')} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="Internet Provider" name="internet_provider" options={INTERNET_PROVIDERS} value={unit.internet_provider || 'Etisalat'} onChange={handleUnitChange} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="Internet Account Number" name="internet_account_number" value={unit.internet_account_number} onChange={handleUnitChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow">
            <OnboardingField label="WiFi Username" name="wifi_username" value={unit.wifi_username} onChange={handleUnitChange} />
          </div>
          <div className="form-group form-group-grow">
            <OnboardingField label="WiFi Password" name="wifi_password" value={unit.wifi_password} onChange={handleUnitChange} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-grow form-group-full">
            <OnboardingField label="Description" name="description" textarea value={unit.description} onChange={handleUnitChange} />
          </div>
        </div>
      </div>
    </div>
  );
}