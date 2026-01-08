const Bill = require('../models/Bill.model');
const Product = require('../models/Product.model');
const Rate = require('../models/Rate.model');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');

const calculateItemPrice = (weight, rate, wastage, makingCharge, gst, quantity) => {
    const metalPrice = weight * rate * quantity;
    const wastageAmount = metalPrice * (wastage / 100);
    const subtotal = metalPrice + wastageAmount + (makingCharge * quantity);
    const gstAmount = subtotal * (gst / 100);
    const total = subtotal + gstAmount;

    return {
        metalPrice: Math.round(metalPrice * 100) / 100,
        wastageAmount: Math.round(wastageAmount * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        gstAmount: Math.round(gstAmount * 100) / 100,
        total: Math.round(total * 100) / 100
    };
};

const createBill = async (req, res) => {
    try {
        const { customerName, customerPhone, items, discount, paymentStatus, paymentMethod, type = 'Bill' } = req.body;
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const currentRate = await Rate.findOne({ effectiveDate: { $gte: todayStart } }).sort({ effectiveDate: -1 })
            || await Rate.findOne().sort({ effectiveDate: -1 });
        
        if (!currentRate) {
            return res.status(400).json({ message: 'Please set today\'s rates first' });
        }
        
        let processedItems = [];
        let totalMetalPrice = 0;
        let totalWastage = 0;
        let totalMakingCharge = 0;
        let totalGst = 0;
        
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.productId}` });
            }
            
            if (type === 'Bill' && product.stock < (item.quantity || 1)) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
            
            let rate;
            if (product.customRate) {
                rate = product.customRate;
            } else if (product.category === 'Gold') {
                rate = currentRate.goldRate;
            } else if (product.category === 'Silver') {
                rate = currentRate.silverRate;
            } else {
                rate = currentRate.diamondRate;
            }
            
            const quantity = item.quantity || 1;
            const wastagePercent = item.wastage || product.wastage;
            const gstPercent = item.gst || product.gst;
            const makingCharge = item.makingCharge || product.makingCharge;
            
            const calc = calculateItemPrice(
                product.weight,
                rate,
                wastagePercent,
                makingCharge,
                gstPercent,
                quantity
            );
            
            processedItems.push({
                product: product._id,
                name: product.name,
                category: product.category,
                weight: product.weight,
                rate,
                metalPrice: calc.metalPrice,
                wastagePercent,
                wastageAmount: calc.wastageAmount,
                makingCharge: makingCharge * quantity,
                subtotal: calc.subtotal,
                gstPercent,
                gstAmount: calc.gstAmount,
                total: calc.total,
                quantity
            });
            
            totalMetalPrice += calc.metalPrice;
            totalWastage += calc.wastageAmount;
            totalMakingCharge += makingCharge * quantity;
            totalGst += calc.gstAmount;
            
            // ONLY reduce stock if it's a real Bill, NOT for Estimates
            if (type === 'Bill') {
                product.stock -= quantity;
                await product.save();
            }
        }
        
        const subtotal = totalMetalPrice + totalWastage + totalMakingCharge;
        const grandTotal = subtotal + totalGst - (discount || 0);
        
        // Determine metal type for invoice numbering (based on first item)
        const mainItem = await Product.findById(items[0].productId);
        const metalType = mainItem.category.toUpperCase();
        
        const billNumber = await generateInvoiceNumber(metalType, type === 'Estimate');
        
        const bill = await Bill.create({
            billNumber,
            customerName: customerName || 'Walk-in Customer',
            customerPhone,
            items: processedItems,
            totalMetalPrice: Math.round(totalMetalPrice * 100) / 100,
            totalWastage: Math.round(totalWastage * 100) / 100,
            totalMakingCharge: Math.round(totalMakingCharge * 100) / 100,
            subtotal: Math.round(subtotal * 100) / 100,
            totalGst: Math.round(totalGst * 100) / 100,
            discount: discount || 0,
            grandTotal: Math.round(grandTotal * 100) / 100,
            metalType,
            type,
            paymentStatus: type === 'Estimate' ? 'Pending' : (paymentStatus || 'Paid'),
            paymentMethod: paymentMethod || 'Cash',
            user: req.user.id
        });
        
        res.status(201).json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBills = async (req, res) => {
    try {
        const { startDate, endDate, status, type } = req.query;
        let query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (status) query.paymentStatus = status;
        if (type) query.type = type;
        
        const bills = await Bill.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json(bills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product');
        
        if (!bill) return res.status(404).json({ message: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTodaySales = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const result = await Bill.aggregate([
            {
                $match: {
                    createdAt: { $gte: todayStart, $lte: todayEnd },
                    type: 'Bill',
                    paymentStatus: { $in: ['Paid', 'Partial'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$grandTotal' },
                    billCount: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            totalSales: result[0]?.totalSales || 0,
            billCount: result[0]?.billCount || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const calculateEstimate = async (req, res) => {
    try {
        const { productId, quantity, customWastage, customGst, customMakingCharge } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const currentRate = await Rate.findOne({ effectiveDate: { $gte: todayStart } }).sort({ effectiveDate: -1 })
            || await Rate.findOne().sort({ effectiveDate: -1 });
        
        if (!currentRate) {
            return res.status(400).json({ message: 'Please set today\'s rates first' });
        }
        
        let rate;
        if (product.customRate) {
            rate = product.customRate;
        } else if (product.category === 'Gold') {
            rate = currentRate.goldRate;
        } else if (product.category === 'Silver') {
            rate = currentRate.silverRate;
        } else {
            rate = currentRate.diamondRate;
        }
        
        const wastagePercent = customWastage !== undefined ? customWastage : product.wastage;
        const gstPercent = customGst !== undefined ? customGst : product.gst;
        const makingCharge = customMakingCharge !== undefined ? customMakingCharge : product.makingCharge;
        
        const calc = calculateItemPrice(
            product.weight,
            rate,
            wastagePercent,
            makingCharge,
            gstPercent,
            quantity || 1
        );
        
        res.json({
            product: {
                name: product.name,
                category: product.category,
                weight: product.weight
            },
            rate,
            wastagePercent,
            gstPercent,
            makingCharge,
            quantity: quantity || 1,
            ...calc
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBill,
    getBills,
    getBillById,
    getTodaySales,
    calculateEstimate
};
