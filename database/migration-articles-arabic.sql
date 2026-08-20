-- Migration: Add Arabic translation columns to area_articles
-- Run this BEFORE re-seeding the articles

ALTER TABLE area_articles
  ADD COLUMN title_ar VARCHAR(255) DEFAULT NULL AFTER title,
  ADD COLUMN subtitle_ar TEXT DEFAULT NULL AFTER subtitle,
  ADD COLUMN content_ar LONGTEXT DEFAULT NULL AFTER content,
  ADD COLUMN highlights_ar JSON DEFAULT NULL AFTER highlights,
  ADD COLUMN ideal_for_ar VARCHAR(255) DEFAULT NULL AFTER ideal_for,
  ADD COLUMN why_in_demand_ar TEXT DEFAULT NULL AFTER why_in_demand;
