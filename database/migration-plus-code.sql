-- Add plus_code column to properties table
ALTER TABLE properties ADD COLUMN plus_code VARCHAR(50) DEFAULT NULL AFTER map_url;
