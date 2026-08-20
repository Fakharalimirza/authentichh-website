-- Migration: Split units into units (operational) + listings (marketing)
-- WARNING: Run on a backup first. This is a destructive migration.

-- =====================================================
-- 1. CREATE listings TABLE (marketing/public data)
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT DEFAULT NULL,

  -- Marketing fields (from current units)
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) DEFAULT '',
  slug VARCHAR(255) NOT NULL UNIQUE,
  property_type VARCHAR(100) DEFAULT '',
  building_name VARCHAR(255) DEFAULT '',
  building_name_ar VARCHAR(255) DEFAULT '',
  location VARCHAR(255) DEFAULT '',
  location_ar VARCHAR(255) DEFAULT '',
  address TEXT,
  address_ar TEXT,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  max_guests INT DEFAULT 0,
  parking_spots INT DEFAULT 0,
  size_sqft INT DEFAULT NULL,
  price_per_night DECIMAL(10,2) DEFAULT 0.00,
  short_description TEXT,
  short_description_ar TEXT,
  description TEXT,
  description_ar TEXT,
  map_url TEXT,
  plus_code VARCHAR(50) DEFAULT NULL,
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  status ENUM('draft','published','unpublished') DEFAULT 'draft',
  is_featured TINYINT(1) DEFAULT 0,
  meta_title VARCHAR(255) DEFAULT '',
  meta_title_ar VARCHAR(255) DEFAULT '',
  meta_description TEXT,
  meta_description_ar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
);

-- =====================================================
-- 2. MIGRATE DATA: Copy marketing columns from units → listings
-- =====================================================
INSERT INTO listings (
  unit_id, title, title_ar, slug, property_type,
  building_name, building_name_ar, location, location_ar,
  address, address_ar,
  bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
  short_description, short_description_ar, description, description_ar,
  map_url, plus_code, latitude, longitude,
  status, is_featured,
  meta_title, meta_title_ar, meta_description, meta_description_ar,
  created_at, updated_at
)
SELECT
  id, title, title_ar, slug, property_type,
  building_name, building_name_ar, location, location_ar,
  address, address_ar,
  bedrooms, bathrooms, max_guests, parking_spots, size_sqft, price_per_night,
  short_description, short_description_ar, description, description_ar,
  map_url, plus_code, latitude, longitude,
  status, is_featured,
  meta_title, meta_title_ar, meta_description, meta_description_ar,
  created_at, updated_at
FROM units;

-- =====================================================
-- 3. UPDATE unit_documents FK: property_id → unit_id mapping
-- =====================================================
-- First, add a temporary column to store the new unit_id
ALTER TABLE unit_documents ADD COLUMN IF NOT EXISTS new_unit_id INT DEFAULT NULL;

-- Map old property_id (which was the units.id) to the new units.id
-- Since we're keeping the same id in units, we can just copy it
UPDATE unit_documents SET new_unit_id = property_id;

-- =====================================================
-- 4. UPDATE property_images FK to point to listings
-- =====================================================
-- MySQL auto-updated FK references on the RENAME, but we need to
-- make sure the FK points to listings.id instead of units.id.
-- Since both tables have the same IDs (copied from units), the
-- FK values don't change — just the constraint target.

-- Drop old FK constraints
ALTER TABLE property_images DROP FOREIGN KEY IF EXISTS property_images_ibfk_1;
ALTER TABLE property_amenities DROP FOREIGN KEY IF EXISTS property_amenities_ibfk_1;
ALTER TABLE property_enquiries DROP FOREIGN KEY IF EXISTS property_enquiries_ibfk_1;

-- Re-add FK constraints pointing to listings
ALTER TABLE property_images
  ADD CONSTRAINT fk_pi_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE;
ALTER TABLE property_amenities
  ADD CONSTRAINT fk_pa_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE;
ALTER TABLE property_enquiries
  ADD CONSTRAINT fk_pe_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE;

-- =====================================================
-- 5. UPDATE unit_documents FK to point to listings
-- =====================================================
ALTER TABLE unit_documents DROP FOREIGN KEY IF EXISTS unit_documents_ibfk_1;
ALTER TABLE unit_documents
  ADD CONSTRAINT fk_ud_listing FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE;

-- Clean up temp column
ALTER TABLE unit_documents DROP COLUMN IF EXISTS new_unit_id;

-- =====================================================
-- 6. DROP operational columns from listings
-- (they now live in the new units table)
-- =====================================================
-- We DON'T drop them yet — we keep them for backward compatibility
-- during the transition. The backend will read from both tables.
-- Later cleanup can remove: building_id, community_id, landlord_id,
-- apartment_number, house_type, internet_provider, internet_account_number,
-- dewa_premises_number, monthly_rent, commission_percent

-- =====================================================
-- DONE: Now units table has ALL columns (operational + marketing)
--       listings table has marketing columns + unit_id FK
--       property_images, property_amenities, property_enquiries → listings
--       unit_documents → listings
-- =====================================================
-- The units table still has all columns for backward compatibility.
-- The backend can now read/write:
--   - Operational data from units (building_id, landlord_id, rent, etc.)
--   - Marketing data from listings (title, images, price, status, etc.)
-- =====================================================
