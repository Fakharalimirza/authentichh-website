const { Router } = require('express');
const router = Router();
const { getReviews, getAvatar, refreshReviews, auth, authCallback } = require('../controllers/reviewsController');

router.get('/', getReviews);
router.get('/avatar', getAvatar);
router.get('/refresh', refreshReviews);
router.get('/auth', auth);
router.get('/auth/callback', authCallback);

module.exports = router;
