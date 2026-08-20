---
tags: [database, mysql, schema, backend]
scope: database
files: ["database/schema.sql", "database/seed.js", "database/seed-communities.js", "database/seed-articles.js", "database/seed-properties.js"]
---

# Database

> MySQL database `authentic_holiday_homes` — 16 tables. XAMPP local / cPanel VPS production.

**Connection**: `backend/config/db.js` — `mysql2/promise` pool (host: localhost, port: 3306, user: root, password: empty for XAMPP).

---

## Tables Overview

| # | Table | Purpose | Key Relations |
|---|---|---|---|
| 1 | `admin_users` | Admin login accounts | — |
| 2 | `amenities` | Amenity definitions | → `property_amenities` |
| 3 | `area_articles` | Area guide articles (EN/AR) | — |
| 4 | `buildings` | Building records | ← `units.building_id` |
| 5 | `communities` | 248 Dubai communities | ← `units.community_id` |
| 6 | `contact_messages` | Contact form submissions | — |
| 7 | `landlords` | Landlord accounts + bank | ← `units.landlord_id`, ← `unit_documents.landlord_id` |
| 8 | `landlord_requests` | Public listing requests | — |
| 9 | `listings` | Property listings (public-facing) | ← `unit_documents.property_id`, → `units.unit_id` |
| 10 | `property_amenities` | Pivot: listings ↔ amenities | — |
| 11 | `property_enquiries` | Guest enquiry submissions | — |
| 12 | `property_images` | Listing images | — |
| 13 | `reviews_cache` | Google Reviews (7-day TTL) | — |
| 14 | `settings` | Key-value site config | — |
| 15 | `units` | Operational unit data (rent, ops) | → `listings.unit_id` |
| 16 | `unit_documents` | Uploaded documents (OCR) | — |

## 1. `admin_users`

`id:int(11) PK`, `name:varchar(100)`, `email:varchar(100) UNIQUE`, `password_hash:varchar(255)`, `role:enum('admin','superadmin') DEFAULT 'admin'`, `is_active:tinyint(1) DEFAULT 1`, `created_at:timestamp`, `updated_at:timestamp`

Seed: 1 superadmin (`admin@authenticholidayhomes.ae` / `admin123`).

## 2. `amenities`

`id:int(11) PK`, `name:varchar(100)`, `icon:varchar(50)`, `description:text`, `is_active:tinyint(1) DEFAULT 1`, `created_at:timestamp`, `category:varchar(50)`, `sort_order:int(11)`

Seed: 14 default amenities (Wi-Fi, Pool, Gym, Parking, Smart Lock, AC, TV, Washer, Kitchen, Balcony, Security, Safe, Coffee Maker, Hair Dryer).

## 3. `area_articles`

`id:int(11) PK`, `slug:varchar(100) UNIQUE`, `title:varchar(255)`, `title_ar:varchar(255)`, `subtitle:text`, `subtitle_ar:text`, `content:text`, `content_ar:longtext`, `highlights:longtext`, `highlights_ar:longtext`, `ideal_for:varchar(255)`, `ideal_for_ar:varchar(255)`, `why_in_demand:text`, `why_in_demand_ar:text`, `image_url:varchar(500)`, `keywords:varchar(500)`, `published:tinyint(4)`, `created_at:timestamp`, `updated_at:timestamp`

Seed: 9 articles (JVC, Al Jaddaf, Business Bay, Downtown, Azizi Riviera, Sports City, Marina, Palm Jumeirah, Holiday Homes vs Traditional Rental).

## 4. `buildings`

`id:int(11) PK`, `name:varchar(255)`, `name_ar:varchar(255)`, `management_email:varchar(255)`, `makani:varchar(100)`, `contact_number:varchar(50)`, `floors:int(11)`, `address:text`, `city:varchar(255)`, `security_contact:varchar(100)`, `gas_company_name:varchar(255)`, `gas_company_number:varchar(100)`, `plus_code:varchar(50)`, `latitude:decimal(10,8)`, `longitude:decimal(11,8)`, `created_at:timestamp`, `updated_at:timestamp`

## 5. `communities`

`id:int(11) PK`, `code:varchar(20) UNIQUE`, `name:varchar(255)`, `arabic_name:varchar(255)`, `sector_number:int(11)`, `sector:varchar(100)`, `management_email:varchar(255)`, `makani:varchar(100)`, `contact_number:varchar(50)`, `address:text`, `city:varchar(255)`, `security_contact:varchar(100)`, `gas_company_name:varchar(255)`, `gas_company_number:varchar(100)`, `plus_code:varchar(50)`, `latitude:decimal(10,8)`, `longitude:decimal(11,8)`, `created_at:timestamp`, `updated_at:timestamp`

Seed: 248 communities across 9 Dubai sectors via `database/seed-communities.js`.

## 6. `contact_messages`

`id:int(11) PK`, `name:varchar(100)`, `email:varchar(100)`, `phone:varchar(50)`, `subject:varchar(255)`, `message:text`, `status:enum('new','read','closed') DEFAULT 'new'`, `created_at:timestamp`

## 7. `landlords`

`id:int(11) PK`, `full_name:varchar(255)`, `email:varchar(255)`, `phone:varchar(50)`, `identity_number:varchar(100)`, `identity_document_url:varchar(500)`, `nationality:varchar(100)`, `unit_agreement_url:varchar(500)`, `password_hash:varchar(255)`, `is_active:tinyint(1) DEFAULT 1`, `send_welcome_email:tinyint(1) DEFAULT 0`, `bank_name:varchar(255)`, `bank_account_holder:varchar(255)`, `bank_account_number:varchar(100)`, `swift_code:varchar(50)`, `iban:varchar(100)`, `bank_branch:varchar(255)`, `created_at:timestamp`, `updated_at:timestamp`, `date_of_birth:date`

## 8. `landlord_requests`

`id:int(11) PK`, `full_name:varchar(100)`, `phone:varchar(50)`, `email:varchar(100)`, `property_location:varchar(255)`, `building_name:varchar(255)`, `unit_number:varchar(50)`, `property_type:varchar(100)`, `bedrooms:int(11)`, `furnishing_status:varchar(50)`, `description:text`, `message:text`, `status:enum('new','contacted','in_discussion','approved','rejected','converted_to_listing') DEFAULT 'new'`, `created_at:timestamp`, `updated_at:timestamp`

## 9. `listings`

`id:int(11) PK`, `unit_id:int(11) FK→units`, `title:varchar(255)`, `title_ar:varchar(255)`, `slug:varchar(255) UNIQUE`, `property_type:varchar(100)`, `building_name:varchar(255)`, `building_name_ar:varchar(255)`, `location:varchar(255)`, `location_ar:varchar(255)`, `address:text`, `address_ar:text`, `bedrooms:int(11)`, `bathrooms:int(11)`, `max_guests:int(11)`, `parking_spots:int(11)`, `size_sqft:int(11)`, `price_per_night:decimal(10,2)`, `short_description:text`, `short_description_ar:text`, `description:text`, `description_ar:text`, `map_url:text`, `plus_code:varchar(50)`, `latitude:decimal(10,8)`, `longitude:decimal(11,8)`, `status:enum('draft','published','unpublished') DEFAULT 'draft'`, `is_featured:tinyint(1) DEFAULT 0`, `meta_title:varchar(255)`, `meta_title_ar:varchar(255)`, `meta_description:text`, `meta_description_ar:text`, `created_at:timestamp`, `updated_at:timestamp`

Edit pre-fill: `getById` LEFT JOINs `units`→`buildings`→`landlords` when `unit_id` is set, flattens unit data to top-level.

## 10. `property_amenities`

`property_id:int(11) FK→listings`, `amenity_id:int(11) FK→amenities` — composite PK.

## 11. `property_enquiries`

`id:int(11) PK`, `property_id:int(11) FK→listings`, `name:varchar(100)`, `email:varchar(100)`, `phone:varchar(50)`, `check_in:date`, `check_out:date`, `guests:int(11)`, `message:text`, `status:enum('new','contacted','closed') DEFAULT 'new'`, `created_at:timestamp`

## 12. `property_images`

`id:int(11) PK`, `property_id:int(11) FK→listings`, `image_url:varchar(500)`, `is_cover:tinyint(1) DEFAULT 0`, `sort_order:int(11) DEFAULT 0`, `created_at:timestamp`

## 13. `reviews_cache`

`id:int(11) PK`, `cache_key:varchar(50) UNIQUE`, `data:longtext` (JSON), `rating:decimal(2,1)`, `total_ratings:int(11)`, `fetched_at:timestamp`, `refresh_token:text`, `account_name:varchar(255)`, `location_name:varchar(255)`

## 14. `settings`

`id:int(11) PK`, `setting_key:varchar(100) UNIQUE`, `setting_value:text`, `updated_at:timestamp`

Key values: `site_name`, `contact_email`, `contact_phone`, `address`, `facebook_url`, `instagram_url`, `rms_login_url`, `smtp_host`, `smtp_port`, `smtp_secure`, `smtp_user`, `smtp_password`, `smtp_from_email`, `ocr_space_api_key`, `gemini_api_key`

## 15. `units`

`id:int(11) PK`, `building_id:int(11) FK→buildings`, `community_id:int(11) FK→communities`, `landlord_id:int(11) FK→landlords`, `apartment_number:varchar(50)`, `house_type:varchar(100)`, `internet_provider:varchar(255)`, `internet_account_number:varchar(100)`, `dewa_premises_number:varchar(100)`, `monthly_rent:decimal(10,2)`, `commission_percent:decimal(5,2)`, + all listing display fields (title/title_ar/slug/property_type/building_name/location/address/bedrooms/bathrooms/max_guests/parking_spots/size_sqft/price_per_night/short_description/description/map_url/plus_code/lat/lng/status/is_featured/meta_title/meta_description — all with `_ar` Arabic variants).

## 16. `unit_documents`

`id:int(11) PK`, `property_id:int(11)`, `landlord_id:int(11)`, `document_type:enum('title_deed','permit','id_passport','contract')`, `document_url:varchar(500)`, `permit_number:varchar(100)`, `created_at:timestamp`, `expiry_date:date`, `ocr_data:longtext(JSON)`

## 16b. `unit_landlords` (junction — multi-owner, added by `migration-dedupe-multiowner.sql`)

`unit_id:int(11) FK→units`, `landlord_id:int(11) FK→landlords`, `is_primary:tinyint(1) DEFAULT 0`, `created_at:timestamp`, **PK(`unit_id`, `landlord_id`)**. One unit → many landlords (joint owners); exactly one should be `is_primary = 1`, mirrored by `units.landlord_id`. Smart Scan Onboarding writes this junction (`INSERT IGNORE`) when linking a unit to an owner, and renewal mode syncs `units.landlord_id` to the primary owner without creating a duplicate unit. Migration is report-only for existing duplicates (prints a report, does not merge/delete); unique indexes (`landlords.identity_number`, `landlords.passport_number`, `landlords.phone`) are attempted and skipped gracefully when duplicate rows block them.

---

## Relationships

```
landlords 1──* units 1──* listings 1──* property_images
                                  1──* property_enquiries
                                  *──* amenities (via property_amenities)
buildings 1──* units
communities 1──* units
landlords 1──* unit_documents
listings 1──* unit_documents
```

## Migration Files

| File | Purpose |
|---|---|
| `database/schema.sql` | Base: 8 original tables + seeds |
| `database/migration-settings.sql` | Settings table keys fix |
| `database/migration-smtp-config.sql` | SMTP config columns |
| `database/migration-parking-spots.sql` | `parking_spots` on properties |
| `database/migration-plus-code.sql` | `plus_code` column |
| `database/migration-communities.sql` | `communities` table |
| `database/migration-articles.sql` | `area_articles` table |
| `database/migration-articles-arabic.sql` | Arabic columns on articles |
| `database/migration-properties-arabic.sql` | Arabic columns on properties |
| `database/migration-buildings-units-landlords.sql` | `buildings`, `units`, `landlords` |
| `database/migration-buildings-units-complete.sql` | Full buildings/units/landlords |
| `database/migration-units-listings-split.sql` | Units ↔ listings split |
| `database/migration-landlord-simplify.sql` | Landlord simplification |
| `database/migration-documents.sql` | `unit_documents` table |
| `database/migration-ocr-data.sql` | `ocr_data` JSON column |
| `database/migration-reviews-cache.sql` | `reviews_cache` table |

### Related
- [[File Map]], [[Backend API]], [[Units & Listings]], [[Home]]
