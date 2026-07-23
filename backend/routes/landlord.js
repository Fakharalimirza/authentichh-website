const express = require('express');
const router = express.Router();
const landlordController = require('../controllers/landlordController');
const { authenticateToken } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');

router.post('/', formLimiter, landlordController.submit);
router.get('/', authenticateToken, landlordController.getAll);
router.get('/:id', authenticateToken, landlordController.getById);
router.put('/:id/status', authenticateToken, landlordController.updateStatus);

module.exports = router;
