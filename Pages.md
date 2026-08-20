---
tags: [pages, routes, layout, frontend]
scope: frontend
files: ["frontend/src/App.jsx", "frontend/src/pages/public/", "frontend/src/pages/admin/", "frontend/src/components/public/", "frontend/src/components/shared/"]
---

# Pages

> All routes and page layouts. Defined in `frontend/src/App.jsx`.

---

## Route Map

### Public Routes (wrapped in `PublicLayout` — Header + Footer)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home.jsx | Hero, search, featured, about, areas, facilities, CTA, contact |
| `/apartments` | Apartments.jsx | Property listing grid, filter sidebar/drawer, sort |
| `/apartments/:slug` | PropertyDetails.jsx | Carousel + enquiry + sections + sticky bar |
| `/favorites` | Favorites.jsx | Saved properties (localStorage) |
| `/areas` | Areas.jsx | Area guides index |
| `/areas/:slug` | AreaArticle.jsx | Dynamic article page (breadcrumb, sidebar, FAQ, JSON-LD) |
| `/about` | About.jsx | About us page |
| `/facilities` | Facilities.jsx | Full amenities list |
| `/list-your-property` | ListProperty.jsx | Landlord submission form |
| `/contact` | Contact.jsx | Contact form + map + reviews |
| `/terms` | Terms.jsx | Terms & conditions |
| `/privacy` | Privacy.jsx | Privacy policy |

### Admin Routes (no Header/Footer)

| Path | Component | Description |
|------|-----------|-------------|
| `/admin/login` | AdminLogin | Login form |
| `/admin` | AdminDashboard | Stats cards, quick actions |
| `/admin/properties` | AdminProperties | Properties CRUD list |
| `/admin/properties/new` | AdminPropertyWizard | 9-step creation wizard |
| `/admin/properties/edit/:id` | AdminPropertyWizard | Edit existing |
| `/admin/units` | AdminUnits | Units CRUD, bulk import, doc upload |
| `/admin/smart-scan` | AdminOnboarding | Smart Scan Onboarding — 6-step wizard (Scan → Landlord → Building → Unit → Agreement & Permit → Review & Save): background scan queue, drag-drop value fill, dedupe-first resolve, renewal, multi-owner, resolve-only preview |
| `/admin/landlords` | AdminLandlords | Landlords CRUD, doc upload |
| `/admin/buildings` | AdminBuildings | Buildings CRUD |
| `/admin/communities` | AdminCommunities | Communities CRUD (248 areas) |
| `/admin/articles` | AdminArticles | Area articles CRUD (EN/AR) |
| `/admin/landlord-requests` | AdminLandlordRequests | Table + slide-panel |
| `/admin/enquiries` | AdminEnquiries | Table + status actions |
| `/admin/contact-messages` | AdminContactMessages | Table + slide-panel |
| `/admin/amenities` | AdminAmenities | CRUD with toggle |
| `/admin/admins` | AdminUsers | Admin user management |
| `/admin/settings` | AdminSettings | Site settings + OCR keys |

---

## PropertyDetails Page

> Most complex public page. See [[Design Decisions]] for rationale.

### Layout (Desktop, 960px narrow)

- **Carousel**: single-main-picture with auto-play (4s), arrows, counter, dots, swipe. Old mosaic removed.
- **Top row**: `.pd-top-row` grid (7fr/3fr) — carousel left, enquiry card right
- **Stats row**: Type, Bed, Bath, Parking, Guests, Size
- **Accordions**: Location (always expanded desktop), Amenities (4-col → 2-col), Description (collapsed mobile)
- **You May Also Like**: Swiper carousel, `.slice(0, 6)`, responsive 1.15/2/3
- **Sticky bar**: Hidden until enquiry card scrolls out of view

### Mobile (<640px)
- Single column, enquiry above carousel
- Accordions collapsed by default
- Stats wrap to 2-col grid
- Sticky bar: `max-width: calc(100vw - 32px)`

### Key Components Used
- `PropertyCarousel.jsx` — Swiper-based image carousel
- `PropertyEnquiryCard.jsx` — DateRangePicker + form + WhatsApp/Call
- `PropertyMap.jsx` — Google Maps iframe (validated URL)
- `Reviews.jsx` — Google Reviews Swiper carousel

---

## Home Page

> Landing page with 10 sections: hero (image rotation), search form, featured properties (Swiper), about, areas, facilities grid, CTA, contact cards, reviews (Swiper), footer.

### Key Components Used
- `BuildingMapSection.jsx` — Clustered Google Maps with property cards (AdvancedMarkerElement + MarkerClusterer)
- `Reviews.jsx` — Google Reviews carousel
- `SearchableSelect.jsx` — Location autocomplete in search form

### Related
- [[File Map]], [[Admin Panel]], [[Component Library]], [[Design Decisions]], [[🏠 Home]]
