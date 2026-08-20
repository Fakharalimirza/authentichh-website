/**
 * @fileoverview OCR controller — scan documents and return structured fields.
 * Contract PDFs are scanned page-by-page (split into single-page PDFs) with a
 * short-lived session so the frontend can show per-page progress.
 */

const crypto = require('crypto');
const path = require('path');
const { processDocument, splitPdfIntoPages, cleanupSplitPages, scanContractPage } = require('../utils/ocr');
const pool = require('../config/db');

/** In-memory contract scan sessions: sessionId -> { pagePaths, totalPages, timer } */
const contractSessions = new Map();
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

function destroyContractSession(sessionId) {
  const session = contractSessions.get(sessionId);
  if (!session) return;
  clearTimeout(session.timer);
  contractSessions.delete(sessionId);
  cleanupSplitPages(session.pagePaths);
}

/** Load OCR settings (method + API keys) from the settings table. */
async function loadSettings() {
  const [rows] = await pool.query(
    "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('ocr_method', 'ocr_space_api_key', 'gemini_api_key')"
  );
  const settings = {};
  rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
  return settings;
}

/**
 * POST /api/admin/ocr/extract
 * Accepts multipart file + document_type, returns structured fields.
 *
 * Contract PDFs: the first call splits the PDF into pages and scans page 1,
 * returning { page, totalPages, sessionId }. Subsequent calls pass
 * { document_type: 'contract', session_id, page } (no file) to scan the next
 * page. The session is cleaned up automatically after the last page.
 */
exports.extract = async (req, res, next) => {
  try {
    const documentType = req.body.document_type || 'id_passport';
    const filePath = req.file?.path;
    const sessionId = req.body.session_id;
    const page = parseInt(req.body.page, 10);
    const settings = await loadSettings();

    // ── Contract page-by-page flow ─────────────────────────────────────────
    if (documentType === 'contract') {
      // Continue scanning page N of an existing session
      if (sessionId && page >= 1) {
        const session = contractSessions.get(sessionId);
        if (!session) {
          return res.status(400).json({ message: 'Contract scan session expired — please re-upload the contract' });
        }
        // Refresh the TTL
        clearTimeout(session.timer);
        session.timer = setTimeout(() => destroyContractSession(sessionId), SESSION_TTL_MS);

        const pagePath = session.pagePaths[page - 1];
        if (!pagePath) {
          return res.status(400).json({ message: `Invalid page number: ${page}` });
        }
        const result = await scanContractPage(pagePath, page, settings);
        // Last page — release the session + temp files
        if (page >= session.totalPages) {
          destroyContractSession(sessionId);
        }
        return res.json({ ...result, documentType, page, totalPages: session.totalPages });
      }

      // Start a new scan — file required
      if (!req.file) {
        return res.status(400).json({ message: 'No document uploaded' });
      }

      if (path.extname(filePath).toLowerCase() === '.pdf') {
        const pagePaths = await splitPdfIntoPages(filePath);
        const totalPages = pagePaths.length;

        if (totalPages > 1) {
          // Multi-page — keep a session, scan page 1 now
          const sid = crypto.randomUUID();
          const timer = setTimeout(() => destroyContractSession(sid), SESSION_TTL_MS);
          contractSessions.set(sid, { pagePaths, totalPages, timer });
          const result = await scanContractPage(pagePaths[0], 1, settings);
          return res.json({ ...result, documentType, page: 1, totalPages, sessionId: sid });
        }

        // Single-page PDF — scan directly
        const result = await scanContractPage(pagePaths[0], 1, settings);
        cleanupSplitPages(pagePaths);
        return res.json({ ...result, documentType, page: 1, totalPages: 1 });
      }

      // Image contract — single page, no session
      const result = await scanContractPage(filePath, 1, settings);
      return res.json({ ...result, documentType, page: 1, totalPages: 1 });
    }

    // ── Regular single-request flow (all other doc types) ──────────────────
    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded' });
    }

    const result = await processDocument(filePath, documentType, settings);

    // Optionally store OCR data on existing document record
    if (req.body.document_id) {
      try {
        await pool.query(
          'UPDATE unit_documents SET ocr_data = ? WHERE id = ?',
          [JSON.stringify({ fields: result.fields, rawText: result.rawText }), req.body.document_id]
        );
      } catch {
        // document_id may not exist yet — not fatal
      }
    }

    res.json(result);
  } catch (err) {
    // Never send raw/HTML errors to the client — always respond with clean JSON.
    // Only 429/401 (upstream rate-limit/auth) pass through to the central handler.
    if (err.status === 429 || err.status === 401) {
      return next(err);
    }
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: err.message || 'OCR processing failed' });
  }
};