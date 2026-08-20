---
tags: [session-log, history, changelog]
scope: meta
files: []
---

# Session Log — July 24, 2026

> Chronological record of all changes made during this development session.

---

# Session Log — August 3, 2026

> Continuation: detail-page polish, favorites, related carousel, repo hygiene.

## Map + Theme + Detail Page Polish

- Map theming now follows the app theme (light/dark map tiles switched via `data-theme`).
- Property detail gallery rewritten as a single-main-picture carousel on all screen sizes (auto-play 4s, pauses on hover/lightbox, arrows + counter + dots + swipe). Old desktop mosaic removed.
- Enquiry card: "Check Availability" heading, sticky `top:100`, non-scrollable, compact `DateRangePicker` matched to picture height.
- Sticky bar starts hidden (`opacity:0; pointer-events:none`) and reveals only after the enquiry card scrolls out of view.
- `parking_spots` column added end-to-end (schema, migration, seed, admin create/update/wizard, details stats row).
- Breadcrumb + short_description removed from detail header; stats row now shows Parking Space (Car icon) in place of Max Guests.
- Sticky-bar button label aligned to "Check Availability".

## Related Properties Carousel

- Swiper (existing dependency) now powers the "You May Also Like" section: `.slice(0, 6)`, `Navigation` module, loop when >3, responsive `slidesPerView` 1.15/2/3, custom `.pd-related*` styles in `public-pages.css`.

## Favorites (localStorage)

- New `FavoritesContext.jsx` (`ahf-favorites` JSON array of property IDs) wrapping the app in `main.jsx`.
- `PropertyCard` heart now reads/writes the context (shared state across cards, header, mobile menu).
- New `/favorites` page (`Favorites.jsx`) refetches `/properties/published` and filters to saved IDs; empty-state CTA to browse apartments.
- Header heart icon button with count badge (all breakpoints) + "Saved" link in `MobileMenu`.

## Repo Hygiene

- Root `.gitignore` created: node_modules/, backend/.env, .env*, dist, build_log.txt, *.log, *.timestamp-*.mjs, .obsidian/.idea/.vscode, OS junk. Ran `git rm -r --cached` on the previously tracked dirs/files — nothing sensitive is tracked anymore. Deleted stray `frontend/build_log.txt` and a stale `vite.config.js.timestamp-*.mjs`. **No commit made.**
- Security: `backend/.env` is in git history (prior commit was "Remove .gitignore — track everything"). Rotate real secrets before any push.

## Files Modified / Added

| File | Change |
|------|--------|
| `frontend/src/context/FavoritesContext.jsx` | NEW — favorites provider (localStorage) |
| `frontend/src/pages/public/Favorites.jsx` | NEW — saved-properties page |
| `frontend/src/main.jsx` | Wrapped app in `FavoritesProvider` |
| `frontend/src/App.jsx` | Added `/favorites` route |
| `frontend/src/components/public/PropertyCard.jsx` | Heart uses `useFavorites` |
| `frontend/src/components/shared/Header.jsx` | Heart icon + count badge |
| `frontend/src/components/shared/MobileMenu.jsx` | "Saved" link with count |
| `frontend/src/pages/public/PropertyDetails.jsx` | Swiper related carousel; sticky-bar label |
| `frontend/src/styles/public/public-pages.css` | `.pd-related*` styles |
| `.gitignore` | NEW — repo hygiene |

## Current State (End of Session)

- `npx vite build` passes (only pre-existing chunk-size warning).
- Favorites persist across reloads; count badge stays in sync; Favorites page refetches fresh data.
- Related carousel has nav arrows on desktop, swipe on mobile.

---

## Initial State

- Project existed with basic React frontend (Vite + React Router) and Express backend
- MySQL database with schema + seed data
- Basic PropertyCard and page components
- Original `.env` had `DB_PASSWORD=rootpw` (wrong for XAMPP — should be empty)

---

## Step 1: Database & Config Fixes

### Fixed `.env` password
- **File**: `backend/.env`
- **Change**: `DB_PASSWORD` from `rootpw` to empty string
- **Why**: XAMPP MySQL has no password for root by default

### Ran schema.sql
- Created `authentic_holiday_homes` database
- Created all 8 tables (admin_users, properties, property_images, amenities, property_amenities, property_enquiries, landlord_requests, contact_messages)
- Seeded 14 default amenities
- Seeded 3 published properties with images and amenity associations

### Added `images` array to API responses
- **File**: `backend/controllers/propertyController.js`
- **Change**: All listing endpoints (`getAll`, `getFeatured`, `getPublished`, `getBySlug`) now return `images` array alongside `cover_image`
- Added amenities join to `getAll`, `getFeatured`, `getPublished`
- **Why**: Frontend needed the full images array (not just cover) for the carousel

---

## Step 2: PropertyCard Redesign

### File: `frontend/src/components/ui/PropertyCard.jsx`

**Changes**:
- **Aspect ratio**: Changed from 4:3 to **16:10** for a more modern, cinematic look
- **Single `<img>` carousel**: Only one `<img>` in the DOM at a time, keyed by `currentIndex`, with CSS `fadeIn` animation on key change
- **Arrow buttons**: `<ChevronLeft>` / `<ChevronRight>` overlays, visible on hover via `.pcard-arrows--visible`
- **Image counter**: "1 / N" badge at bottom-right
- **Preview strip**: Next 3 images as small clickable thumbnails at the bottom of the image area
- **Feature badge**: "Featured" pill top-left when `is_featured === true`
- **Heart favorite**: Top-right toggle button (local state only)
- **Hover effects**: Card lifts 4px, image scales 1.05x, arrows fade in
- **Touch swipe**: Touch events with >40px threshold for prev/next
- **Preloading**: `useEffect` preloads the next image via `new Image()`
- **Performance**: `useCallback` for prev/next handlers to prevent unnecessary re-renders

**CSS** (`.pcard-*` classes in `components.css`):
- `aspect-ratio: 16 / 10` for media area
- `transition: transform 0.4s var(--ease-out)` on `.pcard` (card lift)
- `transition: transform 0.5s var(--ease-out)` on `.pcard-img` (image zoom)
- `.pcard-preview` — flex row of 3 small thumbnails at the bottom
- `.pcard-preview-thumb` — `flex: 1`, `aspect-ratio: 16 / 9`, border radius
- `.pcard-counter` — bottom-right overlay with semi-transparent bg
- `.pcard-fav` — top-right circle button with heart icon
- `.pcard-arrows` — hidden by default, `.pcard-arrows--visible` on hover
- RTL: all positioning uses logical properties (`inset-inline-start`, etc.)

**Skeleton** (`Skeleton.jsx`):
- Updated `PropertyCardSkeleton` to match 16:10 aspect ratio
- Added skeleton placeholders for image, title, meta, price footer

---

## Step 3: PropertyDetails Page — Full Implementation

### File: `frontend/src/pages/PropertyDetails.jsx`

### Carousel
- **Layout**: CSS Grid with `minmax(0, 800px)` main image column + 120px thumbnails column (max-width 930px)
- **Main image**: `aspect-ratio: 4 / 3`, `object-fit: cover`, capped at 800px
- **Thumbnails**: 5 at 16:9 natural ratio, 120px wide, vertical stack (desktop)
- **Auto-scroll**: `setInterval(nextImg, 4000)`, pauses on hover (`carouselHovered` state)
- **Swipe**: touch events with >50px threshold
- **Arrows**: visible on hover, always visible on touch devices
- **Counter**: "1 / N" at bottom-right
- **Lightbox**: full-screen overlay with prev/next navigation and counter

### Enquiry Card
- **Layout**: Sticky positioned (top: 100px) Card with "Enquire Now" heading
- **WhatsApp + Call buttons**: Side-by-side flex row
- **Calendar**: Inline `DateRangePicker` component — shown by default (no gate button)
- **Form**: Name + Phone inputs, "Send Enquiry" submit button
- **Submitted state**: Green success message with checkmark
- **Email**: Optional — backend auto-generates placeholder if missing

### Desktop Layout
- **`.pd-main-grid`**: `grid-template-columns: 2fr 1fr`, gap 40px (original layout)
- Carousel left, Enquiry right, Content below

### Mobile Layout (<640px)
- Grid becomes single column
- Enquiry pushed to top via `grid-row: 1`
- Accordion collapse for Description, Amenities, Location
- Sticky bottom bar with price + "Enquire Now" button
- Larger touch targets (44px min height)
- Map height reduced to 200px

### Sections Below
- **Property Details**: 3-column grid stats with Lucide icons + DirhamSymbol
- **Location**: Area, Building, Address text + Google Maps iframe (300px height)
- **Amenities**: Flex-wrap row of Badge components with emoji icons
- **Description**: Full text with paragraph splitting on `\n`

---

## Step 4: DateRangePicker

### File: `frontend/src/components/DateRangePicker.jsx`

**Features**:
- Single month grid view
- Prev/next month arrows (no year/month dropdown)
- Day headers (Su–Sa)
- Disabled past dates (greyed out, not clickable)
- Selection logic: first click = check-in, second click = check-out (if after), click before check-in resets
- Visual: selected dates = red bg white text, range = light red bg
- Date summary row at bottom: "Check-in: YYYY-MM-DD — Check-out: YYYY-MM-DD"
- Inline (no popover/dropdown), part of the enquiry card

---

## Step 5: Layout Refinements

### Changed to `.pd-top-row` (70/30)
- **Why**: Replaced `pd-main-grid` 2-col layout with cleaner `.pd-top-row` + `.pd-content-below` (later simplified)
- **Grid**: `7fr 3fr` — carousel gets 70%, enquiry gets 30%
- **Stats**: Changed from 3-column CSS grid to `display: flex` with `flex: 1` children

### Narrow page wrapper
- Added `.pd-narrow { max-width: 960px; margin-inline: auto; }`
- All content (carousel, enquiry, details, location, amenities, description) constrained to 960px
- Header + sticky bar outside the narrow wrapper

### Sticky bar evolution
1. **Full-width bar**: `position: fixed; left: 0; right: 0; bottom: 0`
2. **Floating with inner constraint**: `position: fixed` + inner `max-width: 960px` div
3. **Floating card**: Removed inner wrapper, added `border-radius: 16px`, glow shadow, ring pulse animation

### Page header compacted
- Reduced from `calc(var(--header-height) + var(--space-16)) var(--space-12)` → `calc(var(--header-height) + var(--space-6)) var(--space-6)`
- Saves ~40px top and ~24px bottom

### Section padding reduced
- Changed from `padding-top: var(--space-16)` (64px) → `padding-top: 24px`

---

## Step 6: Thumbnails Hidden

- Added `.detail-carousel-thumbs { display: none; }` to style block
- Simplified carousel grid to single column: `.detail-carousel { grid-template-columns: 1fr; max-width: none; }`

---

## Step 7: Mobile Sticky Bar Fix

**Problem**: Sticky bar not showing on mobile because `display: 'none'` in inline style had higher priority than `!important` in media queries.

**Fix**: Moved `display: none` from inline style to CSS base rule `.pd-sticky-bar { display: none; }`, letting the `!important` media query override work correctly. Later changed to `display: flex` (always visible on all sizes).

---

## Step 8: Amenities Grid

**Change**: From `display: flex; flex-wrap: wrap` to CSS grid with `grid-template-columns: repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` on mobile.

---

## Step 9: Floating Sticky Bar — Final Design

**Final spec**:
- `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`
- `width: 960px; max-width: calc(100vw - 32px)`
- `border-radius: 16px`
- `background: var(--color-surface)`
- `padding: 12px var(--space-6)`
- `display: flex; justify-content: space-between; align-items: center`
- `box-shadow: 0 8px 32px rgba(227, 30, 36, 0.35), 0 0 60px rgba(227, 30, 36, 0.12)`
- `::before` — gold ring at -4px, `pdRingPulse` animation (2.5s)
- `::after` — gold ring at -10px, `pdRingPulse` animation (2.5s, 0.6s delay)

---

## Step 10: Map URL Validation

**Problem**: Google Maps API error "Invalid 'pb' parameter" when `map_url` is malformed.

**Fix**: Added URL prefix validation:
```jsx
{property.map_url && property.map_url.startsWith('https://www.google.com/maps/embed') && (
  <iframe ... />
)}
```
Invalid URLs silently hide the map section.

---

## Step 11: Git Push

- Added SSH key to GitHub
- Pushed full project (including `node_modules` and `.env`) to `git@github.com:Fakharalimirza/authentichh-website.git`
- **Note**: Pushing `node_modules` and `.env` is not best practice — should add to `.gitignore` in future

---

## Step 12: Obsidian Documentation

Created 10 interconnected markdown files in the project root (Obsidian vault):

| File | Description |
|------|-------------|
| `🏠 Home.md` | Hub page with links to all other notes |
| `Tech Stack.md` | All technologies, libraries, versions |
| `Design System.md` | Color tokens, typography, spacing, shadows, keyframes |
| `Component Library.md` | Button, Card, Badge, PropertyCard, DateRangePicker, etc. |
| `Pages.md` | Route map, PropertyDetails layout (full structural breakdown) |
| `Database.md` | All 8 tables, columns, relationships, seed data |
| `API.md` | All endpoints (public + admin), request/response shapes |
| `Setup & Commands.md` | Dev setup, XAMPP, npm scripts, common issues |
| `Design Decisions.md` | 19 architectural and UX decisions with rationale |
| `Session Log.md` | This file — complete chronological record |

---

## Files Modified This Session

| File | Changes |
|------|---------|
| `backend/.env` | Fixed DB_PASSWORD |
| `backend/controllers/propertyController.js` | Added `images` + `amenities` to all listing endpoints |
| `backend/controllers/enquiryController.js` | Made email optional |
| `frontend/src/components/ui/PropertyCard.jsx` | Full redesign: 16:10, single-img carousel, preview strip, hover effects |
| `frontend/src/components/ui/Skeleton.jsx` | Updated PropertyCardSkeleton |
| `frontend/src/pages/PropertyDetails.jsx` | Multiple passes: layout restructured, sticky bar redesigned, map validation, accordions, mobile |
| `frontend/src/components/DateRangePicker.jsx` | Created from scratch |
| `frontend/src/styles/global.css` | `.detail-carousel` grid, 4:3 main image, 16/9 thumbs, mobile overrides |
| `frontend/src/styles/components.css` | `.pcard-*` styles, `.property-grid`, `.page-header` |
| `database/schema.sql` | Ran to create DB and seed |

---

## Current State (End of Session)

Everything working:
- Backend serves property data with images + amenities arrays
- PropertyCard has premium design with single-img carousel, preview strip, hover effects
- PropertyDetails page has 70/30 carousel/enquiry layout, compact stats, accordions on mobile
- Floating sticky bar with ring pulse glow animation
- Map URL validated before rendering
- 10 Obsidian documentation files created
- GitHub pushed

---

# Session Log — August 3, 2026 (Afternoon)

> Full i18n translation: EN/AR language toggle, all shared components and public pages translated.

### i18n Components Translated

| File | Changes |
|------|---------|
| `src/components/public/PropertyEnquiryCard.jsx` | Added useI18n; translated: title, thank_you, whatsapp, call_us, change, name_label, phone_label, sending, send_enquiry |
| `src/components/shared/PropertyFilters.jsx` | Added useI18n; translated: title, clear_all, location, all_locations, property_type, all_types, bedrooms, any, max_guests, guests, price_range, min, max, apply, mobile toggle |
| `src/components/shared/DateRangePicker.jsx` | Added useI18n with locale-aware DAYS/MONTHS arrays (Arabic: ح/ن/ث/ر/خ/ج/س + Arabic month names); translated check_in/check_out labels |
| `src/components/public/PropertyCarousel.jsx` | Added useI18n; translated all aria-labels: prev_photo, next_photo, grid_view, exit_grid, fullscreen_hint |
| `src/components/public/PropertyMap.jsx` | Added useI18n; translated loading/error status messages |
| `src/components/shared/SearchableSelect.jsx` | Added useI18n; translated search placeholder and no_matches |
| `src/components/public/Reviews.jsx` | Added useI18n; translated heading, tap_more, close aria-label |
| `src/pages/public/Favorites.jsx` | Added useI18n; translated title, heading, subtitle, empty_title, empty_text, browse |
| `src/pages/public/Terms.jsx` | Full rewrite: moved sections array inside component to use t() calls for all 8 legal sections |
| `src/pages/public/Privacy.jsx` | Full rewrite: moved sections array inside component with Li helper for dangerouslySetInnerHTML; translated all 9 privacy sections |
| `src/pages/public/Facilities.jsx` | Full rewrite: allFacilities/categories now built inside component via t(); translated intro, premium, find_stay, all facility names+descriptions |
| `src/pages/public/Areas.jsx` | Added useI18n; translated title, heading, subtitle, load_error, no_areas, coming_soon |
| `src/pages/public/Home.jsx` | Full rewrite via subagent: hero phrases, title, buttons, search form, featured, about, areas, facilities, CTA, contact sections |
| `src/pages/public/About.jsx` | Full rewrite via subagent: CEO greeting, why choose us, team, stats, CTA sections |
| `src/pages/public/Contact.jsx` | Full rewrite via subagent: all form labels, placeholders, consents, success messages, get in touch items |
| `src/pages/public/ListProperty.jsx` | Full rewrite via subagent: hero, stats, comparison table, process steps, commission, form, success screen |
| `src/pages/public/AreaArticle.jsx` | Added useI18n; translated not_found, back_home, explore_badge, breadcrumb, view_apartments |
| `src/pages/public/PropertyDetails.jsx` | Full rewrite via subagent: all stat labels, headings, amenities count, description, related, SEO meta |

### Translation Files Updated

| File | Changes |
|------|---------|
| `src/i18n/en.json` | Added keys for: facilities (all 14 facilities), terms (8 sections), privacy (9 sections), filters (guests, min, max), property_details (area, building, address, meta), area_article, and keys added by subagents for Home/About/Contact/ListProperty |
| `src/i18n/ar.json` | Matching Arabic translations for all new keys above |

### Known Issue
- `ar.json` has one garbled string in `privacy.collect_li_2` containing "tarikh" (Latin text mixed with Arabic). User will review and correct Arabic translations later.

### Build Status
- `npx vite build` passes ✓ (1979 modules, only pre-existing chunk-size warning)

---

# Session Log — August 5–10, 2026

> Units↔Listings split, buildings/communities CRUD, OCR integration, i18n, Swiper carousels, admin panel expansion, obsidian rebuild.

## Units ↔ Listings Data Split

- Created `buildings`, `units`, `landlords`, `communities` tables via migrations
- `units` = operational data (rent, DEWA, internet, building, landlord, community)
- `listings` = guest-facing data (price per night, descriptions, images, amenities)
- `unit_id` FK on `listings` (optional — standalone properties allowed)
- `bedrooms`, `bathrooms`, `parking_spots` added to units (form, table, CSV import)
- `monthly_rent` removed from form/table/CSV (operational only)
- AdminUnits, AdminLandlords, AdminBuildings, AdminCommunities CRUD pages created
- Property wizard: 10→9 steps (DocumentsStep removed), BuildingStep with searchable dropdowns

## OCR Integration (Zero Server Load, $0 Cost)

- **Stack**: OCR.space (free, 25k/mo) + regex (Emirates ID/passport/bills) + Gemini free tier (contracts/title deeds)
- **Backend**: `ocr.js` (pipeline), `ocrController.js` (POST /extract), `routes/ocr.js` (multer + auth)
- **Frontend**: Scan button on AdminLandlords + AdminUnits document cards
- **Review modal**: editable fields, raw text toggle, "Upload & Auto-fill" button
- **Emirates ID fix**: `normalizeText` for multi-line expiry/DOB, original text for single-line name/nationality
- **Passport fix**: MRZ parser outputs given-name-first (`MUHAMMAD BILAL`, not `BILAL MUHAMMAD`)
- **Auth fix**: `requireAuth` → `authenticateToken` (middleware exports `authenticateToken`)
- **ocr_data JSON** column on `unit_documents` (migration applied)
- **Settings**: OCR keys in `settings` table (ocr_space_api_key, gemini_api_key)
- **AdminSettings**: collapsible OCR section for API key config

## Landlord Query Fix

- `getAll` SELECT missing `identity_number`, `date_of_birth`, full bank fields → edit form showed empty values
- Fixed by adding all fields to SELECT

## Document Upload Fix

- `handleUploadDocument` didn't accept/send `expiry_date` → OCR-scanned expiry dates were lost
- Added optional `expiryDate` param, `handleScanConfirm` passes `scanResult.fields.expiry_date`

## AdvancedMarkerElement Migration

- `google.maps.Marker` deprecated → migrated to `google.maps.marker.AdvancedMarkerElement`
- `@googlemaps/markerclusterer` v2.6.2 for clustering
- `BuildingMapSection.jsx` + `BuildingMapTest.jsx` updated

## react-helmet-async Migration

- `react-helmet` UNSAFE_componentWillMount warning → migrated to `react-helmet-async`
- `HelmetProvider` in `main.jsx`, imports in `App.jsx` + 12 public pages

## i18n (EN/AR)

- Full Arabic translation across all pages and components
- `useI18n` hook with `t()` function
- Arabic variants for all display fields (`title_ar`, `location_ar`, etc.)

## Obsidian Knowledge Base Rebuild

- `File Map.md` created (feature → file → function index)
- `Database.md` rewritten (8→16 tables with full column specs)
- `Backend API.md` rewritten (all endpoints including units, buildings, landlords, communities, articles, OCR)
- `Admin Panel.md` rewritten (16 admin routes, 9-step wizard, OCR scanning, settings)
- `Pages.md` rewritten (current App.jsx routes, all admin routes)
- `Tech Stack.md` updated (react-helmet-async, swiper, markerclusterer, multer for docs)
- `Home.md` updated (current file layout with units/buildings/landlords)
- `Units & Listings.md` created (data model, backend, frontend, building map)
- `OCR System.md` created (architecture, regex, Gemini, frontend scanning)

## Files Modified / Added

| File | Change |
|------|--------|
| `database/migration-buildings-units-landlords.sql` | NEW |
| `database/migration-buildings-units-complete.sql` | NEW |
| `database/migration-units-listings-split.sql` | NEW |
| `database/migration-landlord-simplify.sql` | NEW |
| `database/migration-documents.sql` | NEW |
| `database/migration-ocr-data.sql` | NEW |
| `backend/utils/ocr.js` | NEW — OCR pipeline |
| `backend/controllers/ocrController.js` | NEW — POST /extract |
| `backend/routes/ocr.js` | NEW — authenticated multer route |
| `backend/server.js` | OCR route mount, Helmet CSP update |
| `backend/controllers/landlordsController.js` | getAll query fix, uploadDocument expiry_date |
| `backend/controllers/unitsController.js` | NEW — units CRUD + documents |
| `backend/controllers/buildingsController.js` | NEW — buildings CRUD |
| `frontend/src/pages/admin/AdminUnits.jsx` | NEW — units CRUD + OCR scan |
| `frontend/src/pages/admin/AdminLandlords.jsx` | OCR scan button + review modal |
| `frontend/src/pages/admin/AdminBuildings.jsx` | NEW |
| `frontend/src/pages/admin/AdminCommunities.jsx` | NEW |
| `frontend/src/pages/admin/AdminArticles.jsx` | NEW |
| `frontend/src/pages/admin/AdminSettings.jsx` | OCR settings section |
| `frontend/src/pages/admin/AdminPropertyWizard.jsx` | 9-step, unit_id, limit=9999 |
| `frontend/src/pages/admin/wizard/BuildingStep.jsx` | Searchable dropdowns |
| `frontend/src/pages/admin/wizard/DetailsStep.jsx` | DirhamSymbol, parking_spots |
| `frontend/src/components/public/BuildingMapSection.jsx` | AdvancedMarkerElement |
| `frontend/src/main.jsx` | HelmetProvider, BrowserRouter future flags |
| `frontend/src/App.jsx` | Helmet import, future flags |
| `File Map.md` | NEW |
| `Database.md` | Rewritten (16 tables) |
| `Backend API.md` | Rewritten (all endpoints) |
| `Admin Panel.md` | Rewritten (16 routes, wizard, OCR) |
| `Pages.md` | Rewritten (current routes) |
| `Tech Stack.md` | Updated (new deps) |
| `Home.md` | Updated (file layout) |
| `Units & Listings.md` | NEW |
| `OCR System.md` | NEW |

## Current State (End of Session)

- `npx vite build` passes ✓
- All backend syntax checks pass ✓
- OCR tested: Emirates ID, passport, title deed all extract correctly
- 16 MySQL tables, 16 migration files
- Obsidian vault: File Map, Database, Backend API, Admin Panel, Pages, Tech Stack, Home, Units & Listings, OCR System all current
- Explore-first workflow approved but not yet configured

---

# Session Log — August 20, 2026

> OCR reliability fix (bilingual extraction), document_number migration, Obsidian vault wiring.

## What changed

- **Bilingual OCR fallback** (`backend/utils/ocr.js`): OCR.space previously hardcoded `language=eng`, garbling Arabic names (e.g. عزيزي ريفييرا 41 → mojibake). Added `extractBilingualWithOcrSpace` — runs `Promise.allSettled` with eng (mandatory) + ara (best-effort) passes for `title_deed`, `permit`, `contract`, merges best-of. Arabic uses Engine 1 only. `sendToOcrSpace`/`extractWithOcrSpace` take a `language` param.
- **Gemini vision** is primary in Auto mode (model `gemini-3.6-flash`); `_vision_error` captured when vision fails; text slice raised 8000 → 16000 chars for `structureWithGemini`.
- **Permit expiry decision**: DTCM permit expiry = the permit's **`lease_expiry`** ("Date Expiry Lease"). Single expiry field replaces `operator_license_expiry` (raw label still shown in review pills). Sanity swap if `lease_start > lease_expiry`.
- **`rescuePlotNumber`** helper recovers plot numbers OCR misses (e.g. plot 1639 from Azizi Riviera 41).
- **Migration run**: `node backend/run-document-number-migration.js` executed — added `unit_documents.document_number VARCHAR(100)` (idempotent; fixes `Unknown column 'document_number'` on freshly recreated DBs).
- **Method badge** on scan cards: Gemini Vision / OCR.space + Gemini / OCR.space + Regex / Basic (`fields._type`), with ⚠ note when vision fell back.
- **Vault wiring**: `🏠 Home.md` rewritten as the MOC (aliases `Home/Hub/Index` so `[[Home]]` resolves); frontmatter + `### Related` added to every root note; `Component Library.md` updated for `components/ui/` → `components/public/` + shared/admin component inventory; `.obsidian/app.json` excludes node_modules/dist/uploads from indexing.

## Verified

- User test: all 5 docs (EID, passport, title deed, contract, permit) extracted perfectly via Gemini Vision — plot 1639, Azizi Riviera 41 / عزيزي ريفييرا 41, Al Merkadh / المركاض, permit lease expiry 2027-08-07.
- `npx vite build` ✓, `node --check backend/utils/ocr.js` ✓, reviewer passed.
- Note: landlord 235 + unit 279 + listing exist but the 5 uploaded PDFs have no DB rows (upload failed pre-migration) — docs must be re-attached via admin.

---

### Related
- [[master-task-list]], [[TEAM]], [[File Map]], [[🏠 Home]]
