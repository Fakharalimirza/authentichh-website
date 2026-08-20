# Styles (`frontend/src/styles/`)

CSS architecture split into public / admin / shared domains.

## Files

| File | Purpose |
|------|---------|
| `tokens.css` | Design tokens: colors, typography, spacing, shadows, z-index, breakpoints. Shared by all. |
| `shared.css` | Shared component styles: Button, Card, Badge, Input, Modal, Toast, Skeleton, Container, Grid, Footer, RTL, Dark Mode, Reduced Motion. Extracted from old `components.css` + `global.css`. |
| `public/public-components.css` | Public-facing reusable components: Page Header, Property Card (`.pcard-*`), Hero, Feature Grid, CTA Section, Listing Layout, Filter Sidebar, Mobile Filters. |
| `public/public-pages.css` | Page-specific styles: About, Property Detail, Facilities, Contact, List Property, Marketing Landing. Extracted from old `global.css`. |
| `admin/admin-components.css` | Admin panel styles: Sidebar, Tables, Cards, Forms, Wizard, Header, Stat Cards, Slide Panel, Filter Bar, Bulk Actions, Icon Picker, Amenity Groups, Admin Login. |
| `admin/admin-mobile.css` | All admin `@media (max-width: 767px)` responsive overrides: Bottom Tab Bar, Mobile Cards, Slide Panel, Modal bottom sheet, Mobile More Sheet, Load More. |

## Import chain

- `main.jsx` → `tokens.css` + `shared.css` + `public/public-components.css` + `public/public-pages.css`
- `AdminLayout.jsx` → `admin/admin.css` (barrel: `@import admin-components.css` + `admin-mobile.css`)
- `AdminLogin.jsx` → `admin/admin.css`

## Breakpoints

| Breakpoint | Target | Used in |
|---|---|---|
| `374px` | Very small phones | `public-pages.css` |
| `639px` | Mobile (public site) | `shared.css`, `public-*.css` |
| `767px` | Mobile (admin panel) | `admin-mobile.css` |
| `1023px` | Tablet | `shared.css`, `public-*.css`, `admin-components.css` |
| `1100px` | Narrow desktop | `public-components.css` |

## Conventions

- Use `var(--color-*)` tokens from `tokens.css` — never hardcoded colors
- RTL: `[dir="rtl"]` ancestor selectors
- Dark mode: `[data-theme="dark"]` ancestor selectors
- `!important` only for overriding third-party or responsive overrides
- New CSS goes in the appropriate domain file, not in a monolithic file
