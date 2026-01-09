import express from 'express';
import {
  createBill,
  getBills,
  getBillById,
  getTodaySales,
  calculateEstimate
} from '../controllers/bill.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/today-sales', protect, getTodaySales);
router.post('/estimate', protect, calculateEstimate);
router.get('/', protect, getBills);
router.get('/:id', protect, getBillById);
router.post('/', protect, createBill);

export default router;
