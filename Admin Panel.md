---
tags: [admin, dashboard, crud, wizard, sidebar]
scope: frontend
files: ["frontend/src/pages/admin/AdminDashboard.jsx", "frontend/src/pages/admin/AdminProperties.jsx", "frontend/src/pages/admin/AdminPropertyWizard.jsx", "frontend/src/pages/admin/AdminUnits.jsx", "frontend/src/pages/admin/AdminLandlords.jsx", "frontend/src/pages/admin/AdminBuildings.jsx", "frontend/src/pages/admin/AdminCommunities.jsx", "frontend/src/pages/admin/AdminArticles.jsx", "frontend/src/pages/admin/AdminAmenities.jsx", "frontend/src/pages/admin/AdminUsers.jsx", "frontend/src/pages/admin/AdminSettings.jsx", "frontend/src/pages/admin/AdminEnquiries.jsx", "frontend/src/pages/admin/AdminLandlordRequests.jsx", "frontend/src/pages/admin/AdminContactMessages.jsx", "frontend/src/components/admin/AdminLayout.jsx", "frontend/src/components/admin/AdminSidebar.jsx"]
---

# Admin Panel

> 16 admin pages + 9-step wizard + building map + OCR scanning.

---

## Login

| Detail | Value |
|--------|-------|
| URL | `http://localhost:5173/admin/login` |
| Email | `admin@authenticholidayhomes.ae` |
| Password | `admin123` |
| Auth | JWT in `localStorage` (`adminToken`) |
| Token expiry | 24h (`JWT_EXPIRES_IN` env) |
| Rate limit | 10/15min/IP (`authLimiter`) |

### Login Flow
1. `POST /api/admin/login` → bcrypt verify → JWT
2. Store JWT + user in localStorage → redirect `/admin`
3. 401/403 → auto-redirect to `/admin/login` (axios interceptor)

### Seed: `node database/seed.js` (resets password hash)

---

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/login` | AdminLogin | Login form |
| `/admin` | AdminDashboard | Stats cards, quick actions |
| `/admin/properties` | AdminProperties | Paginated table, search/filter, CRUD |
| `/admin/properties/new` | AdminPropertyWizard | 9-step creation wizard |
| `/admin/properties/edit/:id` | AdminPropertyWizard | Edit existing |
| `/admin/units` | AdminUnits | Units CRUD, bulk import, doc upload + OCR scan |
| `/admin/smart-scan` | AdminOnboarding | Smart Scan Onboarding — 2-step (Add Documents w/ background queue → Review & Link w/ building match) that auto-creates/links landlord, building, community, unit + draft listing |
| `/admin/landlords` | AdminLandlords | Landlords CRUD, doc upload + OCR scan |
| `/admin/buildings` | AdminBuildings | Buildings CRUD |
| `/admin/communities` | AdminCommunities | Communities CRUD (248 Dubai areas) |
| `/admin/articles` | AdminArticles | Area articles CRUD (EN/AR) |
| `/admin/landlord-requests` | AdminLandlordRequests | Table with slide-panel detail |
| `/admin/enquiries` | AdminEnquiries | Table with status actions |
| `/admin/contact-messages` | AdminContactMessages | Table with slide-panel detail |
| `/admin/amenities` | AdminAmenities | CRUD with toggle |
| `/admin/admins` | AdminUsers | Admin user management |
| `/admin/settings` | AdminSettings | Site settings + OCR API keys |

---

## Shared Components

| Component | Purpose |
|-----------|---------|
| AdminLayout | Wrapper: auth check + sidebar + header + content |
| AdminSidebar | Nav with Lucide icons, collapsible, mobile overlay |
| AdminHeader | Title + action buttons + user avatar |
| AdminTablePage | **Shared list-page skeleton**: title/actions + filter bar + loading skeleton + empty state + table + mobile cards + pagination. All 11 table pages use it. Props: `title, actions, loading, items, rowKey, columns [{label, align?, render(item)}], search, filters [{label, placeholder?, value, onChange, options?, type?: 'select'\|'date'}], count, countLabel, empty {icon?, title, hint, action?}, mobileCard, pagination, beforeTable` |
| AdminFilterBar | Search input + filter dropdowns/date inputs + result count. Used internally by AdminTablePage |
| AdminAuthContext | React context for login/logout/auth state |
| ConfirmDialog | Modal confirmation for destructive actions |
| TableSkeleton | Shimmer loading placeholder |
| useAdminToast | Toast notification hook |

---

## 9-Step Property Wizard

| Step | Component | Fields |
|------|-----------|--------|
| 1 | BasicInfoStep | Title (EN/AR), slug (auto), status, featured |
| 2 | LocationStep | Location (EN/AR), address (EN/AR), map URL |
| 3 | TypeStep | Property type (EN/AR) |
| 4 | DetailsStep | Bedrooms, bathrooms, parking_spots, price/night, size_sqft |
| 5 | AmenitiesStep | Amenity multi-select |
| 6 | ImagesStep | Upload (max 20, 5MB), drag reorder, cover toggle |
| 7 | SEOStep | Meta title/description (EN/AR) |
| 8 | DescriptionStep | Short + full description (EN/AR) |
| 9 | BuildingStep | Searchable Building/Community/Landlord dropdowns, optional unit |

All lookups `limit=9999` for full dropdowns. Submit sends `unit_id`.

---

## OCR Scanning (AdminLandlords + AdminUnits)

- **Scan button** next to Upload in document cards
- POST file to `/api/admin/ocr/extract` → review modal
- **Review modal**: editable extracted fields, "Show raw OCR text" toggle
- **"Upload & Auto-fill" button**: saves document + fills form fields
- Auto-fills: full_name, identity_number, nationality, date_of_birth (Emirates ID); passport_number (Passport)
- **Emirates ID is priority**: overwrites shared fields; passport never replaces existing data
- Contract documents live on **Units** (moved from landlord form)
- See [[OCR System]] for details

---

## Smart Scan Onboarding (`/admin/smart-scan`, AdminOnboarding)

**6-step wizard** — Scan → Landlord → Building & Community → Unit → Agreement & Permit → Review & Save. Steps render step components under `frontend/src/pages/admin/onboarding/`; the merge engine lives in `onboardingUtils.js` (shared by every step).

- **Step 1 "Scan"**: 5 upload slots (Emirates ID, Passport, Title Deed, Property Management Agreement, DTCM Permit) attachable at once. Scans run on a **background queue with concurrency 2** (`scanQueue` + worker effect) — all 5 documents can be scanning/queued while the admin moves through the wizard. Per-document status chips (queued → scanning → done/error) with one auto-retry on failure. Extracted-field pills appear on each done card.
- **Contract scans only the key pages**: the PDF is split into single-page PDFs (pdf-lib) server-side; the first call scans page 1 and returns `{ page, totalPages, sessionId }`, then the frontend requests pages 7 and 8 (or the last 2 pages when the contract has fewer than 8) — middle pages are skipped to save Gemini quota. A determinate progress bar on the Contract card shows "Scanning page X of Y". All other scan cards show an indeterminate animated bar while scanning. Fields from scanned pages are merged (later pages only fill empty fields).
- **Source-aware merge engine** (`onboardingUtils.js`): every target field has a per-field priority list (`FIELD_SOURCES`/`SOURCE_KEYS`) — first non-empty source wins; Emirates ID is the priority source for personal identity; title deed `owner_name`/`owner_name_ar`/`parking_spots` feed the landlord/unit forms; `manualOverrides` (admin edits + drag-filled values) are never overwritten by later scans; each auto-filled input shows a "from <document>" tag (`.ob-source-tag`). Passport number fills correctly even when EID + passport scan concurrently.
- **Drag-drop fill**: every field (`OnboardingField.jsx`) shows a collapsible row of extracted **candidate chips** — drag a chip into the field (or click it on touch) to fill it via `onSetValue(name, value, source)`, which marks the field as a manual override.
- **Step 5 "Review & Save"**: **debounced resolve-only preview** (`POST /api/admin/onboarding/preview` — zero writes) shows "What will happen on Save": existing/new per entity (landlord, building, community, unit) with match reasons; a **renewal banner** when the unit already exists (contract/permit will be renewed, no duplicate unit); a **primary-owner radio picker**; and a **conflicts list** ("fields where documents disagree") to go back and drag in the right value.
- **Building match**: typing the building name debounce-checks `GET /buildings?search=`; an exact case-insensitive name match shows "We already have this building" and the save reuses it via `building.building_id` (no duplicate); no match shows a "New building" panel with a **Plus Code** input.
- **Multiple owners**: single owner by default; "Add another owner" cards allow manual entry + a per-owner EID/passport **mini-scan** (`scanOwnerId`) that fills only that owner. The primary owner is picked at review (`primaryOwnerIndex`).
- **Utility Bills Paid By** is an admin-only select — never auto-filled from OCR (defaults to `management`).
- Save → `POST /api/admin/onboarding` → **dedupe-first backend** (see Backend API / File Map): resolve landlord by identity_number → passport → phone → email → exact name; building by fuzzy name; unit by (building, normalized apartment). New unit = create unit + draft listing; **existing unit = renewal** (enrich empty unit fields, `unit_landlords` junction `INSERT IGNORE`, sync `units.landlord_id` to primary, new contract/permit doc rows kept for history). Accepts `owners[]` + `primaryOwnerIndex`. Then the frontend attaches scanned document files to the new landlord/unit records — each doc upload carries its **`document_number`** (EID number, passport number, title-deed registration no, permit number) + expiry/contract dates → redirects to `/admin/units`.
- All Arabic (`_ar`) fields are captured at scan time and editable in the steps.

---

## Settings Page

| Section | Fields |
|---------|--------|
| General | Site Name, Contact Email, Phone, Address |
| Social | Facebook URL, Instagram URL |
| RMS | RMS Login URL |
| SMTP | Host, Port, User, Password, From Email |
| OCR | OCR.space API key, Gemini API key |

SMTP used by `backend/utils/email.js`. OCR keys used by document scanning.

---

## Email Templates (`backend/utils/emailTemplates.js`)

| Template | Sent To |
|----------|---------|
| enquiryAdminTemplate | Admin (new enquiry) |
| enquiryUserTemplate | Guest (confirmation) |
| landlordAdminTemplate | Admin (new request) |
| landlordUserTemplate | Landlord (next steps) |
| contactAdminTemplate | Admin (new message) |
| contactUserTemplate | Contact sender (acknowledgment) |

All use `baseTemplate` wrapper with branded gradient header.

---

## Admin Login
- **Default:** `admin@authenticholidayhomes.ae` / `admin123`
- Run `node database/seed.js` to reset

### Related
- [[File Map]], [[Backend API]], [[Database]], [[Units & Listings]], [[OCR System]]
