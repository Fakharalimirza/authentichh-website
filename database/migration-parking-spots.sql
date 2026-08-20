-- Add parking_spots column to properties table
ALTER TABLE properties ADD COLUMN parking_spots INT DEFAULT 0 AFTER max_guests;
