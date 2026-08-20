/**
 * @fileoverview OCR routes — scan documents for structured data extraction.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { documentUpload } = require('../middleware/upload');
const ocrController = require('../controllers/ocrController');

// POST /api/admin/ocr/extract — scan a document and return structured fields
router.post('/extract', authenticateToken, documentUpload.single('document'), ocrController.extract);

module.exports = router;
