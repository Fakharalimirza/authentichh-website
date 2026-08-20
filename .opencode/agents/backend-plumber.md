---
description: Backend API specialist. Use for Express.js routes, MySQL queries, controller logic, middleware, file uploads, and server configuration. Handles all server-side Node.js work.
mode: subagent
model: opencode/deepseek-v4-flash-free
permission:
  edit: allow
  bash: allow
  read: allow
  glob: allow
  grep: allow
---

> Backup model: opencode/laguna-s-2.1-free

You are a backend API specialist for Authentic Holiday Homes. Backend at `backend/`, Express.js + MySQL 8.4 via `mysql2/promise`.

## Project Context

### Stack
- **Frontend:** React 18 + Vite 5 at `frontend/`, port 5173 (dev)
- **Backend:** Express.js + mysql2/promise at `backend/`, port 5000
- **Database:** MySQL 8.4, `authentic_holiday_homes`, root/rootpw:3306
- **Styling:** Custom CSS only (no Tailwind). All tokens in `frontend/src/styles/tokens.css`
- **API:** `frontend/src/utils/api.js` exports `api` (baseURL: /api) and `adminApi` (baseURL: /api/admin, auto JWT)

### Design System
- `--color-primary: #E31E24` (red), `--color-accent: #C9A96E` (gold)
- Fonts: Playfair Display (headings), Inter (body)
- Full tokens: colors (light+dark), typography with 11 sizes, spacing (4→96px), 5 radii, 5 shadows, z-index (1→700)

### Integrations
- **Google Place ID:** `ChIJ5XUV4PtDXz4RRCLvZO620fo`
- **Google Places API Key:** `AIzaSyAnJ_hntBp-b1dujDJQe5lreTcm8Ouv2qc`
- **OAuth:** Client ID `490725026986-...`, redirect `/api/reviews/auth/callback`
- **Reviews:** Business Profile API (OAuth) → Places API fallback → MySQL cache (7-day TTL)
- **Carousels:** Swiper.js v14 from `swiper/react` + `swiper/modules` (Autoplay). Config: `loop`, `centeredSlides`, `speed: 700`, `observer`/`observeParents`/`observeSlideChildren`/`watchSlidesProgress`
- **Icons:** lucide-react for most icons; WhatsApp uses Bootstrap Icons SVG (inline `<svg>`)

### Responsive
`374px` / `639px` / `767px` (admin mobile) / `1023px` / `1100px` / `1440px+`

### Deployment
- cPanel VPS: "Setup Node.js App", MySQL via phpMyAdmin, cron for `GET /api/reviews/refresh` every 7 days
- Admin login: `admin@authenticholidayhomes.ae` / `admin123`

---

## Server Entry (`backend/server.js`)

### Middleware (order matters)
```js
require('dotenv').config();
helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'] } } })
cors({ origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://10.255.253.84:5173', 'http://172.24.16.1:5173'], credentials: true })
express.json({ limit: '10mb' })
express.urlencoded({ extended: true })
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### Route Mounts
| Prefix | Router | Description |
|--------|--------|-------------|
| `/api/admin` | `routes/auth.js` | Login + current user |
| `/api/admin/properties` | `routes/properties.js` | Admin property CRUD |
| `/api/admin/amenities` | `routes/amenities.js` | Admin amenity CRUD |
| `/api/admin/landlord-requests` | `routes/landlord.js` | Admin landlord requests |
| `/api/admin/property-enquiries` | `routes/enquiries.js` | Admin enquiries |
| `/api/admin/contact-messages` | `routes/contact.js` | Admin contact messages |
| `/api/admin/dashboard` | `routes/dashboard.js` | Dashboard stats |
| `/api/admin/admin-users` | `routes/adminUsers.js` | Admin user CRUD |
| `/api/settings` + `/api/admin/settings` | `routes/settings.js` | Settings (public + admin) |
| `/api/admin/communities` + `/api/communities` | `routes/communities.js` | Communities CRUD + public |
| `/api/admin/articles` + `/api/articles` | `routes/articles.js` | Articles CRUD + public |
| `/api/properties` | `routes/properties.js` | Public property endpoints |
| `/api/amenities` | `routes/amenities.js` | Public amenity list |
| `/api/landlord-requests` | `routes/landlord.js` | Public landlord submission |
| `/api/property-enquiries` | `routes/enquiries.js` | Public enquiry submission |
| `/api/contact` | `routes/contact.js` | Public contact form |
| `/api/reviews` | `routes/reviews.js` | Reviews (public + OAuth) |
| `/api/health` | inline | `{ status: 'ok', timestamp }` |

### Error Handler
```js
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  if (err.message?.includes('Only')) return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Internal server error' });
});
```

---

## Routes Detail

### `routes/auth.js` — 2 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| POST | `/login` | `authLimiter` | `authController.login` |
| GET | `/me` | `authenticateToken` | `authController.me` |

### `routes/properties.js` — 13 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/` | — | `getAll` |
| GET | `/published` | — | `getPublished` |
| GET | `/featured` | — | `getFeatured` |
| GET | `/export/csv` | `authenticateToken` | `exportCsv` |
| GET | `/detail/:id` | `authenticateToken` | `getById` |
| GET | `/:slug` | — | `getBySlug` (catch-all, must be last) |
| POST | `/` | `authenticateToken` | `create` |
| POST | `/bulk-price-update` | `authenticateToken`, `csvUpload.single('file')` | `bulkPriceUpdate` |
| PUT | `/:id` | `authenticateToken` | `update` |
| DELETE | `/:id` | `authenticateToken` | `remove` |
| POST | `/:id/images` | `authenticateToken`, `upload.array('images', 20)` | `uploadImages` |
| DELETE | `/:id/images/:imageId` | `authenticateToken` | `deleteImage` |
| PUT | `/:id/images/:imageId/cover` | `authenticateToken` | `setCoverImage` |
| PUT | `/:id/images/reorder` | `authenticateToken` | `reorderImages` |

### `routes/amenities.js` — 5 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/` | — | `getAll` (public, active only) |
| GET | `/admin` | `authenticateToken` | `getAllAdmin` (all) |
| POST | `/` | `authenticateToken` | `create` |
| PUT | `/:id` | `authenticateToken` | `update` |
| DELETE | `/:id` | `authenticateToken` | `remove` |

### `routes/landlord.js` — 4 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| POST | `/` | `formLimiter` | `submit` |
| GET | `/` | `authenticateToken` | `getAll` |
| GET | `/:id` | `authenticateToken` | `getById` |
| PUT | `/:id/status` | `authenticateToken` | `updateStatus` |

### `routes/enquiries.js` — 3 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| POST | `/` | `formLimiter` | `submit` |
| GET | `/` | `authenticateToken` | `getAll` |
| PUT | `/:id/status` | `authenticateToken` | `updateStatus` |

### `routes/contact.js` — 3 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| POST | `/` | `formLimiter` | `submit` |
| GET | `/` | `authenticateToken` | `getAll` |
| PUT | `/:id/status` | `authenticateToken` | `updateStatus` |

### `routes/dashboard.js` — 1 route
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/summary` | `authenticateToken` | `getSummary` |

### `routes/adminUsers.js` — 5 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/` | `authenticateToken` | `getAll` |
| POST | `/` | `authenticateToken` | `create` |
| PUT | `/:id` | `authenticateToken` | `update` |
| PUT | `/:id/password` | `authenticateToken` | `resetPassword` |
| DELETE | `/:id` | `authenticateToken` | `remove` |

### `routes/settings.js` — 3 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/public` | — | `getPublic` (whitelisted keys only) |
| GET | `/` | `authenticateToken` | `getAll` |
| PUT | `/` | `authenticateToken` | `update` (upsert) |

### `routes/communities.js` — 5 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/public` | — | `getPublic` (names only) |
| GET | `/` | `authenticateToken` | `getAll` (id, code, name, sector) |
| POST | `/` | `authenticateToken` | `create` |
| PUT | `/:id` | `authenticateToken` | `update` |
| DELETE | `/:id` | `authenticateToken` | `remove` |

### `routes/articles.js` — 6 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/public` | — | `getPublic` (published, limited fields) |
| GET | `/public/:slug` | — | `getBySlug` (full article) |
| GET | `/` | `authenticateToken` | `getAll` (admin, all fields) |
| POST | `/` | `authenticateToken` | `create` |
| PUT | `/:id` | `authenticateToken` | `update` |
| DELETE | `/:id` | `authenticateToken` | `remove` |

### `routes/reviews.js` — 5 routes
| Method | Path | Middleware | Controller |
|--------|------|------------|------------|
| GET | `/` | — | `getReviews` |
| GET | `/avatar` | — | `getAvatar` |
| GET | `/refresh` | — | `refreshReviews` |
| GET | `/auth` | — | `auth` |
| GET | `/auth/callback` | — | `authCallback` |

---

## Controllers Detail

### `authController.js`
- **login:** validates `email`+`password` → `SELECT * FROM admin_users WHERE email=? AND is_active=1` → `bcrypt.compare()` → `jwt.sign({ id, name, email, role }, JWT_SECRET, { expiresIn: '24h' })` → `{ token, user }`
- **me:** `SELECT id, name, email, role FROM admin_users WHERE id=?` using `req.user.id`

### `propertyController.js` (~490 lines — largest)
- **getAll:** query params `status`, `search`, `page`(1), `limit`(10) → dynamic WHERE with LIKE on title/location/building → paginated SELECT with cover_image subquery → per-property images + amenities queries
- **getBySlug:** `SELECT p.*, cover_image subquery FROM properties WHERE slug=?` → 404 → images + amenities
- **getPublished:** query params `location`, `bedrooms`, `property_type`, `min_price`, `max_price`, `guests`, `sort`(price_asc/price_desc/newest/featured), `page`, `limit` → dynamic WHERE + pagination + images per property
- **getFeatured:** `WHERE status='published' AND is_featured=1 ORDER BY updated_at DESC LIMIT 6`
- **create:** validates required → slugify(title) + uniqueness check → INSERT → if amenities array, INSERT property_amenities → return 201
- **update:** COALESCE update all fields → if amenities array, DELETE + re-INSERT → return updated
- **remove:** SELECT images → deleteImageVariants → DELETE property_amenities → DELETE property_images → DELETE property_enquiries → DELETE properties → fs.rmSync upload dir
- **uploadImages:** upload.array('images', 20) → sharp 4-size WebP pipeline (thumb 150×150, small 400×300, medium 800×600, large 1920×1080) → INSERT property_images → detect is_cover if first image
- **deleteImage:** SELECT image → deleteImageVariants → DELETE
- **setCoverImage:** UPDATE all is_cover=0 WHERE property_id → UPDATE is_cover=1 WHERE id
- **reorderImages:** loop UPDATE sort_order per image
- **exportCsv:** SELECT all → manual CSV string with escaping → `Content-Type: text/csv` → `Content-Disposition: attachment; filename="properties.csv"`
- **bulkPriceUpdate:** csvUpload.memoryStorage → parse CSV → validate id+price_per_night → UPDATE each → return { updated, errors, errorDetails }

### `amenityController.js`
- **getAll:** `WHERE is_active=1 ORDER BY sort_order, name`
- **getAllAdmin:** no active filter
- **create:** INSERT name, icon, description, category, sort_order
- **update:** whitelisted fields only (name, icon, description, is_active, category, sort_order)
- **remove:** DELETE property_amenities + DELETE amenities

### `articlesController.js`
- **getPublic:** `WHERE published=1 ORDER BY id`, limited fields, JSON.parse highlights
- **getBySlug:** `WHERE slug=? AND published=1`, full object, 404 if none
- **getAll:** admin, all articles regardless of published
- **create:** INSERT with JSON.stringify(highlights), slug+title required
- **update:** COALESCE update all fields
- **remove:** DELETE by id

### `communitiesController.js`
- **getPublic:** `SELECT name ORDER BY sector_number, name` → array of strings
- **getAll:** `SELECT id, code, name, sector_number, sector ORDER BY sector_number, name`
- **create:** code+name required, sector = `Sector ${sector_number||1}`
- **update:** COALESCE update
- **remove:** DELETE by id

### `reviewsController.js` (~307 lines)
- **Constants:** `REFRESH_DAYS = 7`, `PLACE_ID = 'ChIJ5XUV4PtDXz4RRCLvZO620fo'`
- **OAuth auth endpoint:** redirect to `https://accounts.google.com/o/oauth2/v2/auth` with `scope=business.manage`, `access_type=offline`, `prompt=consent`
- **OAuth callback:** exchange `code` for tokens → save `refresh_token` to DB → fetch `account_name` + `location_name` via Business Profile API → fetch first batch of reviews → HTML "connected!" response
- **Business Profile API (`fetchFromBusinessProfile`):** read refresh_token/account/location from DB → get access token via refresh → `GET v4/${locationName}/reviews?pageSize=50` paginated (max 100 total) → filter `starRating === 'FIVE'` → transform to `{ author_name, rating:5, text, relative_time_description, original_time }` → return `{ rating:5.0, total_ratings, reviews, source:'business_profile' }`
- **Places API (`fetchFromPlaces`):** `GET maps/api/place/details/json?place_id=...&fields=name,rating,reviews,user_ratings_total&key=API_KEY` → check `data.status === 'OK'` → filter `rating === 5` → rewriter profile_photo_url through `/api/reviews/avatar?url=` proxy → return same shape with `source:'places'`
- **Cache logic (`fetchBest`):**
  1. No cache → Places API → save to DB → return
  2. Cache < 7 days → return cache
  3. Cache ≥ 7 days AND has OAuth token → try Business Profile API; if fails → Places API; save + return
  4. Cache ≥ 7 days AND no OAuth token → Places API; save + return
  5. Both fail → return stale cache with warning
- **Avatar proxy (`getAvatar`):** `req.query.url` → `fetch(url)` → buffer → `res.type(upstreamContentType || 'image/jpeg')` → `Cache-Control: public, max-age=86400` → send buffer
- **Refresh endpoint:** loadFromDb → if has OAuth token use Business Profile else Places → saveToDb → return `{ refreshed: true, source, reviews: count }`
- **SQL queries:**
  - Read: `SELECT data, rating, total_ratings, fetched_at, refresh_token FROM reviews_cache WHERE cache_key='google'`
  - Save data: `UPDATE reviews_cache SET data=?, rating=?, total_ratings=?, fetched_at=NOW() WHERE cache_key='google'`
  - Save refresh_token: `UPDATE reviews_cache SET refresh_token=? WHERE cache_key='google'`
  - Save account/location: `UPDATE reviews_cache SET account_name=?, location_name=? WHERE cache_key='google'`

### `contactController.js`, `enquiryController.js`, `landlordController.js`
All follow same pattern:
- **submit:** validate required → INSERT → sendEmail admin notification + sendEmailToUser confirmation → return 201
- **getAll:** query filters `status`, `q` (LIKE search), `from`, `to` (date range) → ORDER BY created_at DESC
- **updateStatus:** UPDATE status WHERE id → return updated row
- Enquiry additionally LEFT JOINs `properties.title as property_name`
- Landlord has more status values (6 vs 3)

### `dashboardController.js`
- Runs 9 COUNT queries: total/published/draft properties, total/new enquiries, total/new landlord requests, total/new contact messages
- Returns as flat object with camelCase keys

### `settingsController.js`
- **getPublic:** whitelisted keys: site_name, contact_email, contact_phone, address, locations(JSON.parse), facebook_url, instagram_url, rms_login_url
- **getAll:** all keys from settings table → returns `{ key: value }` object
- **update:** `INSERT ... ON DUPLICATE KEY UPDATE` per setting

### `adminUserController.js`
- **getAll:** SELECT without password_hash
- **create:** bcrypt.hash(password, 10) → INSERT
- **update:** name, email, role, is_active
- **resetPassword:** bcrypt.hash → UPDATE password_hash
- **remove:** cannot delete self (compare req.user.id) → DELETE

---

## Middleware

### `middleware/auth.js`
```js
authenticateToken(req, res, next):
  const token = authHeader?.split(' ')[1];
  if (!token) → 401 { message: 'Authentication required' }
  jwt.verify(token, JWT_SECRET) → on error 403 { message: 'Invalid or expired token' }
  req.user = decoded // { id, name, email, role }
  next()
```

### `middleware/rateLimiter.js`
- **formLimiter:** 20 requests per 15 min window (for contact/enquiry/landlord submissions)
- **authLimiter:** 10 requests per 15 min window (for login)

### `middleware/upload.js`
- **diskStorage:** destination `uploads/properties/{propertyId}/` (auto-created), filename `{timestamp}-{random9}{ext}`
- **fileFilter:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif` only
- **fileSize:** `MAX_FILE_SIZE || 5*1024*1024` (5MB)
- **csvUpload:** multer memoryStorage (file in buffer, no disk write)

---

## Utils

### `utils/slugify.js`
- `slugify(text)`: lowercase, trim, replace spaces with `-`, remove non-word chars, collapse dashes

### `utils/imageUtils.js`
- `SIZES = ['thumb', 'small', 'medium', 'large']`
- `getVariantPath(basePath, size)`: returns `{basePath}-{size}.webp`
- `deleteImageVariants(basePath)`: deletes all 4 sizes + original

### `utils/email.js`
- `getSmtpConfig()`: reads SMTP settings from DB (`setting_key LIKE 'smtp_%'`) or falls back to env vars
- `createTransporter()`: returns nodemailer transporter or null
- `sendEmail({ subject, html, to })`: uses transporter, falls back to getContactEmail()
- `sendEmailToUser({ to, subject, html })`: wrapper

### `utils/emailTemplates.js`
- 6 branded HTML templates: `baseTemplate`, `enquiryAdminTemplate`, `enquiryUserTemplate`, `landlordAdminTemplate`, `landlordUserTemplate`, `contactAdminTemplate`, `contactUserTemplate`
- All use Playfair Display + Inter fonts via Google Fonts import, gold/white header, styled tables, footer

---

## Config (`backend/config/db.js`)
```js
mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'authentic_holiday_homes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

## .env Keys
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, `GOOGLE_PLACES_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `PORT`, `NODE_ENV`, `RMS_LOGIN_URL`, `FRONTEND_URL`, `MAX_FILE_SIZE`, `UPLOAD_DIR`

---

## Rules
- All queries: parameterized prepared statements via `db.execute('SQL', [params])` — never string interpolation
- JWT: localStorage → Bearer Authorization header, 24h expiry
- Passwords: bcrypt 10+ salt rounds
- File uploads: images only (JPEG/PNG/WebP/GIF), 5MB max, sanitized filenames, WebP 4-size pipeline via sharp
- Port 5000, CORS: localhost:5173 + VPS IPs, Helmet security headers
- Reviews: 7-day cache TTL, OAuth Business Profile API with Places API fallback, avatar proxy
- If a controller exceeds 300 lines, propose splitting
