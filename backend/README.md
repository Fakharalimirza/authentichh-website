# Backend (`backend/`)

Express.js + MySQL REST API for Authentic Holiday Homes.

## Structure

| Directory | Purpose |
|-----------|---------|
| `config/` | Database connection pool (`db.js`) |
| `controllers/` | Route handler logic per resource |
| `middleware/` | Auth JWT verification, file upload (multer), rate limiting |
| `routes/` | Express Router definitions per resource |
| `utils/` | Email sending, email templates, image processing, slugify |
| `scripts/` | Database migration/seeding scripts |
| `uploads/` | Property images organized in `properties/<id>/` subfolders |
| `server.js` | Express app entry point, mounts all routes |

## Route Map

| Prefix | Router | Controllers |
|--------|--------|-------------|
| `/api/admin` | `routes/auth.js` | `authController.js` |
| `/api/admin/properties` | `routes/properties.js` | `propertyController.js` |
| `/api/admin/amenities` | `routes/amenities.js` | `amenityController.js` |
| `/api/admin/landlord-requests` | `routes/landlord.js` | `landlordController.js` |
| `/api/admin/property-enquiries` | `routes/enquiries.js` | `enquiryController.js` |
| `/api/admin/contact-messages` | `routes/contact.js` | `contactController.js` |
| `/api/admin/dashboard` | `routes/dashboard.js` | `dashboardController.js` |
| `/api/admin/admin-users` | `routes/adminUsers.js` | `adminUserController.js` |
| `/api/admin/settings` | `routes/settings.js` | `settingsController.js` |
| `/api/properties` | `routes/properties.js` | Shared public routes |
| `/api/amenities` | `routes/amenities.js` | Shared public routes |
| `/api/landlord-requests` | `routes/landlord.js` | Public submission |
| `/api/property-enquiries` | `routes/enquiries.js` | Public submission |
| `/api/contact` | `routes/contact.js` | Public submission |

## Key Conventions

- All queries use parameterized prepared statements (mysql2)
- Admin routes: JWT verified via `middleware/auth.js`
- Image uploads: `multer` + `sharp` for WebP resizing (thumb 150×150, small 400×300, medium 800×600, large 1920×1080)
- Email: `sendEmail()` for admin notifications, `sendEmailToUser()` for auto-replies with branded HTML templates
- Port: 5000, CORS enabled for frontend dev servers
