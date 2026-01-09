import express from 'express';
import {
  getTodayRate,
  getAllRates,
  createOrUpdateRate,
  updateGstWastage
} from '../controllers/rate.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/rates/today
 * @desc    Get today's rate
 * @access  Public
 */
router.get('/today', getTodayRate);

/**
 * @route   GET /api/rates
 * @desc    Get rate history
 * @access  Protected
 */
router.get('/', protect, getAllRates);

/**
 * @route   POST /api/rates
 * @desc    Create or update today's rate
 * @access  Admin
 */
router.post('/', protect, admin, createOrUpdateRate);

/**
 * @route   PATCH /api/rates/settings
 * @desc    Update GST & default wastage
 * @access  Admin
 */
router.patch('/settings', protect, admin, updateGstWastage);

export default router;
