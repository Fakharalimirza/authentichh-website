---
tags: [components, ui, frontend, design-system]
scope: frontend
files: [frontend/src/components/public, frontend/src/components/shared, frontend/src/components/admin]
---

# Component Library

> All reusable UI components. **Public/shared components** live in `frontend/src/components/public/` (exported via `public/index.js`) and `frontend/src/components/shared/`. **Admin components** live in `frontend/src/components/admin/`.
>
> ⚠️ Previously the folder was `components/ui/` — it has moved to `components/public/`.

---

## Button (`Button.jsx`)

```jsx
import { Button } from '../components/public';
```

### Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `variant` | string | `'primary'` | `'primary'`, `'secondary'`, `'ghost'`, `'danger'`, `'accent'` |
| `size` | string | `'md'` | `'sm'`, `'md'`, `'lg'`, `'xl'` |
| `loading` | boolean | `false` | Shows spinner, disables click |
| `disabled` | boolean | `false` | |
| `fullWidth` | boolean | `false` | `width: 100%` via `.btn-full` |
| `icon` | ReactNode | — | Renders before children |
| `className` | string | `''` | Additional classes |
| `type` | string | `'button'` | HTML button type |
| `children` | ReactNode | — | Button label |

### CSS Classes Generated
```
btn btn-primary btn-md
btn btn-secondary btn-sm
btn btn-ghost btn-lg (with btn-full if fullWidth)
```

### Loading State
When `loading=true`, renders a CSS SVG spinner (`<circle>` with stroke-dasharray) + children text next to it.

---

## Card (`Card.jsx`)

```jsx
import { Card } from '../components/public';
```

### Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `variant` | string | `'default'` | `'default'`, `'elevated'`, `'bordered'`, `'flat'` |
| `padding` | boolean | `true` | Adds standard padding |
| `hover` | boolean | `false` | Adds hover lift effect via `.card-hover` |
| `className` | string | `''` | |
| `as` | string | `'div'` | HTML tag override |
| `children` | ReactNode | — | Card content |

### CSS Classes
```
card              → default (no border, no shadow)
card card-elevated → elevated (shadow)
card card-bordered → bordered (border)
card card-flat     → flat (no shadow, subtle border)
```

---

## Badge (`Badge.jsx`)

```jsx
import { Badge } from '../components/public';
```

### Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `variant` | string | `'default'` | `'default'`, `'success'`, `'warning'`, `'error'`, `'info'`, `'accent'`, `'primary'` |
| `size` | string | `'sm'` | `'sm'`, `'md'`, `'lg'` |
| `children` | ReactNode | — | Badge content |
| `className` | string | `''` | |

---

## PropertyCard (`PropertyCard.jsx`)

> File: `frontend/src/components/public/PropertyCard.jsx`

### Props

| Prop | Type | Notes |
|------|------|-------|
| `property` | object | Must include: `title`, `slug`/`id`, `location`, `bedrooms`, `bathrooms`, `max_guests`, `price_per_night`, `images` (array), `cover_image`, `is_featured` |
| `demoImg` | string (optional) | Fallback image URL |

### Features

| Feature | Details |
|---------|---------|
| **Image carousel** | Single `<img>` in DOM — keyed by `currentIndex` for fade-in animation. Arrow buttons (prev/next) visible on hover. Touch swipe support (>40px threshold). |
| **Preview strip** | Shows next 3 images as small clickable thumbnails at the bottom of the image area. |
| **Image counter** | "1 / N" overlay at bottom-right of image area. |
| **Favorite button** | Heart icon top-right, toggles `isFav` state (local only, no persistence). |
| **Featured badge** | "Featured" label top-left when `property.is_featured === 1`. |
| **Hover effects** | Card lifts (`translateY(-4px)`), image scales (`scale(1.05)`), arrows appear. |
| **Skeleton** | `PropertyCardSkeleton` component with matching aspect ratio (16:10). |

### Image Handling
- Uses `property.images` array (from API)
- Falls back to `property.cover_image`
- Falls back to `demoImg` prop
- Final fallback: Unsplash placeholder
- URLs starting with `http` are used as-is, others get `/` prepended (relative uploads)

### Card Layout
```
┌─────────────────────────────────┐
│ [Featured]              [❤️]    │
│                                 │
│          IMAGE (16:10)          │
│   ◀                      ▶      │
│                  · 1 / 5 ·      │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ next │ │ next │ │ next │   │  ← preview strip (3 thumbs)
│  └──────┘ └──────┘ └──────┘   │
├─────────────────────────────────┤
│ 📍 Dubai Marina                 │
│ Luxury Marina View Apartment    │
│ 🛏️ 2 Beds  🛁 2 Baths  👥 4   │
├─────────────────────────────────┤
│ د.إ 850 / night     View →      │
└─────────────────────────────────┘
```

---

## DateRangePicker (`DateRangePicker.jsx`)

> File: `frontend/src/components/DateRangePicker.jsx`

### Props

| Prop | Type | Notes |
|------|------|-------|
| `checkIn` | Date \| null | Currently selected check-in date |
| `checkOut` | Date \| null | Currently selected check-out date |
| `onChange` | function | Called with `{ checkIn, checkOut }` on any date click |

### Behavior
- **Single month grid** with day-of-week headers (Su–Sa)
- **Prev/Next arrows** to change month
- **Disabled past dates** (dates before today are greyed out and not clickable)
- **Selection logic**:
  - No check-in: click sets check-in
  - Has check-in, no check-out: click before check-in → resets check-in; click after check-in → sets check-out
  - Has both dates: click any → resets to new check-in
- **Styling**: Selected dates = red (`--color-primary` bg, white text). Range = light red (`--color-primary-light` bg).
- **Summary row**: Shows "Check-in: YYYY-MM-DD — Check-out: YYYY-MM-DD" at the bottom with a top border separator.

---

## DirhamSymbol (`DirhamSymbol.jsx`)

> UAE Dirham symbol as an inline SVG.

### Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `size` | string | `'1em'` | Sets `height`, width auto-scales |
| `className` | string | `''` | |

The SVG viewBox is `0 0 1000 870` and renders as `display: inline; vertical-align: middle; width: auto`.

---

## Skeleton (`Skeleton.jsx`)

```jsx
import { Skeleton, PropertyCardSkeleton, TableSkeleton } from '../components/public';
```

### Components

| Component | Usage |
|-----------|-------|
| `Skeleton` | Generic rectangular placeholder. Props: `width`, `height` (default 16), `borderRadius` (default 6), `style`, `className`. |
| `PropertyCardSkeleton` | Full property card skeleton with image area (16:10), title, meta rows, price footer. |
| `TableSkeleton` | Admin table skeleton. Props: `rows` (default 5), `cols` (default 6). |

---

## Modal (`Modal.jsx`)

Generic modal component with backdrop overlay. Not currently used in the public pages (used in Admin).

---

## Toast (`Toast.jsx`)

```jsx
import { ToastProvider, useToast } from '../components/public';
```

Context-based toast notification system. `ToastProvider` wraps the app, `useToast()` returns `{ showToast(message, type) }` where type is `'success' | 'error' | 'info'`.

---

## FavoritesContext (`FavoritesContext.jsx`)

> **File**: `frontend/src/context/FavoritesContext.jsx` (not part of the ui/ index)

```jsx
import { FavoritesProvider, useFavorites } from '../../context/FavoritesContext';
```

Context that persists saved property IDs to `localStorage` (`ahf-favorites`, JSON array of numeric IDs). `FavoritesProvider` wraps the app in `main.jsx` (inside Router). Consumed by `PropertyCard` heart, Header badge, MobileMenu, and the `/favorites` page.

### API

| Member | Type | Description |
|--------|------|-------------|
| `favorites` | number[] | Saved property IDs |
| `isFavorite(id)` | boolean | Whether a given ID is saved |
| `toggleFavorite(id)` | void | Add/remove an ID |

---

## Reviews (`Reviews.jsx`)

> File: `frontend/src/components/public/Reviews.jsx`

Google Business Profile / Places reviews carousel.

- **Data**: loads via `useFetch('/api/reviews')` → `{ reviews }` (5-star only, 7-day cached server-side — see [[OCR System]]-adjacent flow in [[Backend API]]).
- **Carousel**: Swiper — `slidesPerView: 1`, `breakpoints: {640: 2, 1024: 3}`, `loop`, `autoplay {delay: 3000, disableOnInteraction: false}`, `centeredSlides`.
- **Expand/close accordion**: review text truncated at 160 chars; "Read more"/"Show less" toggles.
- **States**: skeleton shimmer while loading, empty state if no reviews.
- **Avatar**: proxied through `/api/reviews/avatar?url=`.

---

## PropertyCarousel (`PropertyCarousel.jsx`)

> File: `frontend/src/components/public/PropertyCarousel.jsx`

Hero / property image carousel.

- Swiper `loop` + `autoplay` + `pagination` + `navigation`; `effect` optional fade.
- Props: `images`, `autoplayDelay`, `showPagination`, `showNavigation`.
- Renders from `images` array (fallbacks handled by caller).

---

## BuildingMapSection (`BuildingMapSection.jsx`) & PropertyMap (`PropertyMap.jsx`)

> Files: `frontend/src/components/public/BuildingMapSection.jsx`, `frontend/src/components/public/PropertyMap.jsx`

Google Maps embeds.

- `BuildingMapSection`: full-width map section for a building/area page (`map_url`, `address`, `community` props).
- `PropertyMap`: compact map card for property details.
- Both use `iframe` embeds; map colors are inverted in dark mode via CSS filter (see [[Design System]] §11).

---

## PropertyEnquiryCard (`PropertyEnquiryCard.jsx`)

> File: `frontend/src/components/public/PropertyEnquiryCard.jsx`

Sticky enquiry form card shown on property detail pages. Submits via `POST /api/property-enquiries` (public route). Includes check-in/check-out via `DateRangePicker`, guest count, and WhatsApp fallback link.

---

## Shared Components (`components/shared/`)

| Component | File | Purpose |
|-----------|------|---------|
| `Header` | `Header.jsx` | Responsive header, sticky, mobile hamburger, location dropdown |
| `Footer` | `Footer.jsx` | Footer with WhatsApp SVG icon, link columns |
| `MobileMenu` | `MobileMenu.jsx` | Slide-in mobile nav drawer |
| `SearchableSelect` | `SearchableSelect.jsx` | Searchable dropdown (locations, communities) |
| `DateRangePicker` | `DateRangePicker.jsx` | See section below |
| `ThemeToggle` | `ThemeToggle.jsx` | Dark/light theme toggle (`data-theme="dark"` on `<html>`) |
| `PropertyFilters` | `PropertyFilters.jsx` | Search/filter bar (apartments page) |
| `AdminSidebar` | `AdminSidebar.jsx` | Admin sidebar nav |
| `navData` | `navData.js` | Shared nav link data |

---

## Admin Components (`components/admin/`)

> Full CRUD table toolkit. See [[Admin Panel]] for the pages that consume them.

| Component | Purpose |
|-----------|---------|
| `AdminLayout`, `AdminHeader` | App shell: sidebar + top bar + mobile bottom tab bar |
| `AdminTablePage` | Generic CRUD page: toolbar, search, filters, DataTable, pagination, modals |
| `AdminSearchSelect` | Async searchable select for admin forms |
| `AdminPagination` | Pagination controls |
| `AdminFilterBar` | Filter chips / dropdowns |
| `RowActions` | Row edit/delete button group |
| `ConfirmDialog` | Delete confirmation modal |
| `MobileCardList` / `MobileCard` / `MobileMoreSheet` | Mobile card + action-sheet rendering |
| `IconPicker` | Icon selection for amenity/building types |
| `ResetPasswordModal`, `UserFormModal` | Admin user management modals |
| `TableSkeleton` | Loading skeleton for tables |

---

## Component Index (`index.js`)

Exports (from `frontend/src/components/public/index.js`):
```js
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as Input } from './Input';
export { default as PropertyCard } from './PropertyCard';
export { default as Modal } from './Modal';
export { ToastProvider, useToast } from './Toast';
export { Skeleton, PropertyCardSkeleton, TableSkeleton } from './Skeleton';
```

> Note: `PropertyCarousel`, `Reviews`, `BuildingMapSection`, `PropertyMap`, `PropertyEnquiryCard`, `DirhamSymbol`, `AgentAdminCard` are NOT in the barrel — import them by direct path, e.g. `import Reviews from '../components/public/Reviews'`.

---

### Related
- [[Design System]], [[Pages]], [[Admin Panel]], [[File Map]], [[🏠 Home]]
