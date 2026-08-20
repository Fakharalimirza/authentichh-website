-- Migration: Add ocr_data column to unit_documents
-- Stores structured OCR extraction results as JSON

ALTER TABLE unit_documents
ADD COLUMN ocr_data JSON DEFAULT NULL AFTER expiry_date;
