# Database (`database/`)

MySQL schema and seed data for Authentic Holiday Homes.

| File | Purpose |
|------|---------|
| `schema.sql` | Full DDL: tables, indexes, foreign keys. Run once to create the database. |
| `seed.js` | Seed data: admin user, sample properties, amenities, pages content. |
| `seed-properties.js` | Additional property seed data. |
| `migration-settings.sql` | Migration script for settings table (run after schema). |

## Connection

Configured in `backend/config/db.js`. Default: MySQL 8.4, root/rootpw:3306, database `authentic_holiday_homes`.

## Tables

- `admin_users` — JWT-authenticated back-office users
- `properties` — Holiday home listings with all fields
- `property_images` — Images per property with ordering and cover flag
- `amenities` — Amenity definitions with category/icon/ordering
- `property_amenities` — Many-to-many join
- `property_enquiries` — Guest enquiries per property
- `contact_messages` — General contact form submissions
- `landlord_requests` — Landlord property listing requests
- `pages` — CMS page content
- `settings` — Site-wide configuration key-value pairs
