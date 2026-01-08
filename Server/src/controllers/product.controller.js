const Product = require('../models/Product.model');
const Rate = require('../models/Rate.model');

const getProducts = async (req, res) => {
    try {
        const { category, lowStock } = req.query;
        let query = { isActive: true };
        
        if (category) query.category = category;
        if (lowStock === 'true') {
            query.$expr = { $lte: ['$stock', '$minStock'] };
        }
        
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, barcode, category, weight, makingCharge, wastage, stock, minStock, gst, customRate } = req.body;
        
        const product = await Product.create({
            name,
            barcode,
            category,
            weight,
            makingCharge: makingCharge || 0,
            wastage: wastage || 8,
            stock: stock || 0,
            minStock: minStock || 5,
            gst: gst || 3,
            customRate
        });
        
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });
        const goldStock = await Product.countDocuments({ category: 'Gold', isActive: true });
        const silverStock = await Product.countDocuments({ category: 'Silver', isActive: true });
        const diamondStock = await Product.countDocuments({ category: 'Diamond', isActive: true });
        
        const lowStockProducts = await Product.find({
            isActive: true,
            $expr: { $lte: ['$stock', '$minStock'] }
        }).select('name category stock minStock');
        
        res.json({
            totalProducts,
            goldStock,
            silverStock,
            diamondStock,
            lowStockProducts,
            lowStockCount: lowStockProducts.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
    updateStock
};
