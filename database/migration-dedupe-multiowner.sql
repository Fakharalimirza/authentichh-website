-- Migration: Dedupe-First Onboarding — Phase 1
-- Adds the unit_landlords junction table (multi-owner support) + 3 unique indexes.
-- Safe to run multiple times (IF NOT EXISTS + information_schema guards,
-- mirroring the pattern in migration-documents.sql).
--
-- NOTE: The unique indexes below may FAIL if duplicate rows already exist
-- (e.g. two landlords sharing an identity_number). That failure is intentional —
-- clean the duplicates first and re-run, or start from a fresh DB where they
-- install cleanly. The JS runner (backend/run-dedupe-multiowner-migration.js)
-- wraps each index in try/catch and reports which ones were skipped.

-- =====================================================
-- 1. CREATE unit_landlords junction table
--    (unit_id + landlord_id = PK, both FK ON DELETE CASCADE)
-- =====================================================
CREATE TABLE IF NOT EXISTS unit_landlords (
  unit_id INT NOT NULL,
  landlord_id INT NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (unit_id, landlord_id),
  CONSTRAINT fk_ul_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  CONSTRAINT fk_ul_landlord FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. UNIQUE INDEX uq_landlords_identity on landlords(identity_number)
-- =====================================================
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'landlords' AND INDEX_NAME = 'uq_landlords_identity'
);
SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE landlords ADD UNIQUE INDEX uq_landlords_identity (identity_number)',
  'SELECT "uq_landlords_identity already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. UNIQUE INDEX uq_buildings_name on buildings(name)
-- =====================================================
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'buildings' AND INDEX_NAME = 'uq_buildings_name'
);
SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE buildings ADD UNIQUE INDEX uq_buildings_name (name)',
  'SELECT "uq_buildings_name already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. UNIQUE INDEX uq_units_building_apartment on units(building_id, apartment_number)
-- =====================================================
SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'units' AND INDEX_NAME = 'uq_units_building_apartment'
);
SET @sql = IF(@idx_exists = 0,
  'ALTER TABLE units ADD UNIQUE INDEX uq_units_building_apartment (building_id, apartment_number)',
  'SELECT "uq_units_building_apartment already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
