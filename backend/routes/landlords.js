const express = require('express');
const router = express.Router();
const landlordsController = require('../controllers/landlordsController');
const { authenticateToken } = require('../middleware/auth');
const { csvUpload, documentUpload } = require('../middleware/upload');

router.get('/', authenticateToken, landlordsController.getAll);
router.post('/bulk-import', authenticateToken, csvUpload.single('file'), landlordsController.bulkImport);
router.get('/:id', authenticateToken, landlordsController.getById);
router.post('/', authenticateToken, landlordsController.create);
router.put('/:id', authenticateToken, landlordsController.update);
router.delete('/:id', authenticateToken, landlordsController.remove);
router.put('/:id/password', authenticateToken, landlordsController.resetPassword);

// Documents
router.get('/:id/documents', authenticateToken, landlordsController.getDocuments);
router.post('/:id/documents', authenticateToken, documentUpload.single('document'), landlordsController.uploadDocument);
router.patch('/:id/documents/:docId', authenticateToken, landlordsController.updateDocument);
router.delete('/:id/documents/:docId', authenticateToken, landlordsController.deleteDocument);

module.exports = router;
