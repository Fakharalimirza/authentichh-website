const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', propertyController.getAll);
router.get('/published', propertyController.getPublished);
router.get('/featured', propertyController.getFeatured);
router.get('/:slug', propertyController.getBySlug);

router.post('/', authenticateToken, propertyController.create);
router.put('/:id', authenticateToken, propertyController.update);
router.delete('/:id', authenticateToken, propertyController.remove);
router.post('/:id/images', authenticateToken, upload.array('images', 20), propertyController.uploadImages);
router.delete('/:id/images/:imageId', authenticateToken, propertyController.deleteImage);
router.put('/:id/images/:imageId/cover', authenticateToken, propertyController.setCoverImage);
router.put('/:id/images/reorder', authenticateToken, propertyController.reorderImages);

module.exports = router;
