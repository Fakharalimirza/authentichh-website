---
tags: [decisions, architecture, ux, rationale]
scope: meta
files: []
---

# Design Decisions

> Key architectural and UX decisions made during development.

---

## 1. Single `<img>` Carousel (PropertyCard)

**Decision**: Use a single `<img>` element keyed by `currentIndex` instead of rendering all images and showing/hiding them.

**Why**:
- Reduces DOM nodes (important for listing pages with many cards)
- CSS `@keyframes pcardFadeIn` triggers naturally on each React re-mount (when `key` changes)
- Better memory usage — only one image in the DOM per card at a time

**Trade-off**: Each navigation triggers a network request for the new image. Mitigated by preloading the next image via `useEffect`:
```javascript
const nextIdx = getNextIndex(currentIndex, images.length);
const img = new Image();
img.src = images[nextIdx];
```

---

## 2. Preview Strip (Card Thumbnails)

**Decision**: Show next 3 images as small clickable thumbnails at the bottom of the card image area.

**Why**: Gives users a quick preview of upcoming images without navigating. Improves engagement and reduces friction — users can jump directly to any of the next 3 images.

**Implementation**: Builds `previewImages` array by iterating forward from `currentIndex + 1`, wrapping around, taking up to `PREVIEW_COUNT` (3) items.

---

## 3. Enquiry Flow — No Gate Button

**Decision**: Calendar is always visible when no dates are selected. No "Check Availability" button is needed.

**Why**: Reduces friction — the user sees immediately that they can select dates. The old flow had a gate button ("Check Availability") → click → calendar appears. Removing this step improves conversion.

**Implementation**: `showCalendar` defaults to `true` and the ternary in the enquiry card renders:
- Form if dates are selected
- Calendar if no dates (always, since `showCalendar` is `true`)

---

## 4. Desktop Layout — 70/30 Split

**Decision**: Carousel takes 70%, Enquiry card takes 30% of the top row.

**Why**: The carousel is the primary visual element and needs space to showcase the property. The enquiry card at 30% (≈288px at 960px container) is sufficient for the form and calendar.

**Implementation**: `grid-template-columns: 7fr 3fr` inside `.pd-top-row`.

**Evolution**: Originally used `1fr 380px` (fixed-width enquiry), which made the carousel shrink on smaller desktops. Changed to proportional `7fr 3fr`.

---

## 5. Narrow Page Wrapper (960px)

**Decision**: All Property Details content constrained to 960px max-width, centered.

**Why**: 1320px (the global container max-width) is too wide for a detail page with dense content. Reading and scanning benefit from narrower line lengths.

**Implementation**: `.pd-narrow { max-width: 960px; margin-inline: auto; }` wraps everything below the page header.

---

## 6. Floating Sticky Bar

**Decision**: Instead of a full-width bottom bar, use a rounded floating card with glow and ring pulse animations.

**Why**: Full-width bars feel aggressive and "salesy". A floating card with rounded corners and subtle glow is more premium and luxury-brand appropriate. The ring pulse animation draws attention without being intrusive.

**Implementation**:
- `position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%)`
- `border-radius: 16px`
- Red glow: `box-shadow: 0 8px 32px rgba(227, 30, 36, 0.35)`
- `::before` and `::after` pseudo-elements with gold accent rings pulsing outward via `pdRingPulse` animation

**Evolution**: Started as full-width bar → floating bar with same width (960px) → energy glow effect added.

---

## 7. Mobile Accordions

**Decision**: Location, Amenities, and Description collapse into accordions on mobile (<640px).

**Why**: Mobile viewports are limited. Accordions let users choose what to read, reducing scroll length. On desktop, all sections are always visible (accordion bodies forced `display: block`).

**Implementation**:
- CSS: `@media (max-width: 639px) { .pd-accordion-body { display: none; } .pd-accordion-body--open { display: block; } }`
- `@media (min-width: 640px) { .pd-accordion-body { display: block !important; } .pd-accordion-chevron { display: none; } }`
- State: `expanded` object with keys `location`, `amenities`, `description`

---

## 8. Thumbnails Hidden

**Decision**: The carousel thumbnail strip (right column on desktop, horizontal row on mobile) is hidden via `display: none`.

**Why**: User requested removal. The thumbnails took up space and added visual clutter. The counter (1/5) and arrows provide sufficient navigation context.

**Implementation**: `.detail-carousel-thumbs { display: none; }`. The grid column layout was also simplified: `.detail-carousel { grid-template-columns: 1fr; max-width: none; }` to let the main image fill the full width.

---

## 9. Compact Stats Cards

**Decision**: Property Details stat cards are compact with reduced padding, smaller icons, and tighter spacing.

**Why**: Originally the cards were large (padding: `var(--space-3)`, icons: 20px) making the row feel bulky. Compact cards fit more naturally in the 960px narrow layout.

**Final values**:
- Padding: `var(--space-2) var(--space-1)` (8px 4px)
- Icon size: 16px
- Value font: 12px bold
- Label font: 10px
- Gap: 8px (flex gap)

---

## 10. Amenities Grid

**Decision**: Amenities displayed in a 4-column grid on desktop, 2-column on mobile.

**Why**: A grid gives a clean, organized look compared to flex-wrap. 4 columns fit well at 960px width.

**Implementation**: `<div className="pd-amenities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>`. Mobile override: `.pd-amenities-grid { grid-template-columns: repeat(2, 1fr) !important; }`.

---

## 11. Email Optional in Enquiries

**Decision**: Email field is not required in the public enquiry form. If omitted, the backend generates a placeholder email.

**Why**: Reduces form friction. Many users are hesitant to share email but willing to share phone. The placeholder email ensures database integrity (column is `NOT NULL`).

**Implementation** (backend `enquiryController.js`):
```javascript
const enquiryEmail = email || `guest-${phone.replace(/\D/g, '').slice(-6)}@inquiry.ae`;
```

---

## 12. Map URL Validation

**Decision**: The map iframe only renders if `map_url` starts with `https://www.google.com/maps/embed`.

**Why**: Invalid map URLs cause Google Maps API errors (e.g., "Invalid 'pb' parameter") that show as broken iframes or error messages to users. Silently hiding invalid URLs is better UX than showing errors.

**Implementation**:
```jsx
{property.map_url && property.map_url.startsWith('https://www.google.com/maps/embed') && (
  <iframe src={property.map_url} ... />
)}
```

---

## 13. Page Header Compacted

**Decision**: Reduced header height from 136px top / 48px bottom padding to 96px / 24px.

**Why**: The original header was too tall, wasting vertical space and pushing content down unnecessarily.

**Implementation**: `style={{ paddingBlock: 'calc(var(--header-height) + var(--space-6)) var(--space-6)' }}`.

---

## 14. Section Padding Reduced

**Decision**: Reduced top padding of the `.section` from 64px to 24px.

**Why**: To minimize the gap between the page header and the main content (carousel), creating a tighter, more cohesive layout.

---

## 15. Sticky Bar Placement

**Decision**: Floating sticky bar has 400px gap between price and button (historically) → changed to `justify-content: space-between` (natural spacing).

**Why**: Initially used `gap: 400px` to push items to edges in a full-width bar. When the bar became floating at 960px, `space-between` achieved the same effect more naturally.

---

## 16. RTL Support

**Decision**: All CSS uses logical properties (`margin-inline`, `inset-inline-start`, `padding-inline`, etc.) where applicable.

**Why**: Enables future Arabic (RTL) support by simply adding `dir="rtl"` to the `<html>` element. The layout adapts automatically without any code changes.

---

## 17. Dark Mode

**Decision**: Full dark mode via `data-theme="dark"` attribute on `<html>`.

**Why**: User preference and accessibility. All color tokens have dark variants. The CSS is already set up — toggling the attribute flips the entire UI.

---

## 18. No Global State Library

**Decision**: Use React's built-in state management (useState, useEffect, useCallback, useRef) instead of Redux, Zustand, or Context.

**Why**: The app's state is simple and page-local. No global state is shared across disparate pages. Admin auth uses localStorage directly. Adding a state library would be over-engineering.

---

## 19. Image Handling — Mixed URLs

**Decision**: Image URLs can be either absolute (Unsplash) or relative (server uploads). The `getImageUrl`/`imgUrl` helpers detect and handle both.

**Why**: Development uses Unsplash for demo images; production uses uploaded images. The helper function checks if the URL starts with `http` to decide:
```javascript
url.startsWith('http') ? url : `/${url}`;
```

---

## 20. Units ↔ Listings Data Split

**Decision**: Separate `units` (operational) and `listings` (guest-facing) tables with optional `unit_id` FK.

**Why**: Units hold landlord-facing operational data (rent, DEWA, internet, bank details). Listings hold guest-facing marketing data (price per night, descriptions, images). Splitting them keeps each table focused and avoids cluttering the listing with ops data.

**Trade-off**: Data duplication (title, bedrooms, etc. exist on both tables). Acceptable because units are the source of truth for operational data, and listings can be edited independently for marketing.

---

## 21. OCR — Scan on Demand (Not Auto-Upload)

**Decision**: Scan button per document card instead of automatic OCR on upload.

**Why**: OCR calls external APIs (OCR.space, Gemini). Auto-scanning every upload would waste API quota on re-uploads, fail silently on bad scans, and slow down the upload flow. Scan-on-demand lets admins verify the scan result in a review modal before saving.

---

## 22. OCR — Three-Layer Pipeline

**Decision**: OCR.space (raw text) → regex (structured docs) → Gemini (complex free-form).

**Why**: OCR.space is free and fast but returns raw text. Regex handles known formats (Emirates ID, passport MRZ, bills) instantly and for free. Gemini free tier handles complex unstructured docs (contracts, title deeds) where regex can't parse the layout. This gives maximum coverage at $0 cost.

---

## 23. Passport Name Order — Given Name First

**Decision**: MRZ parser outputs `[given_name, surname]` instead of `[surname, given_name]`.

**Why**: ICAO MRZ format puts surname after given names in the `name` field. The original parser treated the first token as surname, producing "BILAL MUHAMMAD" instead of "MUHAMMAD BILAL". Swapping the order matches how the user expects names displayed.

---

## 24. Building Map with Clustering

**Decision**: Use `google.maps.marker.AdvancedMarkerElement` + `@googlemaps/markerclusterer` for the homepage building map.

**Why**: `google.maps.Marker` is deprecated. AdvancedMarkerElement is the replacement. MarkerClusterer handles dense markers (248 communities) without overlapping, improving usability on the homepage map.

---

## 25. 9-Step Wizard (Not 10)

**Decision**: Removed DocumentsStep from the property creation wizard.

**Why**: Documents are now managed at the unit/landlord level (AdminUnits, AdminLandlords) with OCR scanning. Including them in the property wizard created confusion about where documents live. Properties link to units via `unit_id`, and documents belong to units/landlords.

### Related
- [[File Map]], [[Units & Listings]], [[OCR System]]
