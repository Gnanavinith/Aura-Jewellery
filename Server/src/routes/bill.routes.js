const express = require('express');
const { createBill, getBills, getBillById, getTodaySales, calculateEstimate } = require('../controllers/bill.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/today-sales', protect, getTodaySales);
router.post('/estimate', protect, calculateEstimate);
router.get('/', protect, getBills);
router.get('/:id', protect, getBillById);
router.post('/', protect, createBill);

module.exports = router;
