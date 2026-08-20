/**
 * @fileoverview Shared Smart Scan Onboarding constants + source-aware merge engine.
 * The merge engine maps raw OCR fields (per document) onto target form fields using
 * priority lists (FIELD_SOURCES) and per-document key maps (SOURCE_KEYS).
 * collectCandidates() feeds the drag-and-drop candidate chips.
 */

export const DOC_TYPE_LABEL = {
  emirates_id: 'Emirates ID',
  passport: 'Passport',
  title_deed: 'Title Deed',
  contract: 'Property Management Agreement',
  permit: 'DTCM Permit',
};

export const emptyLandlord = {
  full_name: '', full_name_ar: '', email: '', phone: '', identity_number: '', passport_number: '',
  nationality: '', date_of_birth: '', bank_name: '', bank_account_holder: '', bank_account_number: '',
  iban: '', swift_code: '', bank_branch: '', bank_account_currency: '', bank_address: '',
};

export const emptyBuilding = { name: '', name_ar: '', plot_number: '', plus_code: '', community: '', community_ar: '' };

export const emptyCommunity = { name: '', arabic_name: '' };

export const emptyUnit = {
  apartment_number: '', floor: '', size_sqm: '', size_sqft: '', bedrooms: '', bathrooms: '',
  property_type: 'Apartment', house_type: 'Standard', internet_provider: 'Etisalat',
  internet_account_number: '', dewa_account_number: '', dewa_premises_number: '',
  utility_bills_paid_by: 'management', commission_percent: 15,
  parking_spot_numbers: '', parking_spots: '', max_guests: '', description: '',
  wifi_username: '', wifi_password: '',
};

const normalizeType = (t) => {
  const s = String(t || '').toLowerCase();
  if (s.includes('studio')) return 'Studio';
  if (s.includes('penthouse')) return 'Penthouse';
  return 'Apartment';
};

export const LANDLORD_FIELDS = [
  'full_name', 'full_name_ar', 'email', 'phone', 'identity_number', 'passport_number',
  'nationality', 'date_of_birth', 'bank_name', 'bank_account_holder', 'bank_account_number',
  'iban', 'swift_code', 'bank_branch', 'bank_account_currency', 'bank_address',
];

export const BUILDING_FIELDS = ['name', 'name_ar', 'plot_number', 'plus_code', 'community', 'community_ar'];

export const UNIT_FIELDS = [
  'apartment_number', 'property_type', 'house_type', 'bedrooms', 'bathrooms', 'parking_spots',
  'parking_spot_numbers', 'commission_percent', 'max_guests', 'size_sqft', 'size_sqm', 'floor',
  'dewa_account_number', 'dewa_premises_number', 'utility_bills_paid_by',
  'wifi_username', 'wifi_password', 'internet_provider', 'internet_account_number', 'description',
];

export const CONTRACT_FIELDS = ['contract_start', 'contract_end'];
export const PERMIT_FIELDS = ['permit_number', 'lease_expiry'];

/** target field → ordered source docTypes (first non-empty wins). */
export const FIELD_SOURCES = {
  // Landlord
  full_name: ['emirates_id', 'title_deed', 'contract', 'passport'],
  full_name_ar: ['emirates_id', 'title_deed', 'contract', 'passport'],
  nationality: ['emirates_id', 'passport', 'contract'],
  date_of_birth: ['emirates_id', 'passport', 'contract'],
  identity_number: ['emirates_id', 'contract'],
  passport_number: ['passport', 'contract'],
  email: ['contract'],
  phone: ['contract'],
  bank_name: ['contract'], bank_account_holder: ['contract'], bank_account_number: ['contract'],
  iban: ['contract'], swift_code: ['contract'], bank_branch: ['contract'],
  bank_account_currency: ['contract'], bank_address: ['contract'],
  // Building + community
  name: ['title_deed', 'contract', 'permit'],
  name_ar: ['title_deed', 'contract', 'permit'],
  plot_number: ['title_deed', 'contract', 'permit'],
  community: ['title_deed', 'contract', 'permit'],
  community_ar: ['title_deed', 'contract', 'permit'],
  // Unit
  apartment_number: ['contract', 'title_deed', 'permit'],
  property_type: ['title_deed', 'permit', 'contract'],
  house_type: ['permit'],
  bedrooms: ['permit', 'contract'],
  dewa_premises_number: ['permit'],
  dewa_account_number: ['contract'],
  commission_percent: ['contract'],
  parking_spot_numbers: ['title_deed'],
  parking_spots: ['title_deed'],
  floor: ['title_deed', 'contract'],
  size_sqm: ['title_deed'],
  size_sqft: ['title_deed'],
  // Agreement & permit dates/numbers
  contract_start: ['contract'],
  contract_end: ['contract'],
  permit_number: ['permit'],
  lease_expiry: ['permit'],
};

/** source docType → { targetField: rawKey (string) or extractor fn } */
export const SOURCE_KEYS = {
  emirates_id: {
    full_name: 'full_name', full_name_ar: 'full_name_ar', nationality: 'nationality',
    date_of_birth: 'date_of_birth', identity_number: 'identity_number',
  },
  passport: {
    full_name: 'full_name', full_name_ar: 'full_name_ar', nationality: 'nationality',
    date_of_birth: 'date_of_birth', passport_number: 'passport_number',
  },
  title_deed: {
    full_name: 'owner_name', full_name_ar: 'owner_name_ar', name: 'building_name',
    name_ar: 'building_name_ar', plot_number: 'plot_number',
    community: (f) => f.community || f.area, community_ar: (f) => f.community_ar || f.area_ar,
    apartment_number: 'apartment_number', floor: 'floor', size_sqm: 'area_sqm',
    size_sqft: 'size_sqft', property_type: 'property_type',
    parking_spot_numbers: 'parking_spot', parking_spots: 'parking_spots',
  },
  contract: {
    full_name: 'full_name', full_name_ar: 'full_name_ar', identity_number: 'identity_number',
    email: 'email', phone: 'phone', name: 'building_name', name_ar: 'building_name_ar',
    plot_number: 'plot_number', community: 'area', community_ar: 'area_ar',
    apartment_number: 'unit_number', property_type: 'property_type',
    commission_percent: 'management_fee_percent', dewa_account_number: 'dewa_account_number',
    bank_name: 'bank_name', bank_account_holder: 'bank_account_holder',
    bank_account_number: 'bank_account_number', iban: 'iban',
    bank_account_currency: 'bank_account_currency', bank_address: 'bank_address',
    contract_start: 'contract_start', contract_end: 'contract_end',
  },
  permit: {
    name: 'building_name', name_ar: 'building_name_ar', plot_number: 'plot_number',
    community: 'area', community_ar: 'area_ar', apartment_number: 'unit_number',
    house_type: 'category', bedrooms: 'bedrooms', dewa_premises_number: 'dewa_premises_number',
    property_type: 'unit_type',
    permit_number: 'permit_number', lease_expiry: 'lease_expiry',
  },
};

/** Resolve a target field from the source pool. Returns { value, source } or nulls. */
export function resolveField(target, sources) {
  for (const src of FIELD_SOURCES[target] || []) {
    const f = sources[src];
    if (!f) continue;
    const key = SOURCE_KEYS[src]?.[target];
    if (key === undefined) continue;
    const val = typeof key === 'function' ? key(f) : f[key];
    if (val !== '' && val !== null && val !== undefined) return { value: val, source: src };
  }
  return { value: null, source: null };
}

/** Normalize an OCR value for the target field type. */
export function normalizeScanValue(target, value) {
  if (target === 'property_type') return normalizeType(value);
  if (['parking_spots', 'bedrooms', 'commission_percent', 'size_sqm', 'size_sqft', 'max_guests'].includes(target)) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : String(value).trim();
  }
  return String(value).trim();
}

/**
 * Collect every distinct extracted candidate for a target field from the source
 * pool — feeds the drag-and-drop candidate chips. Dedupes by normalized value.
 */
export function collectCandidates(target, sources) {
  const out = [];
  const seen = new Set();
  for (const src of FIELD_SOURCES[target] || []) {
    const f = sources[src];
    if (!f) continue;
    const key = SOURCE_KEYS[src]?.[target];
    if (key === undefined) continue;
    const val = typeof key === 'function' ? key(f) : f[key];
    if (val === '' || val === null || val === undefined) continue;
    const norm = normalizeScanValue(target, val);
    if (norm === '' || norm === null || norm === undefined) continue;
    const str = String(norm);
    if (seen.has(str)) continue;
    seen.add(str);
    out.push({ value: norm, source: src });
  }
  return out;
}

/** Friendly labels for the Review-step conflict list. */
export const FIELD_LABELS = {
  full_name: 'Full Name',
  full_name_ar: 'Arabic Name',
  nationality: 'Nationality',
  date_of_birth: 'Date of Birth',
  identity_number: 'Emirates ID',
  passport_number: 'Passport Number',
  email: 'Email',
  phone: 'Phone',
  bank_name: 'Bank Name',
  bank_account_number: 'Account Number',
  iban: 'IBAN',
  name: 'Building Name',
  name_ar: 'Building Name (Arabic)',
  plot_number: 'Plot Number',
  community: 'Community',
  community_ar: 'Community (Arabic)',
  apartment_number: 'Apartment Number',
  property_type: 'Property Type',
  house_type: 'House Type',
  bedrooms: 'Bedrooms',
  floor: 'Floor',
  size_sqm: 'Area (sqm)',
  size_sqft: 'Area (sqft)',
  dewa_account_number: 'DEWA Account',
  dewa_premises_number: 'DEWA Premises',
  commission_percent: 'Commission %',
  parking_spot_numbers: 'Parking Spot',
  parking_spots: 'Parking Spots',
  contract_start: 'Contract Start',
  contract_end: 'Contract End',
  permit_number: 'Permit Number',
  lease_expiry: 'Permit Expiry (Lease Expiry)',
};

/** Friendly fallback: "some_field_name" → "Some Field Name". */
export function fallbackLabel(raw) {
  return String(raw || '')
    .replace(/^_+/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}