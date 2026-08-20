const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const { authenticateToken } = require('../middleware/auth');

// Admin routes (auth required)
router.get('/', authenticateToken, listingsController.getAll);
router.get('/:id', authenticateToken, listingsController.getById);
router.put('/:id', authenticateToken, listingsController.update);
router.delete('/:id', authenticateToken, listingsController.remove);

module.exports = router;
