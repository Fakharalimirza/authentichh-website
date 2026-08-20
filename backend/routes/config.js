const express = require('express');
const router = express.Router();

/**
 * Public configuration for the frontend.
 * Exposes non-secret, client-side values only (Google Maps JS API keys are
 * meant to be public; they are restricted by HTTP referrer in the console).
 */
router.get('/', (req, res) => {
  res.json({
    mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || null,
    mapId: process.env.GOOGLE_MAPS_MAP_ID || null,
  });
});

module.exports = router;
