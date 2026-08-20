const express = require('express');
const router = express.Router();
const unitsController = require('../controllers/unitsController');
const { authenticateToken } = require('../middleware/auth');
const { csvUpload, documentUpload } = require('../middleware/upload');

router.get('/', authenticateToken, unitsController.getAll);
router.post('/bulk-import', authenticateToken, csvUpload.single('file'), unitsController.bulkImport);
router.get('/:id', authenticateToken, unitsController.getById);
router.post('/', authenticateToken, unitsController.create);
router.put('/:id', authenticateToken, unitsController.update);
router.delete('/:id', authenticateToken, unitsController.remove);

// Documents
router.get('/:id/documents', authenticateToken, unitsController.getDocuments);
router.post('/:id/documents', authenticateToken, documentUpload.single('document'), unitsController.uploadDocument);
router.patch('/:id/documents/:docId', authenticateToken, unitsController.updateDocument);
router.delete('/:id/documents/:docId', authenticateToken, unitsController.deleteDocument);

module.exports = router;
