/**
 * @fileoverview FieldReview — renders OCR-extracted fields as pill chips.
 * Props: { fields, title } — unchanged API.
 */

const LABELS = {
  full_name: 'Full Name',
  full_name_ar: 'Arabic Name',
  owner_name: 'Owner Name',
  owner_name_ar: 'Owner Name (Arabic)',
  identity_number: 'Emirates ID',
  passport_number: 'Passport No',
  nationality: 'Nationality',
  date_of_birth: 'Date of Birth',
  expiry_date: 'Expiry Date',
  email: 'Email',
  phone: 'Phone',
  building_name: 'Building',
  building_name_ar: 'Building (Arabic)',
  unit_number: 'Unit No',
  apartment_number: 'Apartment No',
  property_type: 'Property Type',
  unit_type: 'Unit Type',
  agreement_duration: 'Duration',
  contract_start: 'Start Date',
  contract_end: 'End Date',
  management_fee_percent: 'Mgmt Fee %',
  commission_percent: 'Commission %',
  utility_bills_paid_by: 'Utility Bills',
  bank_name: 'Bank',
  bank_account_holder: 'Account Holder',
  bank_account_number: 'Account No',
  iban: 'IBAN',
  bank_account_currency: 'Currency',
  bank_address: 'Bank Address',
  dewa_account_number: 'DEWA Account',
  dewa_premises_number: 'DEWA Premises',
  plot_number: 'Plot No',
  area: 'Community',
  area_ar: 'Community (Arabic)',
  community: 'Community',
  community_ar: 'Community (Arabic)',
  parking_spot: 'Parking Spot',
  parking_spots: 'Parking Spots',
  floor: 'Floor',
  area_sqm: 'Area (sqm)',
  size_sqft: 'Area (sqft)',
  registration_no: 'Registration No',
  municipality_no: 'Municipality No',
  purchase_price: 'Purchase Price',
  issue_date: 'Issue Date',
  mortgage_status: 'Mortgage',
  permit_number: 'Permit No',
  operator_name: 'Operator',
  operator_license_number: 'License No',
  operator_license_expiry: 'License Expiry',
  operator_location: 'Location',
  operator_contact: 'Contact',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  category: 'Category',
  lease_start: 'Lease Start',
  lease_expiry: 'Lease Expiry',
  street_name: 'Street',
  street_number: 'Street No',
};

/** Keys to skip — noise or internal metadata. */
const SKIP_KEYS = new Set(['type', 'rawText', 'documentType', 'session_id']);

/**
 * Convert a raw snake_case key to a friendly fallback label.
 * e.g. "some_field_name" → "Some Field Name"
 */
function fallbackLabel(raw) {
  return raw
    .replace(/^_+/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format a value for display. ISO date strings (YYYY-MM-DD) are rendered as-is.
 */
function formatValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return str;
}

export default function FieldReview({ fields, title }) {
  const entries = Object.entries(fields || {}).filter(([k, v]) => {
    if (v === '' || v === null || v === undefined) return false;
    if (k.startsWith('_')) return false;
    if (SKIP_KEYS.has(k)) return false;
    return true;
  });

  if (entries.length === 0) return null;

  return (
    <div className="ob-field-pills">
      <div className="ob-field-pills-title">{title}</div>
      <div className="ob-field-pills-grid">
        {entries.map(([k, v]) => (
          <span key={k} className="ob-field-pill" title={`${k}: ${v}`}>
            <b>{LABELS[k] || fallbackLabel(k)}</b> {formatValue(v)}
          </span>
        ))}
      </div>
    </div>
  );
}
