const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAll, getPublic, create, update, remove } = require('../controllers/communitiesController');

router.get('/public', getPublic);
router.get('/', authenticateToken, getAll);
router.post('/', authenticateToken, create);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

module.exports = router;
