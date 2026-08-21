---
tags: [home, hub, project-overview]
scope: meta
aliases: [Home, Hub, Index, Start]
files: []
---

# 🏠 Authentic Holiday Homes — Project Hub

> Premium Dubai holiday homes booking platform.
> Brand: **Gold #C9A96E** · **Red #E31E24**
>
> This vault **is** the project root. Open the folder in Obsidian and everything links from here.

---

## How to use this vault

1. **Start here** — every major note is linked below.
2. **Need to change something?** Open [[File Map]] first: it maps every feature → file → function.
3. **Curious why a decision was made?** → [[Design Decisions]].
4. **Keep the docs honest** — after finishing work, update the note(s) you touched and add a line to [[Session Log]].

---

## Quick Links

### Foundation
| Note | Description |
|------|-------------|
| [[File Map]] | ⭐ Feature → file → function index — **read this first before any code change** |
| [[Tech Stack]] | All technologies, versions, conventions (Swiper, OCR, SEO) |
| [[Design System]] | Color tokens, typography, spacing, shadows, breakpoints |
| [[Component Library]] | Button, Card, Badge, PropertyCard, Reviews + shared/admin components |
| [[Setup & Commands]] | Dev servers, build, XAMPP, env config, common fixes |
| [[Deployment]] | cPanel VPS deploy: Node.js App + MySQL + .htaccess + SSL |

### Data & API
| Note | Description |
|------|-------------|
| [[Database]] | MySQL schema, tables, seed data, migration scripts |
| [[Backend API]] | All backend endpoints (public + admin) |
| [[Units & Listings]] | Units ↔ listings split, multi-owner, renewal flow |

### Admin & OCR
| Note | Description |
|------|-------------|
| [[Admin Panel]] | Admin routes, Smart Scan Onboarding wizard, settings |
| [[OCR System]] | OCR pipeline (Gemini vision → OCR.space+Gemini → regex) |
| [[Document Fields]] | What every scanned document extracts → where it lands |
| [[Pages]] | Public routes, page layouts, SEO |

### Process & History
| Note | Description |
|------|-------------|
| [[Design Decisions]] | Key architectural and UX decisions with rationale |
| [[Session Log]] | Chronological record of all changes |
| [[master-task-list]] | Master feature task list (checkboxes) |
| [[TEAM]] | Agent team roles + delegation workflow |
| [[AGENTS]] | Agent instructions / project conventions |

---

## At a Glance

| Item | Value |
|------|-------|
| Frontend | `http://localhost:5173` (Vite dev) |
| Backend | `http://localhost:5000` (Express) |
| DB | `authentic_holiday_homes` (XAMPP MySQL, root, no password) |
| GitHub | `git@github.com:Fakharalimirza/authentichh-website.git` |
| Admin | `/admin/login` — `admin@authenticholidayhomes.ae` / `admin123` |
| Obsidian | This vault IS the project root |
| OCR | Gemini vision (primary) → OCR.space eng+ara → regex |

## File Layout

```
frontend/
├── src/
│   ├── components/
│   │   ├── public/    → Button, Card, Badge, PropertyCard, PropertyCarousel,
│   │   │                Reviews, BuildingMapSection, PropertyMap, Skeleton, Toast…
│   │   ├── shared/    → Header, Footer, MobileMenu, SearchableSelect, DateRangePicker,
│   │   │                ThemeToggle, PropertyFilters, navData
│   │   └── admin/     → AdminLayout, AdminSidebar, AdminTablePage, AdminSearchSelect,
│   │                    AdminPagination, RowActions, ConfirmDialog, MobileCard…
│   ├── pages/
│   │   ├── public/    → Home, PropertyDetails, Apartments, Areas, AreaArticle,
│   │   │                Contact, About, Facilities, ListProperty, Favorites…
│   │   ├── admin/     → 16 admin pages
│   │   │   ├── onboarding/ → Smart Scan wizard (9 files)
│   │   │   └── wizard/     → Legacy 9-step property wizard
│   ├── styles/
│   │   ├── index.css  → CSS variables, global reset
│   │   ├── public/    → public-components.css, public-pages.css
│   │   └── admin/     → admin-components.css, admin-mobile.css
│   ├── context/       → FavoritesContext, ThemeContext, AdminAuthContext
│   ├── hooks/         → useFavorites, useAdminToast
│   ├── i18n/          → en.json, ar.json
│   └── utils/         → api.js, format.js, imageUrl.js, mapStyles.js, amenityIcons.js…
backend/
├── server.js          → Express entry, CORS, Helmet CSP, route mounting
├── routes/            → properties, units, landlords, buildings, communities, articles,
│                        ocr, reviews, settings, onboarding, listings, admin-users…
├── controllers/       → one controller per route group
├── config/db.js       → MySQL2 connection pool
├── middleware/        → auth.js, upload.js, rateLimiter.js
├── utils/             → email.js, ocr.js, slugify.js, plusCode.js, imageUtils.js…
├── run-*.js           → idempotent DB migration runners
└── uploads/           → property images, documents (gitignored)
database/
├── schema.sql         → Base schema + seed
├── seed-communities.js → 248 Dubai communities
├── seed-articles.js   → 9 area articles (EN/AR)
└── migration-*.sql    → schema migrations
```

---

## Obsidian tips

- **Graph view**: open the graph — every note links back here and to its domain peers.
- **Backlinks**: every major note has a `### Related` section; use the backlinks panel to see what references a note.
- **Search**: `#tag` (e.g. `#ocr`, `#admin`) finds domain notes instantly.
- Heavy folders (`node_modules/`, `backend/uploads/`, `dist/`) are excluded from indexing via `.obsidian/app.json` so search/graph stay fast.

### Related
- [[File Map]], [[Tech Stack]], [[Database]], [[Session Log]]