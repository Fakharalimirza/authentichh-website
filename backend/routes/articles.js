const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getPublic, getBySlug, getAll, create, update, remove } = require('../controllers/articlesController');

router.get('/public', getPublic);
router.get('/public/:slug', getBySlug);
router.get('/', authenticateToken, getAll);
router.post('/', authenticateToken, create);
router.put('/:id', authenticateToken, update);
router.delete('/:id', authenticateToken, remove);

module.exports = router;
