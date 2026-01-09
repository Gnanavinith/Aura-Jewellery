import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  updateStock
} from '../controllers/product.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/products/stats
 * @desc    Get product statistics
 * @access  Protected
 */
router.get('/stats', protect, getProductStats);

/**
 * @route   GET /api/products
 * @desc    Get all active products
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Admin
 */
router.post('/', protect, admin, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.put('/:id', protect, admin, updateProduct);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock
 * @access  Admin
 */
router.patch('/:id/stock', protect, admin, updateStock);

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete product
 * @access  Admin
 */
router.delete('/:id', protect, admin, deleteProduct);

export default router;
