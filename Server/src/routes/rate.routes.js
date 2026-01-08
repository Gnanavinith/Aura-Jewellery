const express = require('express');
const { getTodayRate, getAllRates, createOrUpdateRate, updateGstWastage } = require('../controllers/rate.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/today', getTodayRate);
router.get('/', protect, getAllRates);
router.post('/', protect, admin, createOrUpdateRate);
router.patch('/settings', protect, admin, updateGstWastage);

module.exports = router;
