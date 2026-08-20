-- Migration: Simplify landlord_requests table
-- Make phone, email, property_location, property_type nullable
-- The public form is now minimal: full_name, phone_email, message

ALTER TABLE landlord_requests
  MODIFY COLUMN phone VARCHAR(50) NULL,
  MODIFY COLUMN email VARCHAR(100) NULL,
  MODIFY COLUMN property_location VARCHAR(255) NULL,
  MODIFY COLUMN property_type VARCHAR(100) NULL;
