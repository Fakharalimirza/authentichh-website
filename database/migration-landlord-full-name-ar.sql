-- Migration: Add Arabic full_name column to landlords
-- Run this BEFORE creating/updating landlords with Arabic names

ALTER TABLE landlords
  ADD COLUMN IF NOT EXISTS full_name_ar VARCHAR(255) DEFAULT '' AFTER full_name;