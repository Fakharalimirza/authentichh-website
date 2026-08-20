---
tags: [ocr, documents, fields, onboarding, reference]
scope: frontend, backend
files: [frontend/src/pages/admin/onboarding/onboardingUtils.js, frontend/src/pages/admin/AdminOnboarding.jsx, backend/utils/ocr.js]
---

# Document Fields

> Reference: every field each scanned document extracts, and where it lands in the Smart Scan Onboarding form / database.
> Merge engine: `frontend/src/pages/admin/onboarding/onboardingUtils.js` (`FIELD_SOURCES`/`SOURCE_KEYS`/`resolveField`/`normalizeScanValue`/`collectCandidates`), driven by `AdminOnboarding.jsx` (`applyScanResult`).

### Related
- [[OCR System]], [[File Map]], [[Units & Listings]], [[Admin Panel]], [[🏠 Home]]

## 📇 Emirates ID

| OCR Field | Goes to | Notes |
|---|---|---|
| `full_name` | Landlord → Full Name | ⭐ Priority source (overwrites) |
| `full_name_ar` | Landlord → Arabic Name | Priority source |
| `identity_number` | Landlord → Emirates ID No | Priority source; also stored as doc `document_number` |
| `nationality` | Landlord → Nationality | Priority source |
| `date_of_birth` | Landlord → Date of Birth | Priority source |
| `expiry_date` | Landlord doc → `expiry_date` | Card expiry (persisted) |

## 🛂 Passport

| OCR Field | Goes to | Notes |
|---|---|---|
| `passport_number` | Landlord → Passport No | Only fills if empty (EID never overwritten); stored as doc `document_number` |
| `full_name` | Landlord → Full Name | Fill-empty only |
| `full_name_ar` | Landlord → Arabic Name | Fill-empty only |
| `nationality` | Landlord → Nationality | Fill-empty only |
| `date_of_birth` | Landlord → Date of Birth | Fill-empty only |
| `expiry_date` | Landlord doc → `expiry_date` | Passport expiry (persisted) |

## 🏛️ Title Deed (no expiry — a deed never expires)

| OCR Field | Goes to | Notes |
|---|---|---|
| `owner_name` | Landlord → Full Name | Fallback when EID/contract empty |
| `owner_name_ar` | Landlord → Arabic Name | Fallback — deed often has the *fullest* Arabic name |
| `apartment_number` | Unit → Apartment No | |
| `parking_spot` | Unit → Parking Spots | e.g. `B1-67` |
| `parking_spots` | Unit → Parking Spots (count) | |
| `floor` | Unit → Floor | |
| `building_name` | Building → Name | Priority over contract/permit |
| `building_name_ar` | Building → Name (Arabic) | Priority |
| `community` | Building → Community | Priority |
| `community_ar` | Building → Community (Arabic) | Priority |
| `plot_number` | Building → Plot No | Priority |
| `area_sqm` | Unit → Area (sqm) | |
| `size_sqft` | Unit → Area (sqft) | |
| `property_type` | Unit → Property Type | Studio/Penthouse/Apartment |
| `registration_no` | Title Deed doc → `document_number` | Deed number (persisted) |
| `municipality_no` | — | Extracted, shown in pills, not stored |
| `purchase_price` | — | Extracted, shown in pills |
| `issue_date` | — | Extracted, shown in pills |
| `mortgage_status` | — | Extracted, shown in pills |

## 📜 Rental Contract (pages 1, 7, 8)

| OCR Field | Goes to | Notes |
|---|---|---|
| `full_name` | Landlord → Full Name | |
| `full_name_ar` | Landlord → Arabic Name | |
| `identity_number` | Landlord → Emirates ID No | Fallback if EID not scanned |
| `email` | Landlord → Email | Contract is the only source of email/phone |
| `phone` | Landlord → Phone | |
| `building_name` | Building → Name | |
| `building_name_ar` | Building → Name (Arabic) | |
| `unit_number` | Unit → Apartment No | |
| `property_type` | Unit → Property Type | |
| `agreement_duration` | — | Extracted (e.g. "1 YEAR"), shown in pills |
| `contract_start` | Contract doc → `contract_start` | Persisted |
| `contract_end` | Contract doc → `contract_end` | Persisted — **always trusted from scan** |
| `management_fee_percent` | Unit → Commission % | |
| `utility_bills_paid_by` | — | **Never auto-filled** — admin selects (default management) |
| `bank_name` | Landlord → Bank Name | |
| `bank_account_holder` | Landlord → Account Holder | |
| `bank_account_number` | Landlord → Account No | |
| `iban` | Landlord → IBAN | |
| `bank_account_currency` | Landlord → Currency | |
| `bank_address` | Landlord → Bank Address | |
| `dewa_account_number` | Unit → DEWA Account No | |
| `plot_number` | Building → Plot No | |
| `area` | Building → Community | |
| `area_ar` | Building → Community (Arabic) | |

## 🏨 DTCM Permit

| OCR Field | Goes to | Notes |
|---|---|---|
| `permit_number` | Permit doc → `permit_number` + `document_number` | Persisted |
| `operator_name` | — | Operating company (shown in pills) |
| `operator_license_number` | — | Shown in pills |
| `operator_license_expiry` | — | License expiry (shown in pills) |
| `operator_location` | — | Shown in pills |
| `operator_contact` | — | Shown in pills |
| `unit_type` | Unit → Property Type | e.g. "1-Apartment" |
| `bedrooms` | Unit → Bedrooms | Permit is the main source |
| `building_name` | Building → Name | |
| `building_name_ar` | Building → Name (Arabic) | |
| `unit_number` | Unit → Apartment No | |
| `street_name` / `street_number` | — | Shown in pills |
| `dewa_premises_number` | Unit → DEWA Premises No | Permit is the main source |
| `lease_start` | — | Shown in pills; sanity-swapped if > expiry |
| `lease_expiry` | Permit → Permit Expiry (Lease Expiry) | ⭐ **The DTCM permit expiry** — stored on the permit doc `expiry_date`; the single permit expiry field |
| `plot_number` | Building → Plot No | |
| `category` | Unit → House Type | e.g. "Standard" |
| `area` | Building → Community | |
| `area_ar` | Building → Community (Arabic) | |

## ⚙️ Summary of what each doc uniquely contributes

| Doc | Unique data (nothing else provides it) |
|---|---|
| **Emirates ID** | `identity_number` + EID expiry |
| **Passport** | `passport_number` + passport expiry |
| **Title Deed** | `owner_name_ar` (fullest Arabic name), `registration_no`, `parking_spots`, `size_sqm/size_sqft`, `municipality_no`, `purchase_price`, `issue_date`, `mortgage_status` |
| **Contract** | `email`, `phone`, bank details (bank/account/IBAN/currency/address), `contract_start/end`, `management_fee_percent`, `dewa_account_number`, `agreement_duration` |
| **Permit** | `permit_number`, **`lease_expiry` → Permit Expiry** (the DTCM permit's lease expiry), `bedrooms`, `dewa_premises_number`, `category`→House Type, `lease_start` (sanity check) |

> **Extraction method badge**: every scan card shows which pipeline produced the fields — Gemini Vision / OCR.space + Gemini / OCR.space + Regex / Basic extraction (`fields._type`), plus a ⚠ note when vision failed and the pipeline fell back (`_vision_error`).