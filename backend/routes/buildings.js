const express = require('express');
const router = express.Router();
const buildingsController = require('../controllers/buildingsController');
const { authenticateToken } = require('../middleware/auth');
const { csvUpload } = require('../middleware/upload');

// Public route — no auth required (map test page)
router.get('/map-data', buildingsController.getMapData);

router.get('/', authenticateToken, buildingsController.getAll);
router.post('/bulk-import', authenticateToken, csvUpload.single('file'), buildingsController.bulkImport);
router.get('/:id', authenticateToken, buildingsController.getById);
router.post('/', authenticateToken, buildingsController.create);
router.put('/:id', authenticateToken, buildingsController.update);
router.delete('/:id', authenticateToken, buildingsController.remove);

module.exports = router;
