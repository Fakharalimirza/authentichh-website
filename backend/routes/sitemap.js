const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

// Mounted at both app root (serves /sitemap.xml) and /api (serves /api/sitemap.xml).
router.get('/sitemap.xml', sitemapController.generate);

module.exports = router;