const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');
const { upload, csvUpload } = require('../middleware/upload');

router.get('/', propertyController.getAll);
router.get('/published', propertyController.getPublished);
router.get('/featured', propertyController.getFeatured);
router.get('/export/csv', authenticateToken, propertyController.exportCsv);
router.get('/detail/:id', authenticateToken, propertyController.getById);
router.get('/:slug', propertyController.getBySlug);

router.post('/', authenticateToken, propertyController.create);
router.post('/bulk-price-update', authenticateToken, csvUpload.single('file'), propertyController.bulkPriceUpdate);
router.put('/:id', authenticateToken, propertyController.update);
router.delete('/:id', authenticateToken, propertyController.remove);
router.post('/:id/images', authenticateToken, upload.array('images', 20), propertyController.uploadImages);
router.delete('/:id/images/:imageId', authenticateToken, propertyController.deleteImage);
router.put('/:id/images/:imageId/cover', authenticateToken, propertyController.setCoverImage);
router.put('/:id/images/reorder', authenticateToken, propertyController.reorderImages);

module.exports = router;
