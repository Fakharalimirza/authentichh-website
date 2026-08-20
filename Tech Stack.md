---
tags: [tech-stack, dependencies, infrastructure]
scope: infrastructure
files: ["frontend/package.json", "backend/package.json"]
---

# Tech Stack

> Full technology inventory for Authentic Holiday Homes.

---

## Frontend

### Core
| Library | Version | Notes |
|---------|---------|-------|
| React | ^18.3.1 | Functional components, hooks |
| React DOM | ^18.3.1 | Client-side rendering |
| React Router | ^6.26.2 | Client-side routing, future flags enabled |
| react-helmet-async | ^2.0.5 | Dynamic `<head>` meta/OG/JSON-LD |
| Vite | ^5.4.3 | Build tool and dev server |
| @vitejs/plugin-react | ^4.3.1 | Vite React plugin (fast refresh) |

### Dependencies
| Library | Version | Notes |
|---------|---------|-------|
| axios | ^1.7.7 | HTTP client for API calls |
| lucide-react | ^1.25.0 | Icon library |
| swiper | ^11.2.1 | Carousel for reviews, featured, related |
| @googlemaps/markerclusterer | ^2.6.2 | Building map clustering |
| react-datepicker | ^7.6.0 | DateRangePicker calendar |

### Dev Dependencies
| Library | Version | Notes |
|---------|---------|-------|
| vite | ^5.4.3 | Build tool |

### Design Conventions
- CSS custom properties (no Tailwind)
- BEM-like naming (`.btn`, `.btn-primary`, `.card`, `.card-elevated`)
- RTL via logical properties (`margin-inline`, `inset-inline-start`)
- Dark mode: `[data-theme="dark"]` on `<html>`
- Responsive: 374px, 639px, 767px, 1023px, 1100px, 1440px+
- Swiper.js v14: `centeredSlides`, `slideToClickedSlide`, `isActive` render prop

---

## Backend

### Core
| Library | Version | Notes |
|---------|---------|-------|
| Node.js | 22.x | Native FormData + fetch |
| Express | ^4.21.0 | Web framework |
| MySQL2 | ^3.11.0 | Database driver (promise pool) |

### Middleware
| Library | Version | Notes |
|---------|---------|-------|
| cors | ^2.8.5 | Cross-origin (allows :5173, LAN) |
| helmet | ^7.1.0 | Security headers (CSP whitelists lh3.googleusercontent.com) |
| express-rate-limit | ^7.4.0 | Rate limiting (formLimiter: 20/15min, authLimiter: 10/15min) |
| multer | ^1.4.5-lts.1 | File uploads (images: 5MB, documents: 10MB) |

### Auth & Security
| Library | Version | Notes |
|---------|---------|-------|
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT for admin auth |
| dotenv | ^16.4.5 | Environment variables |

### Other
| Library | Version | Notes |
|---------|---------|-------|
| nodemailer | ^6.9.15 | Email notifications (DB-driven SMTP) |
| csv-parser | ^3.0.0 | Bulk property import |
| sharp | ^0.33.5 | Image processing |
| open-location-code | ^1.1.1 | Plus code generation |

### Key Backend Files
- `backend/server.js` — Express entry, CORS, Helmet CSP, route mounting
- `backend/config/db.js` — MySQL2 pool (host: localhost, port: 3306, user: root, no password)
- `backend/middleware/auth.js` — `authenticateToken` (JWT verify)
- `backend/middleware/upload.js` — multer config (images + documents)
- `backend/middleware/rateLimiter.js` — `formLimiter`, `authLimiter`
- `backend/utils/email.js` — Nodemailer (DB-driven SMTP config)
- `backend/utils/emailTemplates.js` — 6 branded HTML templates
- `backend/utils/ocr.js` — OCR pipeline (OCR.space + regex + Gemini)
- `backend/utils/slugify.js` — URL slug generation

---

## Database

| Item | Value |
|------|-------|
| System | XAMPP MySQL (local) / cPanel MySQL (production) |
| Host | localhost (127.0.0.1) |
| Port | 3306 |
| User | root |
| Password | (empty for XAMPP) |
| Database | authentic_holiday_homes |
| Tables | 16 (see [[Database]]) |
| Driver | mysql2/promise with connection pool |

---

## Infrastructure

| Service | Details |
|---------|---------|
| XAMPP | Apache + MySQL (local dev) |
| Git | GitHub at `git@github.com:Fakharalimirza/authentichh-website.git` |
| Obsidian | Project root opened as vault |
| OCR.space | Free tier (25k req/month) — raw text extraction |
| Google Gemini | Free tier (15 rpm, 1M tokens/day) — complex doc structuring |

### Related
- [[File Map]], [[Database]], [[Setup & Commands]], [[🏠 Home]]
