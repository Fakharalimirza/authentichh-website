---
tags: [api, backend, endpoints, routes]
scope: backend
files: ["backend/server.js", "backend/routes/", "backend/controllers/", "backend/middleware/auth.js", "backend/middleware/rateLimiter.js"]
---

# Backend API

> All backend API endpoints. Base URL: `http://localhost:5000`.

---

## Route Mapping (server.js)

```
/api/properties          → propertyRoutes (public)
/api/amenities           → amenityRoutes (public)
/api/landlord-requests   → landlordRoutes (public)
/api/property-enquiries  → enquiryRoutes (public)
/api/contact             → contactRoutes (public)
/api/reviews             → reviewsRoutes (public)
/sitemap.xml             → sitemapRoutes (dynamic, public pages + published properties/articles)

/api/admin               → authRoutes (login, /me)
/api/admin/properties    → propertyRoutes (admin, auth required)
/api/admin/amenities     → amenityRoutes (admin)
/api/admin/landlord-requests → landlordRoutes (admin)
/api/admin/property-enquiries → enquiryRoutes (admin)
/api/admin/contact-messages  → contactRoutes (admin)
/api/admin/dashboard     → dashboardRoutes
/api/admin/admin-users   → adminUsersRoutes
/api/admin/settings      → settingsRoutes
/api/admin/units         → unitsRoutes
/api/admin/landlords     → landlordsRoutes
/api/admin/buildings     → buildingsRoutes
/api/admin/communities   → communitiesRoutes
/api/admin/articles      → articlesRoutes
/api/admin/ocr           → ocrRoutes
```

Public routes skip auth. Admin routes use `authenticateToken` middleware. POST on public form routes use `formLimiter` (20/15min/IP).

---

## Public Endpoints

### Properties

| Method | Path | Description | Query Params |
|--------|------|-------------|-------------|
| GET | `/api/properties` | All properties | `?status=published`, `?featured=1` |
| GET | `/api/properties/published` | Published only | — |
| GET | `/api/properties/featured` | Featured published | — |
| GET | `/api/properties/:slug` | By slug (with images + amenities) | — |

**Response shape** (single property):
```json
{
  "id": 1, "title": "...", "slug": "...", "property_type": "...",
  "building_name": "...", "location": "...", "bedrooms": 2,
  "bathrooms": 2, "max_guests": 4, "price_per_night": "850.00",
  "description": "...", "map_url": "...",
  "images": [{ "id": 1, "image_url": "...", "is_cover": 1 }],
  "amenities": [{ "id": 1, "name": "Wi-Fi", "icon": "wifi" }],
  "cover_image": "..."
}
```

### Amenities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/amenities` | All active amenities |

### Enquiries

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/property-enquiries` | Submit enquiry |

**Required**: `property_id`, `name`, `phone`. Email optional (auto-generates placeholder). Rate limited.

### Landlord Requests

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/landlord-requests` | Submit listing request |

### Contact

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/contact` | Submit contact message |

### Reviews

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/reviews` | Cached Google Reviews |
| GET | `/api/reviews/avatar?url=...` | Proxy review author avatar |

### Other

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | `{ status: 'ok', timestamp }` |
| GET | `/sitemap.xml` | Dynamic XML sitemap (`backend/routes/sitemap.js` → `backend/controllers/sitemapController.js`): static public pages + published listings (public property pages `/apartments/:slug`, `listings.status = 'published'`) + published articles (`/areas/:slug`, `published = 1`). **No admin/private paths.** Also served at `/api/sitemap.xml`. `SITE_URL` env overrides the base URL. |

---

## Admin Endpoints

All require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/login` | Authenticate → JWT |
| GET | `/api/admin/me` | Current user info |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard/summary` | Stats: properties, enquiries, landlords, contacts |

### Properties (Full CRUD)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/properties` | All (paginated, searchable) |
| POST | `/api/admin/properties` | Create (accepts `unit_id`) |
| PUT | `/api/admin/properties/:id` | Update |
| DELETE | `/api/admin/properties/:id` | Delete |
| POST | `/api/admin/properties/:id/images` | Upload images (max 20, 5MB) |
| DELETE | `/api/admin/properties/:id/images/:imageId` | Delete image |
| PUT | `/api/admin/properties/:id/images/:imageId/cover` | Set cover |
| PUT | `/api/admin/properties/:id/images/reorder` | Reorder images |

### Units

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/units` | All units (paginated, searchable) |
| GET | `/api/admin/units/:id` | Single unit |
| POST | `/api/admin/units` | Create unit |
| PUT | `/api/admin/units/:id` | Update unit |
| DELETE | `/api/admin/units/:id` | Delete unit |
| POST | `/api/admin/units/bulk-import` | CSV bulk import |
| POST | `/api/admin/units/:id/documents` | Upload document (title deed, permit) |
| DELETE | `/api/admin/units/:id/documents/:docId` | Delete document |

### Landlords

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/landlords` | All landlords |
| GET | `/api/admin/landlords/:id` | Single landlord |
| POST | `/api/admin/landlords` | Create landlord |
| PUT | `/api/admin/landlords/:id` | Update landlord |
| DELETE | `/api/admin/landlords/:id` | Delete landlord |
| POST | `/api/admin/landlords/:id/documents` | Upload document (ID, agreement) |
| DELETE | `/api/admin/landlords/:id/documents/:docId` | Delete document |

### Buildings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/buildings` | All buildings |
| POST | `/api/admin/buildings` | Create |
| PUT | `/api/admin/buildings/:id` | Update |
| DELETE | `/api/admin/buildings/:id` | Delete |

### Communities

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/communities` | All communities |
| POST | `/api/admin/communities` | Create |
| PUT | `/api/admin/communities/:id` | Update |
| DELETE | `/api/admin/communities/:id` | Delete |

### Articles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/articles` | All articles |
| POST | `/api/admin/articles` | Create (EN/AR) |
| PUT | `/api/admin/articles/:id` | Update |
| DELETE | `/api/admin/articles/:id` | Delete |

### OCR

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/ocr/extract` | Extract text from document (multer upload) |

**Body**: multipart form with `document` file + `document_type` (id_passport/title_deed/permit/contract) + optional `document_id`.

**Response**: `{ rawText, fields, documentType }`. See [[OCR System]] for details.

### Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/settings` | Get all settings |
| PUT | `/api/admin/settings` | Update settings |

### Admin Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/admin-users` | List admin users |
| POST | `/api/admin/admin-users` | Create admin user |
| PUT | `/api/admin/admin-users/:id` | Update |
| PUT | `/api/admin/admin-users/:id/password` | Reset password |
| DELETE | `/api/admin/admin-users/:id` | Delete |

### Enquiries (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/property-enquiries` | All (filterable) |
| PUT | `/api/admin/property-enquiries/:id/status` | Update status |

### Landlord Requests (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/landlord-requests` | All (filterable) |
| PUT | `/api/admin/landlord-requests/:id/status` | Update status |

### Contact Messages (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/contact-messages` | All (filterable) |
| PUT | `/api/admin/contact-messages/:id/status` | Update status |

### Amenities (Admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/amenities` | All |
| POST | `/api/admin/amenities` | Create |
| PUT | `/api/admin/amenities/:id` | Update |
| DELETE | `/api/admin/amenities/:id` | Delete |

---

## Error Handling

- `400` — Validation errors (missing fields, file too large, invalid type)
- `401` — Missing/invalid JWT token
- `403` — Insufficient permissions
- `404` — Resource not found
- `500` — Internal server error (logged)

### Related
- [[File Map]], [[Database]], [[Units & Listings]], [[OCR System]], [[Admin Panel]]
