---
tags: [units, listings, data-model, admin, wizard]
scope: backend
files: ["backend/controllers/unitsController.js", "backend/controllers/landlordsController.js", "frontend/src/pages/admin/AdminUnits.jsx", "frontend/src/pages/admin/AdminLandlords.jsx", "frontend/src/pages/admin/AdminPropertyWizard.jsx", "frontend/src/pages/admin/wizard/DetailsStep.jsx", "frontend/src/pages/admin/wizard/BuildingStep.jsx"]
---

# Units & Listings

> Operational vs public-facing data split. Units = rent ops. Listings = guest-facing property data.

---

## Data Model

```
landlords 1──* units 1──* listings
```

### `units` table — Operational data
- Building, community, landlord assignment
- Apartment number, house type, internet provider/account
- DEWA premises number **and** DEWA account number (two different numbers), monthly rent, commission %
- `utility_bills_paid_by` (management/owner, default management), `floor`, `size_sqm`
- All display fields (title, slug, property_type, bedrooms, bathrooms, etc.)
- Arabic variants for all display fields

### `listings` table — Guest-facing
- `unit_id` FK → units (optional — can be null for standalone)
- All display fields duplicated from units (for independent editing)
- Price per night, max guests, meta title/description
- Status (draft/published/unpublished), is_featured

### Split rationale
- **Units** = landlord-facing operational data (rent, DEWA, internet, bank details)
- **Listings** = guest-facing marketing data (price per night, descriptions, images, amenities)
- One unit → one listing (1:1 relationship via `unit_id`)
- Listing can exist without unit (standalone properties)

## Backend

### Units CRUD (`backend/controllers/unitsController.js`)
- `getAll` — paginated, search, filter, JOINs buildings+communities+landlords
- `getById` — single unit with all relations
- `create`, `update`, `delete`
- `bulkImport` — CSV upload (csv-parser)
- `BASE_SELECT` — all display fields + building/community/landlord info

### Landlords CRUD (`backend/controllers/landlordsController.js`)
- `getAll` — all fields including identity_number, date_of_birth, bank details
- `getById`, `create`, `update`, `delete`
- `uploadDocument` — multer file upload → `unit_documents` table
- `uploadIdentityDocument`, `uploadUnitAgreement` — landlord-specific uploads

### Property Controller — Unit Integration (`backend/controllers/propertyController.js`)
- `getById` — when `unit_id` set, LEFT JOINs units→buildings→landlords, flattens to top-level
- `create` — accepts `unit_id`, links listing to unit
- `update` — updates listing fields (not unit fields)

### Documents (`unit_documents` table)
- `document_type`: title_deed, permit, contract (unit docs); emirates_id, passport (landlord docs); id_passport (legacy)
- `document_url`: uploaded file path
- `permit_number`: for DTCM permits
- `expiry_date`: for IDs, passports, permits, contracts. **For DTCM permits the stored expiry is the permit's lease expiry** (`lease_expiry` — "Date Expiry Lease" on the permit), the single permit expiry field.
- `contract_start` / `contract_end`: for contracts (stored on the contract document record)
- `ocr_data`: JSON from OCR extraction (see [[OCR System]])

### Multiple owners (joint ownership)
- `unit_landlords` junction (see [[Database]] §16b): one unit → many landlords, exactly one `is_primary = 1`, mirrored by `units.landlord_id`.
- Smart Scan Onboarding writes the junction (`INSERT IGNORE`) when linking a unit to its owner(s); the primary owner is picked at review (`primaryOwnerIndex`).

### Renewal (Smart Scan Onboarding, unit already exists)
- No duplicate unit/listing is created. The wizard **enriches empty unit fields**, upserts the `unit_landlords` junction, and syncs `units.landlord_id` to the primary owner.
- The new contract/permit document rows are kept for history (permit expiry = the new permit's lease expiry).
- The resolve-only preview (`POST /api/admin/onboarding/preview`) shows a **renewal banner** before saving so admins can confirm.

### Landlord bank fields (from contract page 7)
- `bank_name`, `bank_account_holder`, `bank_account_number`, `iban`, `swift_code`, `bank_branch`, `bank_account_currency`, `bank_address`

## Frontend

### AdminUnits (`/admin/units`)
- Table: ID, Unit #, Building, Community, Landlord, House Type, Rent, Status
- Create/Edit form: all unit fields (incl. DEWA account number, utility bills paid by, floor, size_sqm) + document upload + scan button (Title Deed, DTCM Permit, **Contract** — contract has editable expiry)
- Bulk import via CSV

### AdminLandlords (`/admin/landlords`)
- Table: Name, Email, Phone, Nationality, Active status
- Create/Edit form: all fields + identity documents (Emirates ID, Passport) + bank details (incl. account currency, bank address)
- Document cards with Upload + Scan buttons (OCR)
- Review modal for scanned documents
- **Emirates ID priority**: EID scan overwrites shared fields; passport fills only empty fields

### AdminPropertyWizard (`/admin/properties/new` and `/edit/:id`)
- 9-step wizard (BasicInfo → Location → Type → Details → Amenities → Images → SEO → Description → Building)
- **BuildingStep**: Searchable Building/Community/Landlord dropdowns, optional unit selection
- **DetailsStep**: bedrooms, bathrooms, parking_spots, price_per_night, size_sqft (no monthly_rent)
- Submit sends `unit_id` to backend

## Key Patterns
- Unit is optional for listings (standalone properties don't need a unit)
- All lookups `limit=9999` to populate dropdowns (no pagination on selects)
- SearchableSelect component for all foreign key dropdowns
- Arabic variants: all display fields have `_ar` counterpart

### Related
- [[Database]], [[Admin Panel]], [[Backend API]], [[OCR System]]
