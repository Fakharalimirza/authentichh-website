-- Migration: Complete the buildings/units/landlords setup
-- (continues from migration-buildings-units-landlords.sql which partially ran)

-- =====================================================
-- 1. ADD foreign key constraints (MariaDB 10.4 doesn't support IF NOT EXISTS for constraints)
-- =====================================================
ALTER TABLE properties
  ADD CONSTRAINT fk_property_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;

ALTER TABLE properties
  ADD CONSTRAINT fk_property_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE SET NULL;

ALTER TABLE properties
  ADD CONSTRAINT fk_property_landlord FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE SET NULL;

-- =====================================================
-- 2. AUTO-POPULATE buildings from existing building_name values
-- =====================================================
INSERT IGNORE INTO buildings (name, city)
SELECT DISTINCT building_name, 'Dubai'
FROM properties
WHERE building_name IS NOT NULL AND building_name != '' AND building_name != 'Unknown Property';

-- =====================================================
-- 3. AUTO-LINK existing properties to their buildings
-- =====================================================
UPDATE properties p
INNER JOIN buildings b ON p.building_name = b.name
SET p.building_id = b.id
WHERE p.building_name IS NOT NULL AND p.building_name != '';

-- =====================================================
-- 4. RENAME properties → units
-- =====================================================
RENAME TABLE properties TO units;
