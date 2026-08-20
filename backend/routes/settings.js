const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAll, getPublic, update } = require('../controllers/settingsController');

router.get('/public', getPublic);
router.get('/', authenticateToken, getAll);
router.put('/', authenticateToken, update);

module.exports = router;