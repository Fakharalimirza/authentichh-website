const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAll, create, update, resetPassword, remove } = require('../controllers/adminUserController');

router.get('/', authenticateToken, getAll);
router.post('/', authenticateToken, create);
router.put('/:id', authenticateToken, update);
router.put('/:id/password', authenticateToken, resetPassword);
router.delete('/:id', authenticateToken, remove);

module.exports = router;