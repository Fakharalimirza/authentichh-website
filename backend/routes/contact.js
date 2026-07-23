const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');

router.post('/', formLimiter, contactController.submit);
router.get('/', authenticateToken, contactController.getAll);
router.put('/:id/status', authenticateToken, contactController.updateStatus);

module.exports = router;
