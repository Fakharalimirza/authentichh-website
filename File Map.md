---
tags: [file-map, index, reference]
scope: meta
files: []
---

# File Map

> Master index: every feature → exact file path → key functions/symbols.
> **Explore agents: grep this file first before scanning the repo.**
>
> 📋 Field-level reference: see [[Document Fields]] for what every scanned document extracts and where each field lands.

---

## Backend — Routes → Controllers → Files

| Route Mount | File | Purpose |
|---|---|---|
| `/api/admin` | `backend/routes/auth.js` → `backend/controllers/authController.js` | Admin login (JWT), `/me` |
| `/api/admin/properties` | `backend/routes/properties.js` → `backend/controllers/propertyController.js` | Properties CRUD, images, featured |
| `/api/admin/amenities` | `backend/routes/amenities.js` → `backend/controllers/amenityController.js` | Amenities CRUD |
| `/api/admin/landlord-requests` | `backend/routes/landlord.js` → `backend/controllers/landlordController.js` | Landlord submissions |
| `/api/admin/property-enquiries` | `backend/routes/enquiries.js` → `backend/controllers/enquiryController.js` | Property enquiries |
| `/api/admin/contact-messages` | `backend/routes/contact.js` → `backend/controllers/contactController.js` | Contact messages |
| `/api/admin/dashboard` | `backend/routes/dashboard.js` → `backend/controllers/dashboardController.js` | Dashboard stats |
| `/api/admin/admin-users` | `backend/routes/adminUsers.js` → `backend/controllers/adminUserController.js` | Admin user CRUD |
| `/api/admin/settings` | `backend/routes/settings.js` → `backend/controllers/settingsController.js` | Site settings (SMTP, OCR keys) |
| `/api/admin/communities` | `backend/routes/communities.js` → `backend/controllers/communitiesController.js` | Communities CRUD |
| `/api/admin/buildings` | `backend/routes/buildings.js` → `backend/controllers/buildingsController.js` | Buildings CRUD |
| `/api/admin/landlords` | `backend/routes/landlords.js` → `backend/controllers/landlordsController.js` | Landlords CRUD + documents |
| `/api/admin/units` | `backend/routes/units.js` → `backend/controllers/unitsController.js` | Units CRUD + documents, bulk import |
| `/api/admin/onboarding` | `backend/routes/onboarding.js` → `backend/controllers/onboardingController.js` | Smart Scan Onboarding — resolve-first ("dedupe-first") engine: one transaction find-or-create landlord (identity_number → passport → phone → email → exact name) + community + building (fuzzy: normalized exact → LIKE → Levenshtein ≤3) + unit by (building_id, normalized apartment). New unit = CREATE + draft listing; existing unit = RENEWAL (enrich empty fields, `unit_landlords` junction `INSERT IGNORE`, sync `units.landlord_id` to primary; junction table-guarded). Multi-owner via `owners[]` + `primaryOwnerIndex`. `POST /preview` resolves only (zero writes, never throws) returning `{ landlord, building, community, unit }` exists flags. Accepts `building.building_id` / `unit.building_id` (reuse — 400 if not found); `parking_spot_numbers` array → comma string |
| `/api/admin/listings` | `backend/routes/listings.js` → `backend/controllers/listingsController.js` | Listings CRUD |
| `/api/admin/ocr` | `backend/routes/ocr.js` → `backend/controllers/ocrController.js` | OCR document scan (POST /extract; loads ocr_method + keys from settings; contract PDFs scanned page-by-page via sessionId — first call splits PDF + scans page 1 returning { page, totalPages, sessionId }, subsequent calls pass { session_id, page }; 15-min TTL) |
| `/api/admin/articles` | `backend/routes/articles.js` → `backend/controllers/articlesController.js` | Area articles CRUD |
| `/api/settings` | `backend/routes/settings.js` → `backend/controllers/settingsController.js` | Public settings |
| `/api/buildings` | `backend/routes/buildings.js` | Public buildings |
| `/api/communities` | `backend/routes/communities.js` | Public communities |
| `/api/properties` | `backend/routes/properties.js` | Public properties |
| `/api/listings` | `backend/routes/listings.js` | Public listings |
| `/api/amenities` | `backend/routes/amenities.js` | Public amenities |
| `/api/landlord-requests` | `backend/routes/landlord.js` | Public landlord submissions |
| `/api/property-enquiries` | `backend/routes/enquiries.js` | Public enquiry submission |
| `/api/contact` | `backend/routes/contact.js` | Public contact form |
| `/api/config` | `backend/routes/config.js` | Public config (maps API key) |
| `/api/reviews` | `backend/routes/reviews.js` → `backend/controllers/reviewsController.js` | Google Reviews (cache + OAuth) |

## Backend — Utilities

| File | Purpose |
|---|---|
| `backend/utils/ocr.js` | OCR pipeline: `extractWithOcrSpace` (sharp image preprocess + PDF attempt, Engine 2→1 fallback, retry w/ backoff; `language` param — Arabic `ara` uses Engine 1 only since Engine 2 has no Arabic), **`extractBilingualWithOcrSpace`** (parallel eng + ara passes merged for `BILINGUAL_DOC_TYPES` = title_deed/permit/contract — fixes garbled Arabic), `ocrTextForDoc` selector, `preprocessImage`, `sendToOcrSpace`, `isRetryableOcrError` (incl. `overloaded`), `callWithRetry` (exported; 3 attempts, exponential backoff — wraps Gemini fetch in `structureWithGemini`/`structureWithGeminiVision`), `extractEmiratesId` (regex incl. loose 3-4-7-1 digit-group fallback + Arabic `تاريخ الانتهاء` expiry label), `extractPassport`, `extractBill`, `extractPermit` (now also grabs `lease_expiry`/`lease_start` from "Date Expiry Lease"/"Date Start Lease"/Arabic labels with swap-if-start>expiry sanity), **`rescuePlotNumber`** (fills `plot_number` from English label when Gemini returns null), `structureWithGemini` + `structureWithGeminiVision` (gemini-3.6-flash; shared `GEMINI_PROMPTS` incl. emirates_id/passport/contract/title_deed/permit — multi-page contract prompt reads page 1 + LAST pages for bank/DEWA/plot details; title_deed extracts 18 fields incl. Arabic; `parseGeminiJson`; text slice 16k chars), `splitPdfIntoPages` (pdf-lib: contract PDF → one temp PDF per page) + `cleanupSplitPages`, `scanContractPage` (per-page scan with `contract_page` prompt + `{PAGE}` substitution, honors ocr_method), `processDocument` (routes emirates_id/passport/contract/title_deed/permit by `settings.ocr_method`: auto / gemini_vision / ocrspace_gemini / ocrspace_regex; auto mode records `_vision_error` on the result when vision fails and it falls back to OCR.space+Gemini; OCR.space fallback throws clean `status:503` via `makeOcrUnavailableError` when overloaded — controller responds JSON not crash; `extractByRegex` fallback uses specialized ID/passport/permit extractors) |
| `backend/utils/email.js` | Nodemailer transport (DB-driven SMTP config with .env fallback) |
| `backend/utils/emailTemplates.js` | 6 branded HTML email templates (enquiry/landlord/contact × admin/user) |
| `backend/utils/slugify.js` | URL slug generator |
| `backend/utils/plusCode.js` | Open Location Code utility |
| `backend/utils/imageUtils.js` | Image processing (Sharp) |

## Backend — Config & Middleware

| File | Purpose |
|---|---|
| `backend/server.js` | Express app entry — Helmet CSP, CORS, routes, error handler |
| `backend/config/db.js` | MySQL2 connection pool (`mysql2/promise`) |
| `backend/middleware/auth.js` | `authenticateToken` JWT middleware |
| `backend/middleware/upload.js` | `upload` (property images), `csvUpload` (bulk import), `documentUpload` (PDF/images, 10MB) |
| `backend/middleware/rateLimiter.js` | Rate limiting middleware |

## Backend — Scripts

| File | Purpose |
|---|---|
| `backend/run-migration.js` | Generic migration runner |
| `backend/run-docs-migration.js` | Documents table migration |
| `backend/run-dob-expiry-migration.js` | DOB/expiry columns migration |
| `backend/run-unit-wifi-parking-migration.js` | Units wifi/parking + landlord passport columns, documents ENUM expansion |
| `backend/run-onboarding-migration.js` | Smart Scan Onboarding columns: landlord bank currency/address, unit size_sqm/floor/DEWA account/utility bills, building plot_number, doc contract start/end |
| `backend/run-document-number-migration.js` | `unit_documents.document_number` column (title deed registration no, EID number, passport number, permit number) |
| `backend/scripts/migrate-amenities.js` | Amenities schema migration |
| `backend/scripts/populate-building-coords.js` | Populate building lat/lng from plus_code |
| `backend/scripts/populate-listing-coords.js` | Copy building coords to linked listings |
| `backend/scripts/seed-categories.js` | Category seed script |

## Frontend — Admin Pages (`frontend/src/pages/admin/`)

| File | Route | Purpose |
|---|---|---|
| `AdminLogin.jsx` | `/admin/login` | JWT login form |
| `AdminDashboard.jsx` | `/admin` | Stats cards, quick actions |
| `AdminListings.jsx` | `/admin/listings` | Listings table, search/filter, CRUD |
| `AdminPropertyWizard.jsx` | `/admin/listings/new`, `/admin/listings/edit/:id` | 9-step wizard |
| `AdminUnits.jsx` | `/admin/units` | Units table, CRUD, bulk import, OCR scan (title deed auto-fills unit form, building match, optional Arabic-name apply to building/community/landlord); parking spot numbers (dynamic inputs → comma-joined string), WiFi username/password, pending document upload on create (`updateParkingSpotNumber`); documents: Title Deed, DTCM Permit, Contract (upload/scan/expiry edit); fields: DEWA account number, utility_bills_paid_by, floor, size_sqm |
| `AdminOnboarding.jsx` | `/admin/smart-scan` | Smart Scan Onboarding — **6-step wizard** (Scan → Landlord → Building & Community → Unit → Agreement & Permit → Review & Save) wrapped in `AdminLayout`. Step 0 (renders `OnboardingAddStep`): 5 upload slots (Emirates ID / Passport / Title Deed / Property Management Agreement / DTCM Permit), background scan queue concurrency 2 (queued → scanning → done/error, one auto-retry), **extraction-method badge on each done card** (Vision / OCR.space+Gemini / Regex / Basic, from `fields._type`, with ⚠ `_vision_error`/`_error` note), contract scans **pages 1, 7, 8 only** (last 2 pages when totalPages < 8; pdf-lib page split server-side; session `{ page, totalPages }` determinate progress). **Merge engine now lives in `onboarding/onboardingUtils.js`** (`FIELD_SOURCES`/`SOURCE_KEYS` per-field priority lists, `resolveField`, `normalizeScanValue`, `collectCandidates`): raw per-doc fields in `sourceFields`; target fields recomputed first-non-empty (Emirates ID priority for identity); `manualOverrides` = admin edits + drag-filled values never overwritten; `fieldSources` map for "from X" tags; `*Ref` mirrors avoid stale closures during concurrent scans. **Drag-drop fill**: `OnboardingField.jsx` renders draggable candidate chips (`.ob-candidate-chip`) per field — drag into the field (`.ob-field-control` dropzone, `ob-drag-over`) or click = `onSetValue(name, value, source)` override. Steps render `OnboardingLandlordStep` / `OnboardingBuildingStep` / `OnboardingUnitStep` / `OnboardingAgreementStep`. Building match: debounced `GET /buildings?search=` exact case-insensitive → reuse via `building.building_id` or "New building" panel + plus_code. **Debounced resolve-only preview** `POST /api/admin/onboarding/preview` → `resolution` state → `OnboardingReviewStep` ("What will happen on Save": existing/new per entity, renewal banner, primary-owner radio picker, conflicts list). Additional owners: `owners[]` state (manual entry + per-owner EID/passport mini-scan `scanOwnerId`); primary = `primaryOwnerIndex`. Save → `POST /api/admin/onboarding` with `owners[]` + `primaryOwnerIndex` (dedupe-first backend, see `/api/admin/onboarding` row), then attach scanned docs via landlord/unit document endpoints (multipart headers; `document_number` + expiry/contract dates); renewal mode keeps history (new doc rows), never creates a second unit/listing |
| `AdminLandlords.jsx` | `/admin/landlords` | Landlords table, CRUD, OCR scan, documents (Emirates ID / Passport split, pending document upload on create), passport_number field, bank_account_currency + bank_address; Emirates ID priority auto-fill |
| `AdminBuildings.jsx` | `/admin/buildings` | Buildings CRUD (incl. plot_number) |
| `AdminCommunities.jsx` | `/admin/communities` | Communities CRUD |
| `AdminArticles.jsx` | `/admin/articles` | Area articles CRUD |
| `AdminEnquiries.jsx` | `/admin/enquiries` | Enquiries table, status actions |
| `AdminContactMessages.jsx` | `/admin/contact-messages` | Contact messages, slide-panel |
| `AdminLandlordRequests.jsx` | `/admin/landlord-requests` | Landlord submissions |
| `AdminAmenities.jsx` | `/admin/amenities` | Amenities CRUD |
| `AdminUsers.jsx` | `/admin/admins` | Admin user CRUD + password reset |
| `AdminSettings.jsx` | `/admin/settings` | Settings form (General, Social, RMS, SMTP, OCR incl. `ocr_method` method selector) |
| `BuildingMapTest.jsx` | `/test-map` | Map test page (AdvancedMarkerElement) |
## Frontend - Admin Onboarding Wizard (`frontend/src/pages/admin/onboarding/`)

| File | Purpose |
|---|---|
| `onboardingUtils.js` | Merge engine + constants shared by every step: `FIELD_SOURCES`/`SOURCE_KEYS` per-field priority lists, `resolveField`, `normalizeScanValue`, `collectCandidates` (drag-chip candidates), `DOC_TYPE_LABEL`, `FIELD_LABELS`, `fallbackLabel`, `empty*` shapes. Permit fields = `permit_number` + **`lease_expiry`** (DTCM permit expiry = the permit's lease expiry; `operator_license_expiry` retired from the merge) |
| `OnboardingField.jsx` | Shared form field — input/select/textarea + "from X" source tag + collapsible candidate chips (draggable for drag-drop fill, click = fill), `ob-drag-over` dropzone hint |
| `OnboardingAddStep.jsx` | Step 0 "Scan" — 5 scan-card upload slots w/ queue status chips + progress bars (determinate for contract pages, indeterminate otherwise), FieldReview pills per done card |
| `OnboardingLandlordStep.jsx` | Step 1 — primary landlord fields + additional owner cards (manual entry, per-owner EID/passport mini-scan, remove) |
| `OnboardingBuildingStep.jsx` | Step 2 — building & community fields + building match/new panels (debounced) |
| `OnboardingUnitStep.jsx` | Step 3 — unit fields (apartment, property/house type, floors, sizes, DEWA, parking, internet, guests, description) |
| `OnboardingAgreementStep.jsx` | Step 4 — Property Management Agreement (اتفاقية إدارة عقار) + DTCM Permit fields; DEWA premises synced to unit |
| `OnboardingReviewStep.jsx` | Step 5 — resolution summary ("What will happen on Save"), renewal banner, primary-owner picker, conflicts list, scanned Agreement/Permit pills |
| `OnboardingFieldReview.jsx` | OCR-extracted-field pill chips renderer (`fields`, `title`) — friendly `LABELS` map, noise keys filtered, shared by scan cards + review |

## Frontend — Wizard Steps (`frontend/src/pages/admin/wizard/`)

| File | Step | Purpose |
|---|---|---|
| `BasicInfoStep.jsx` | 1 | Title, slug, property type, building, community, landlord |
| `LocationStep.jsx` | — | (REMOVED from wizard — location auto-filled from building/community) |
| `TypeStep.jsx` | 3 | Bedrooms, bathrooms, guests, parking, size |
| `DetailsStep.jsx` | 4 | Price, description, short description (Bedrooms/bathrooms/parking here) |
| `AmenitiesStep.jsx` | 5 | Amenity checkboxes |
| `ImagesStep.jsx` | 6 | Immediate image upload on selection + drag reorder |
| `DocumentsStep.jsx` | — | (REMOVED from wizard, exists on disk but not imported) |
| `SeoStep.jsx` | 7 | Meta title, meta description |
| `DescriptionStep.jsx` | 8 | Full description editor |
| `BuildingStep.jsx` | 9 | Searchable Building/Community/Landlord dropdowns |

## Frontend — Public Pages (`frontend/src/pages/public/`)

| File | Route | Purpose |
|---|---|---|
| `Home.jsx` | `/` | Hero, featured, areas, facilities, CTA, contact |
| `Apartments.jsx` | `/apartments` | Property listing grid, filters, sort |
| `PropertyDetails.jsx` | `/apartments/:slug` | Carousel, enquiry card, sticky bar, map |
| `Favorites.jsx` | `/favorites` | Saved properties (localStorage) |
| `Areas.jsx` | `/areas` | Area guides index |
| `AreaArticle.jsx` | `/areas/:slug` | Article page, breadcrumb, FAQ, JSON-LD |
| `About.jsx` | `/about` | About us page |
| `Facilities.jsx` | `/facilities` | Amenities/facilities list |
| `ListProperty.jsx` | `/list-your-property` | Landlord submission form |
| `Contact.jsx` | `/contact` | Contact form, map, reviews |
| `Terms.jsx` | `/terms` | Terms & conditions |
| `Privacy.jsx` | `/privacy` | Privacy policy |
| `DesignSystem.jsx` | `/design-system` | Component showcase |

## Frontend — Public Components (`frontend/src/components/public/`)

| File | Purpose |
|---|---|
| `PropertyCard.jsx` | Card: image carousel, price, location, meta, favorite button |
| `PropertyCarousel.jsx` | Property image gallery (Swiper) |
| `PropertyEnquiryCard.jsx` | Enquiry form card |
| `PropertyMap.jsx` | Google Maps AdvancedMarkerElement with InfoWindow, no-coords fallback |
| `BuildingMapSection.jsx` | Building map with AdvancedMarkerElement cluster |
| `Reviews.jsx` | Google Reviews Swiper carousel + accordion |
| `Button.jsx` | Design system button (variants, sizes) |
| `Card.jsx` | Design system card |
| `Badge.jsx` | Design system badge |
| `Input.jsx` | Form input component |
| `Modal.jsx` | Overlay modal |
| `Toast.jsx` | Toast notification |
| `Skeleton.jsx` | Loading skeletons (PropertyCardSkeleton, etc.) |
| `DirhamSymbol.jsx` | AED currency symbol |
| `AgentAdminCard.jsx` | Agent/admin profile card |
| `index.js` | Public component barrel exports |

## Frontend — Shared Components (`frontend/src/components/shared/`)

| File | Purpose |
|---|---|
| `Header.jsx` | Responsive header, mobile hamburger, location dropdown, heart icon |
| `Footer.jsx` | Footer with WhatsApp SVG, links |
| `MobileMenu.jsx` | Mobile nav overlay |
| `AdminSidebar.jsx` | Admin sidebar (Lucide icons, collapsible) |
| `DateRangePicker.jsx` | Inline date range picker (locale-aware, Arabic months) |
| `PropertyFilters.jsx` | Property filter drawer/sidebar |
| `SearchableSelect.jsx` | Searchable dropdown (location autocomplete) |
| `ThemeToggle.jsx` | Dark/light theme toggle |
| `navData.js` | Navigation data constants |

## Frontend — Admin Components (`frontend/src/components/admin/`)

| File | Purpose |
|---|---|
| `AdminLayout.jsx` | Admin shell: sidebar + header + content |
| `AdminHeader.jsx` | Admin page header (title + actions) |
| `AdminTablePage.jsx` | Shared list-page skeleton (filter bar + skeleton + empty + table + mobile + pagination); used by all 11 table pages |
| `AdminSearchSelect.jsx` | Searchable admin filter dropdown (auto for 8+ options): live filter, keyboard nav, clear |
| `AdminFilterBar.jsx` | Reusable search + filter dropdowns/date inputs + count (used by AdminTablePage); filters with 8+ options render as `AdminSearchSelect` |
| `AdminPagination.jsx` | Pagination controls |
| `ConfirmDialog.jsx` | Delete/action confirmation modal |
| `TableSkeleton.jsx` | Table loading skeleton |
| `RowActions.jsx` | Row action menu (View/Edit/Delete) |
| `BottomTabBar.jsx` | Mobile bottom tab bar |
| `MobileCard.jsx` | Mobile card view for tables |
| `MobileCardList.jsx` | Mobile list of cards |
| `MobileMoreSheet.jsx` | Mobile overflow sheet |
| `ResetPasswordModal.jsx` | Password reset modal |
| `UserFormModal.jsx` | Admin user create/edit form |
| `IconPicker.jsx` | Icon selection component |

## Frontend — Contexts & Hooks

| File | Purpose |
|---|---|
| `context/AdminAuthContext.jsx` | Admin JWT auth (login/logout/checkAuth, localStorage) |
| `context/FavoritesContext.jsx` | Favorites provider (localStorage `ahf-favorites`) |
| `contexts/ThemeContext.jsx` | Theme provider (dark/light toggle) |
| `hooks/useAdminToast.js` | Admin toast hook |
| `hooks/useOnScreen.jsx` | Intersection Observer hook |

## Frontend — i18n

| File | Purpose |
|---|---|
| `i18n/en.json` | English translations |
| `i18n/ar.json` | Arabic translations |
| `i18n/I18nContext.jsx` | i18n provider + `useI18n` hook (locale, t(), direction) |

## Frontend — Stylesheets

| File | What it styles |
|---|---|
| `styles/tokens.css` | CSS variables: colors, typography, spacing, radii, shadows, z-index |
| `styles/components.css` | Design system components (Button, Card, Badge, form) |
| `styles/global.css` | Global reset, shared utility classes |
| `styles/shared.css` | Shared layout (header, footer, mobile menu) |
| `styles/admin/admin.css` | Admin page styles |
| `styles/admin/admin-components.css` | Admin component styles + form primitives (`.admin-input`, `.admin-label`, `.admin-textarea`, `.form-group`, `.admin-detail-grid`, `.text-mono`, `.admin-search-select*`) |
| `styles/admin/admin-mobile.css` | Admin mobile responsive |
| `styles/public/public-components.css` | Public component styles (carousel, reviews, cards) |
| `styles/public/public-pages.css` | Public page styles (property detail, sticky bar) |

## Frontend — Utilities

| File | Purpose |
|---|---|
| `utils/api.js` | Axios instances: `api` (public, /api) + `adminApi` (admin, /api/admin, JWT) |
| `utils/format.js` | Formatting utilities |
| `utils/imageUrl.js` | Image URL resolver |
| `utils/loadGoogleMaps.js` | Google Maps script loader |
| `utils/mapStyles.js` | Map theme styles |
| `utils/amenityIcons.js` | Amenity icon mapping |

## Database — Migrations & Seeds

| File | What it adds |
|---|---|
| `database/schema.sql` | Base schema: 8 original tables + seed data |
| `database/migration-settings.sql` | Settings table keys fix |
| `database/migration-smtp-config.sql` | SMTP config columns |
| `database/migration-parking-spots.sql` | `parking_spots` column on properties |
| `database/migration-plus-code.sql` | `plus_code` column |
| `database/migration-communities.sql` | `communities` table |
| `database/migration-articles.sql` | `area_articles` table |
| `database/migration-articles-arabic.sql` | Arabic columns on articles |
| `database/migration-properties-arabic.sql` | Arabic columns on properties |
| `database/migration-buildings-units-landlords.sql` | `buildings`, `units`, `landlords` tables |
| `database/migration-buildings-units-complete.sql` | Full buildings/units/landlords schema |
| `database/migration-units-listings-split.sql` | Units ↔ listings data split |
| `database/migration-landlord-simplify.sql` | Landlord schema simplification |
| `database/migration-documents.sql` | `unit_documents` table |
| `database/migration-ocr-data.sql` | `ocr_data` JSON column on unit_documents |
| `database/migration-reviews-cache.sql` | `reviews_cache` table |
| `database/migration-document-number.sql` | `unit_documents.document_number` column (title deed registration no, EID/passport/permit numbers) |
| `database/seed.js` | Admin user seed |
| `database/seed-communities.js` | 248 communities across 9 Dubai sectors |
| `database/seed-articles.js` | 9 area articles with cross-links |
| `database/seed-properties.js` | Property seed data |