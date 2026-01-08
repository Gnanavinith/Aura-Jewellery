const express = require('express');
const Category = require('../models/Category.model');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, admin, async (req, res) => {
    try {
        const category = new Category(req.body);
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
