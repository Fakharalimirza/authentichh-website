-- Migration: Add document_number column to unit_documents
-- Stores the identifying number for each uploaded document:
--   title deed registration no, Emirates ID number, passport number, permit number.
-- Safe to run multiple times (uses information_schema check + PREPARE/EXECUTE guard)

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'document_number'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE unit_documents ADD COLUMN document_number VARCHAR(100) DEFAULT NULL AFTER permit_number',
  'SELECT "document_number column already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
