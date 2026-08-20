-- Migration: Expand unit_documents for landlord documents + DTCM permit
-- Safe to run multiple times (uses IF NOT EXISTS / procedure guards)

-- 1. Add landlord_id column
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'landlord_id'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE unit_documents ADD COLUMN landlord_id INT DEFAULT NULL AFTER property_id',
  'SELECT "landlord_id column already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Make property_id nullable (landlord docs won't have a property_id)
-- Check current IS_NULLABLE
SET @is_nullable = (
  SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'property_id'
);
SET @sql = IF(@is_nullable = 'NO',
  'ALTER TABLE unit_documents MODIFY property_id INT DEFAULT NULL',
  'SELECT "property_id already nullable"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Expand document_type ENUM to include id_passport and contract
-- MySQL doesn't support IF on MODIFY ENUM directly, so we use a procedure
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS expand_document_enum()
BEGIN
  DECLARE current_enum TEXT;
  SELECT COLUMN_TYPE INTO current_enum
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents' AND COLUMN_NAME = 'document_type';

  IF current_enum NOT LIKE '%id_passport%' THEN
    ALTER TABLE unit_documents MODIFY document_type
      ENUM('title_deed','permit','id_passport','contract') NOT NULL;
  END IF;
END //
DELIMITER ;

CALL expand_document_enum();
DROP PROCEDURE IF EXISTS expand_document_enum;

-- 4. Add FK for landlord_id
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'unit_documents'
  AND COLUMN_NAME = 'landlord_id' AND REFERENCED_TABLE_NAME IS NOT NULL
);
SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE unit_documents ADD CONSTRAINT fk_ud_landlord FOREIGN KEY (landlord_id) REFERENCES landlords(id) ON DELETE CASCADE',
  'SELECT "landlord FK already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
