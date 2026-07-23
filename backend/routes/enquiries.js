const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticateToken } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimiter');

router.post('/', formLimiter, enquiryController.submit);
router.get('/', authenticateToken, enquiryController.getAll);
router.put('/:id/status', authenticateToken, enquiryController.updateStatus);

module.exports = router;
