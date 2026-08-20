-- Migration: Add Arabic translation columns to properties
-- Run this BEFORE creating/updating properties with Arabic fields

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS title_ar VARCHAR(500) DEFAULT '' AFTER title,
  ADD COLUMN IF NOT EXISTS building_name_ar VARCHAR(255) DEFAULT '' AFTER building_name,
  ADD COLUMN IF NOT EXISTS location_ar VARCHAR(255) DEFAULT '' AFTER location,
  ADD COLUMN IF NOT EXISTS address_ar VARCHAR(500) DEFAULT '' AFTER address,
  ADD COLUMN IF NOT EXISTS short_description_ar TEXT AFTER short_description,
  ADD COLUMN IF NOT EXISTS description_ar LONGTEXT AFTER description,
  ADD COLUMN IF NOT EXISTS meta_title_ar VARCHAR(500) DEFAULT '' AFTER meta_title,
  ADD COLUMN IF NOT EXISTS meta_description_ar TEXT AFTER meta_description;
