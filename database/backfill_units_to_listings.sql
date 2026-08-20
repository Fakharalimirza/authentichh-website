-- Backfill common fields from units to listings
-- This script copies the common fields from units to their linked listings
-- Run this after the initial migration (migration-units-listings-split.sql)

-- Find listings that have a unit_id and copy common fields
UPDATE listings l
    JOIN units u ON l.unit_id = u.id
    SET
    l.title = COALESCE(u.title, ''),
    l.title_ar = COALESCE(u.title_ar, ''),
    l.slug = COALESCE(u.slug, ''),
    l.property_type = COALESCE(u.property_type, ''),
    l.building_name = COALESCE(u.building_name, ''),
    l.building_name_ar = COALESCE(u.building_name_ar, ''),
    l.location = COALESCE(u.location, ''),
    l.location_ar = COALESCE(u.location_ar, ''),
    l.address = COALESCE(u.address, ''),
    l.address_ar = COALESCE(u.address_ar, ''),
    l.bedrooms = COALESCE(u.bedrooms, 0),
    l.bathrooms = COALESCE(u.bathrooms, 0),
    l.max_guests = COALESCE(u.max_guests, 0),
    l.parking_spots = COALESCE(u.parking_spots, 0),
    l.size_sqft = COALESCE(u.size_sqft, NULL),
    l.price_per_night = COALESCE(u.price_per_night, 0.00),
    l.short_description = COALESCE(u.short_description, ''),
    l.short_description_ar = COALESCE(u.description_ar, ''),
    l.description = COALESCE(u.description, ''),
    l.map_url = COALESCE(u.map_url, ''),
    l.plus_code = COALESCE(u.plus_code, ''),
    l.latitude = COALESCE(u.latitude, NULL),
    l.longitude = COALESCE(u.longitude, NULL),
    l.status = COALESCE(u.status, 'draft'),
    l.is_featured = COALESCE(u.is_featured, 0);

-- Optional: Update listings that are unlinked (unit_id IS NULL) to default values
UPDATE listings l
    SET
    l.title = COALESCE(l.title, ''),
    l.title_ar = COALESCE(l.title_ar, ''),
    l.slug = COALESCE(l.slug, ''),
    l.property_type = COALESCE(l.property_type, ''),
    l.building_name = COALESCE(l.building_name, ''),
    l.building_name_ar = COALESCE(l.building_name_ar, ''),
    l.location = COALESCE(l.location, ''),
    l.location_ar = COALESCE(l.location_ar, ''),
    l.address = COALESCE(l.address, ''),
    l.address_ar = COALESCE(l.address_ar, ''),
    l.bedrooms = COALESCE(l.bedrooms, 0),
    l.bathrooms = COALESCE(l.bathrooms, 0),
    l.max_guests = COALESCE(l.max_guests, 0),
    l.parking_spots = COALESCE(l.parking_spots, 0),
    l.size_sqft = COALESCE(l.size_sqft, NULL),
    l.price_per_night = COALESCE(l.price_per_night, 0.00),
    l.short_description = COALESCE(l.short_description, ''),
    l.short_description_ar = COALESCE(l.description_ar, ''),
    l.description = COALESCE(l.description, ''),
    l.map_url = COALESCE(l.map_url, ''),
    l.plus_code = COALESCE(l.plus_code, ''),
    l.latitude = COALESCE(l.latitude, NULL),
    l.longitude = COALESCE(l.longitude, NULL),
    l.status = COALESCE(l.status, 'draft'),
    l.is_featured = COALESCE(l.is_featured, 0);

-- Backfill metadata fields (meta_title, meta_title_ar, meta_description, meta_description_ar)
UPDATE listings l
    JOIN units u ON l.unit_id = u.id
    SET
    l.meta_title = COALESCE(u.meta_title, ''),
    l.meta_title_ar = COALESCE(u.meta_title_ar, ''),
    l.meta_description = COALESCE(u.meta_description, ''),
    l.meta_description_ar = COALESCE(u.meta_description_ar, ''),
    l.created_at = COALESCE(u.created_at, CURRENT_TIMESTAMP),
    l.updated_at = COALESCE(u.updated_at, CURRENT_TIMESTAMP);

-- End of backfill

-- Note: This script should be run after the initial migration (migration-units-listings-split.sql)
-- It will update all listings that have a unit_id with the common fields from their associated unit.
-- Unlinked listings (unit_id IS NULL) will retain their existing values.
--