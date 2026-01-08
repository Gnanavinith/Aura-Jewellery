const express = require('express');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductStats, updateStock } = require('../controllers/product.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/stats', protect, getProductStats);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.patch('/:id/stock', protect, admin, updateStock);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
