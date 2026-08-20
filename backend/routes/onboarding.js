const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, onboardingController.createOnboarding);
router.post('/preview', authenticateToken, onboardingController.previewOnboarding);

module.exports = router;