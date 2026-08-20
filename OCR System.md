---
tags: [ocr, backend, documents, api]
scope: backend
files: ["backend/utils/ocr.js", "backend/controllers/ocrController.js", "backend/routes/ocr.js", "database/migration-ocr-data.sql", "frontend/src/pages/admin/AdminLandlords.jsx", "frontend/src/pages/admin/AdminUnits.jsx", "frontend/src/pages/admin/AdminOnboarding.jsx", "frontend/src/pages/admin/AdminSettings.jsx"]
---

# OCR System

> Free document scanning: OCR.space (raw text) + regex (Emirates ID/passport/bills) + Gemini (contracts/title deeds). Zero server load, no GPU.

---

## Architecture

```
Upload file → POST /api/admin/ocr/extract (multer)
  → Method selector (settings.ocr_method) for contracts & title deeds:
      auto (default)          → Gemini vision → OCR.space + Gemini text → regex
      gemini_vision           → Gemini reads image/PDF directly (1 call, no OCR.space)
      ocrspace_gemini         → OCR.space → Gemini text → regex
      ocrspace_regex          → OCR.space + regex (zero Gemini usage)
  → Fixed-format docs (ID/passport/permit/bill) always use OCR.space + regex
  → Returns { rawText, fields, documentType }
Contract PDFs (multi-page) → split into single-page PDFs (pdf-lib) → only the
  key pages scanned (1, 7, 8 — last 2 pages fallback when totalPages < 8) via
  POST /ocr/extract with { session_id, page } → per-page progress on the
  frontend; session auto-cleaned after last page / 15-min TTL
Frontend → Review modal (editable fields) → "Upload & Auto-fill" → saves doc + fills form
```

> Gemini vision (`gemini_vision` / first leg of `auto`) sends the image/PDF to
> Gemini as `inlineData` — one call does OCR + structuring, reads Arabic text
> far more reliably than OCR.space text. Raster files are preprocessed (sharp,
> 2000px) to cut input tokens; PDFs pass through natively. In vision mode
> `rawText` is empty so the "Show raw OCR text" expandable auto-hides.

## Backend Files

### `backend/utils/ocr.js` — Core OCR Engine
- **`extractWithOcrSpace(filePath, apiKey, language = 'eng')`** → raw text via `POST https://api.ocr.space/parse/image`
  - `language='ara'` uses **Engine 1 only** (Arabic is unsupported on Engine 2); `eng` keeps the Engine 2→1 fallback
- **`extractBilingualWithOcrSpace(filePath, apiKey)`** → parallel eng + ara passes merged into one text block. Used for `BILINGUAL_DOC_TYPES = ['title_deed','permit','contract']` (bilingual Dubai docs) so **Arabic survives and English labels stay clean** — fixes the garbled-Arabic/empty-`_ar`-fields bug caused by the old hardcoded `language=eng` single pass
- **`rescuePlotNumber(fields, rawText)`** → fills `plot_number` from the English "Plot No/Plot Number" label when Gemini returns null (applied after text-path structuring)
- **`extractEmiratesId(text)`** → `{ full_name, identity_number, nationality, date_of_birth, expiry_date }`
  - Regex: `784[-.\s]?\d{4}[-.\s]?\d{7}[-.\s]?\d`
  - Uses `joinLines()` for multi-line label+value matching (OCR splits "Expiry Date" and "11/01/2027" across lines)
- **`extractPassport(text)`** → `{ passport_number, full_name, nationality, date_of_birth, expiry_date }`
  - MRZ TD3 parser: `P<PAKBILAL<<MUHAMMAD<<<<<<<<<<<<<<<<<<<<<<<<`
  - Given name first, then surname (user preference)
  - `parseMRZDate()` handles YYMMDD format
  - `mapNationalityCode()` converts ICAO 3-letter codes
- **`extractBill(text)`** → `{ account_number, invoice_number, amount, due_date, property_address }`
- **`extractPermit(text)`** → `{ permit_number, property_name, expiry_date, lease_start, lease_expiry }` — grabs the DTCM lease dates from "Date Expiry Lease"/"Date Start Lease"/Arabic labels; swaps the pair if `lease_start > lease_expiry` (mis-assigned label guard)
- **`structureWithGemini(text, docType, apiKey, promptOverride?)`** → structured JSON via Gemini 3.6 Flash
  - POST to `generativelanguage.googleapis.com` with shared `GEMINI_PROMPTS`
  - Emirates ID: `{ full_name, full_name_ar, identity_number, nationality, date_of_birth, expiry_date }`
  - Passport: `{ passport_number, full_name, full_name_ar, nationality, date_of_birth, expiry_date }`
  - Contracts (multi-page, reads page 1 + last pages): `{ full_name, full_name_ar, identity_number, email, phone, building_name, building_name_ar, unit_number, property_type, agreement_duration, contract_start, contract_end, management_fee_percent, utility_bills_paid_by, bank_name, bank_account_holder, bank_account_number, iban, bank_account_currency, bank_address, dewa_account_number, plot_number, area, area_ar }`
  - Title deeds: `{ owner_name, owner_name_ar, apartment_number, parking_spot, parking_spots, floor, building_name, building_name_ar, community, community_ar, plot_number, area_sqm, size_sqft, property_type, registration_no, municipality_no, purchase_price, issue_date, mortgage_status }`
  - Permits (DTCM): `{ permit_number, operator_name, operator_license_number, operator_license_expiry, operator_location, operator_contact, unit_type, bedrooms, building_name, building_name_ar, unit_number, street_name, street_number, dewa_premises_number, lease_start, lease_expiry, plot_number, category, area, area_ar }` — **`lease_expiry` is the DTCM permit expiry stored on the permit doc** (single permit-expiry field in the wizard)
- **`structureWithGeminiVision(filePath, docType, apiKey, promptOverride?)`** → same prompts, document sent as `inlineData` (image/PDF) — OCR + structure in one call, best Arabic fidelity
- **`splitPdfIntoPages(filePath)`** → splits a multi-page contract PDF into one temp single-page PDF per page (pdf-lib); returns page paths (caller cleans up)
- **`cleanupSplitPages(pagePaths)`** → removes the temp directory from `splitPdfIntoPages`
- **`scanContractPage(filePath, pageNum, settings)`** → scans ONE page with the `contract_page` Gemini prompt (page number substituted); honors `settings.ocr_method` (vision → OCR.space+Gemini → regex) per page; its OCR.space paths use the bilingual merge
- **`parseGeminiJson(raw)`** → JSON extraction from Gemini responses (handles markdown code fences)
- **`extractByRegex(documentType, rawText)`** → regex fallback for Gemini-eligible docs (Emirates ID/passport use specialized extractors, permit uses `extractPermit`, contracts/title deeds use generic labels)
- **`processDocument(filePath, documentType, settings)`** → master orchestrator honoring `settings.ocr_method`
  - `emirates_id` / `passport` / `contract` / `title_deed` / `permit` → routed by `ocr_method` (auto / gemini_vision / ocrspace_gemini / ocrspace_regex)
  - `id_passport` (legacy) → OCR.space → detect Emirates ID vs passport → regex
  - Every result carries `fields._type` (`<doc>_vision|_gemini|_basic|_regex`) → drives the **extraction-method badge** in the wizard scan cards; in `auto` mode a failed vision pass is recorded as `fields._vision_error` so fallbacks are never silent

> `GEMINI_PROMPTS.contract` and `GEMINI_PROMPTS.contract_page` share the
> `CONTRACT_FIELDS` schema constant so page-by-page scans extract the same field
> set as a single full-contract scan. `contract_page` contains a `{PAGE}`
> placeholder that `scanContractPage` substitutes with the actual page number.

### `backend/controllers/ocrController.js`
- **`extract`** — POST `/api/admin/ocr/extract`
  - Accepts: multer file + `document_type` + optional `document_id`
  - Loads API keys + method from `settings` table (`ocr_method`, `ocr_space_api_key`, `gemini_api_key`)
  - Returns: `{ rawText, fields, documentType }`
  - Contract PDFs: first call splits the PDF and scans page 1 → returns `{ page, totalPages, sessionId }`; follow-up calls with `{ document_type: 'contract', session_id, page }` scan the next page. Session lives 15 min (TTL) and is destroyed after the last page / on expiry.
  - Optionally stores `ocr_data` on existing `unit_documents` record

### `backend/routes/ocr.js`
- `POST /extract` — `authenticateToken` + `documentUpload.single('document')` → `ocrController.extract`

## Frontend Files

### AdminLandlords.jsx — Scan button + review modal
- `handleScanDocument(type, file)` — sends file to OCR API (Emirates ID or Passport)
- `handleScanConfirm()` — uploads doc with expiry_date + auto-fills form fields. **Emirates ID is priority**: it overwrites shared fields (full_name, nationality, date_of_birth, identity_number) even if a passport scan was confirmed earlier; passport always sets passport_number but shared fields only fill when empty (`prev.X || f.X`), so it never replaces EID/manual data.
- Review modal: editable fields, "Show raw OCR text" expandable, "Upload & Auto-fill" button

### AdminUnits.jsx — Same pattern for title deed/permit/contract
- Same `handleScanDocument` / `handleScanConfirm` pattern
- Scans title deed, DTCM permit, or rental contract (contract moved here from the landlord form)
- Contract documents support editable expiry (end date) via the inline meta row

### AdminOnboarding.jsx — Smart Scan Onboarding (`/admin/smart-scan`)
- **6-step wizard** (Scan → Landlord → Building & Community → Unit → Agreement & Permit → Review & Save); steps render `onboarding/OnboardingLandlordStep.jsx` etc.; merge engine lives in `onboarding/onboardingUtils.js`
- **Step 1 "Scan"** (`OnboardingAddStep.jsx`): all 5 documents (Emirates ID, Passport, Title Deed, Property Management Agreement, DTCM Permit) attachable at once; scans run on a **background queue with concurrency 2** (`scanQueue` + worker effect) — per-doc status chips + one auto-retry on failure, non-blocking while the admin moves through the wizard. Each done card shows an **extraction-method badge** (`fields._type` → Gemini Vision / OCR.space + Gemini / OCR.space + Regex / Basic) + a ⚠ note when vision failed (`_vision_error`) so silent fallbacks are visible
- **Source-aware merge engine** (`onboardingUtils.js`): `applyScanResult` keeps raw per-doc fields in `sourceFields` and recomputes target forms from `FIELD_SOURCES`/`SOURCE_KEYS` priority lists — first non-empty source wins, EID priority for personal identity, title deed `owner_name`/`parking_spots` feed landlord/unit, `manualOverrides` protect admin edits + drag-filled values, `fieldSources` powers "from <doc>" UI chips; refs prevent stale reads during concurrent scans (fixes passport_number not filling); Arabic (`_ar`) fields shown and editable at every step
- **Drag-drop fill** (`OnboardingField.jsx`): per-field candidate chips are draggable — drag into the field or click = `onSetValue` override
- **Step 6 "Review & Save"** (`OnboardingReviewStep.jsx`): debounced **resolve-only preview** (`POST /api/admin/onboarding/preview`) shows existing/new per entity + renewal banner + primary-owner picker + conflicts list; posts to `POST /api/admin/onboarding` with `owners[]` + `primaryOwnerIndex`; building name triggers a debounced building-match check (reuse via `building_id` vs create-new with `plus_code`)
- Contract scan (`runContractScan`) scans only the **key pages** (1, 7, 8; fallback = last 2 pages when totalPages < 8):
  - First call returns `{ sessionId, totalPages, page:1, fields }`; then requests only `extraPages` (7, 8 when totalPages ≥ 8, else last 2 pages) via `/ocr/extract` with `{ session_id, page }` — middle pages skipped to save Gemini quota
  - Fields from all pages are merged (later pages only fill empty fields)
  - `scanProgress { page, totalPages }` drives the progress bar shown on the Contract scan card; other scan cards show an indeterminate animated bar while scanning
- `utility_bills_paid_by` is intentionally NOT auto-filled from OCR — admin picks it on the form (default `management`)
- OCR field names the page consumes: `full_name, full_name_ar, identity_number, passport_number, nationality, date_of_birth, expiry_date, email, phone, owner_name, owner_name_ar, building_name, building_name_ar, unit_number, apartment_number, property_type, agreement_duration, contract_start, contract_end, management_fee_percent, utility_bills_paid_by, bank_name, bank_account_holder, bank_account_number, iban, bank_account_currency, bank_address, dewa_account_number, dewa_premises_number, plot_number, area, area_ar, community, community_ar, municipality_no, registration_no, purchase_price, mortgage_company, area_sqm, size_sqft, parking, parking_spot, floor, permit_number, operator_name, operator_license_number, operator_license_expiry, operator_location, operator_contact, bedrooms, street_name, street_number, lease_start, lease_expiry, category`

### AdminSettings.jsx — OCR method + API key config
- Collapsible "OCR / Document Scanning" section
- `ocr_method` — dropdown selector (Auto / Gemini vision / OCR.space + Gemini / OCR.space only) for contracts, title deeds, Emirates ID, passport & permit
- `ocr_space_api_key` — optional (free without key: 25k req/month)
- `gemini_api_key` — for contracts/title deeds (free tier at aistudio.google.com/apikey)

## Database

- `unit_documents.ocr_data: JSON` — stores extracted fields + raw text (migration: `database/migration-ocr-data.sql`)
- `unit_documents.document_number: VARCHAR(100)` — stores each document's identifying number (title deed registration no, EID number, passport number, permit number) — migration: `database/migration-document-number.sql`
- `settings` table: `ocr_method`, `ocr_space_api_key`, `gemini_api_key` (key-value, no migration needed)

## API Limits (all free, no credit card)

| Service | Free Tier | Used For |
|---|---|---|
| OCR.space | 25,000 req/month, no key needed | Raw text from all documents |
| Google Gemini | 15 rpm, 1M tokens/day | Contracts + title deeds (complex free-form) |
| Regex | Instant, unlimited | Emirates ID, passport MRZ, bills, permits |

## Document Types

| Type | DB Enum | OCR Method | Extracts |
|---|---|---|---|
| Emirates ID | `emirates_id` | Gemini (or regex) | full_name, identity_number, nationality, DOB, expiry_date |
| Passport | `passport` | Gemini (or regex/MRZ) | passport_number, full_name, nationality, DOB, expiry_date |
| ID / Passport (legacy) | `id_passport` | Auto-detect | Either of the above |
| Title Deed | `title_deed` | Gemini vision → OCR.space+Gemini (**bilingual eng+ara**) → regex | owner_name, owner_name_ar, apartment_number, parking_spot, parking_spots, floor, building_name, building_name_ar, community, community_ar, plot_number, area_sqm, size_sqft, property_type, registration_no, purchase_price, issue_date, mortgage_status |
| DTCM Permit | `permit` | Gemini vision → OCR.space+Gemini (**bilingual eng+ara**) → regex | permit_number, property_name, operator_*, unit_type, bedrooms, building_name(_ar), unit_number, dewa_premises_number, **lease_start, lease_expiry**, plot_number, category, area(_ar) |
| Contract | `contract` | Gemini vision → OCR.space+Gemini (**bilingual eng+ara**) → regex | full_name, contract_start/end, bank details, commission %, plot_number, area(_ar) |
| Bill/Invoice | — | Regex | account_number, invoice_number, amount, due_date |

### Related
- [[File Map]], [[Database]], [[Admin Panel]], [[Units & Listings]]
