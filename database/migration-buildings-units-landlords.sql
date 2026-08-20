-- Migration: Buildings + Communities + Landlords + Units architecture
-- This is a major schema change. Run carefully.

-- =====================================================
-- 1. CREATE buildings TABLE (for apartments)
-- =====================================================
CREATE TABLE IF NOT EXISTS buildings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) DEFAULT '',
  management_email VARCHAR(255) DEFAULT '',
  makani VARCHAR(100) DEFAULT '',
  contact_number VARCHAR(50) DEFAULT '',
  floors INT DEFAULT 0,
  address TEXT,
  city VARCHAR(255) DEFAULT 'Dubai',
  security_contact VARCHAR(100) DEFAULT '',
  gas_company_name VARCHAR(255) DEFAULT '',
  gas_company_number VARCHAR(100) DEFAULT '',
  plus_code VARCHAR(50) DEFAULT NULL,
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ADD new columns to communities TABLE
-- =====================================================
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS management_email VARCHAR(255) DEFAULT '' AFTER sector,
  ADD COLUMN IF NOT EXISTS makani VARCHAR(100) DEFAULT '' AFTER management_email,
  ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50) DEFAULT '' AFTER makani,
  ADD COLUMN IF NOT EXISTS address TEXT AFTER contact_number,
  ADD COLUMN IF NOT EXISTS city VARCHAR(255) DEFAULT 'Dubai' AFTER address,
  ADD COLUMN IF NOT EXISTS security_contact VARCHAR(100) DEFAULT '' AFTER city,
  ADD COLUMN IF NOT EXISTS gas_company_name VARCHAR(255) DEFAULT '' AFTER security_contact,
  ADD COLUMN IF NOT EXISTS gas_company_number VARCHAR(100) DEFAULT '' AFTER gas_company_name,
  ADD COLUMN IF NOT EXISTS plus_code VARCHAR(50) DEFAULT NULL AFTER gas_company_number,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8) DEFAULT NULL AFTER plus_code,
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8) DEFAULT NULL AFTER latitude,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- =====================================================
-- 3. CREATE landlords TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS landlords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT '',
  identity_number VARCHAR(100) DEFAULT '',
  identity_document_url VARCHAR(500) DEFAULT '',
  nationality VARCHAR(100) DEFAULT '',
  unit_agreement_url VARCHAR(500) DEFAULT '',
  password_hash VARCHAR(255) DEFAULT '',
  is_active TINYINT(1) DEFAULT 1,
  send_welcome_email TINYINT(1) DEFAULT 0,
  bank_name VARCHAR(255) DEFAULT '',
  bank_account_holder VARCHAR(255) DEFAULT '',
  bank_account_number VARCHAR(100) DEFAULT '',
  swift_code VARCHAR(50) DEFAULT '',
  iban VARCHAR(100) DEFAULT '',
  bank_branch VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. CREATE unit_documents TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS unit_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  document_type ENUM('title_deed', 'permit') NOT NULL,
  document_url VARCHAR(500) DEFAULT '',
  permit_number VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. ADD FK columns to properties (will become units)
-- =====================================================
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS building_id INT DEFAULT NULL AFTER id,
  ADD COLUMN IF NOT EXISTS community_id INT DEFAULT NULL AFTER building_id,
  ADD COLUMN IF NOT EXISTS landlord_id INT DEFAULT NULL AFTER community_id,
  ADD COLUMN IF NOT EXISTS apartment_number VARCHAR(50) DEFAULT '' AFTER landlord_id,
  ADD COLUMN IF NOT EXISTS house_type VARCHAR(100) DEFAULT '' AFTER apartment_number,
  ADD COLUMN IF NOT EXISTS internet_provider VARCHAR(255) DEFAULT '' AFTER house_type,
  ADD COLUMN IF NOT EXISTS internet_account_number VARCHAR(100) DEFAULT '' AFTER internet_provider,
  ADD COLUMN IF NOT EXISTS dewa_premises_number VARCHAR(100) DEFAULT '' AFTER internet_account_number,
  ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2) DEFAULT 0.00 AFTER dewa_premises_number,
  ADD COLUMN IF NOT EXISTS commission_percent DECIMAL(5,2) DEFAULT 0.00 AFTER monthly_rent;

-- Add foreign keys
ALTER TABLE properties
  ADD CONSTRAINT IF NOT EXISTS fk_property_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_property_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_property_landlord FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE SET NULL;

-- =====================================================
-- 6. AUTO-POPULATE buildings from existing building_name values
-- =====================================================
INSERT IGNORE INTO buildings (name, city)
SELECT DISTINCT building_name, 'Dubai'
FROM properties
WHERE building_name IS NOT NULL AND building_name != '' AND building_name != 'Unknown Property';

-- =====================================================
-- 7. AUTO-LINK existing properties to their buildings
-- =====================================================
UPDATE properties p
INNER JOIN buildings b ON p.building_name = b.name
SET p.building_id = b.id
WHERE p.building_name IS NOT NULL AND p.building_name != '';

-- =====================================================
-- 8. RENAME properties → units (via table rename)
-- =====================================================
RENAME TABLE properties TO units;

-- =====================================================
-- 9. RENAME FK columns and constraints to match 'units' naming
-- =====================================================
-- Note: MySQL auto-updates FK references on RENAME, but constraint names may need updating.
-- The FK columns (building_id, community_id, landlord_id) stay as-is.
-- property_images, property_amenities, property_enquiries FKs still reference the renamed table.
-- MySQL handles this automatically on RENAME TABLE.
