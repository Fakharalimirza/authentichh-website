const express = require('express');
const router = express.Router();
const amenityController = require('../controllers/amenityController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', amenityController.getAll);
router.get('/admin', authenticateToken, amenityController.getAllAdmin);
router.post('/', authenticateToken, amenityController.create);
router.put('/:id', authenticateToken, amenityController.update);
router.delete('/:id', authenticateToken, amenityController.remove);

module.exports = router;
