const Rate = require('../models/Rate.model');

const getTodayRate = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        let rate = await Rate.findOne({
            effectiveDate: { $gte: todayStart }
        }).sort({ effectiveDate: -1 });
        
        if (!rate) {
            rate = await Rate.findOne().sort({ effectiveDate: -1 });
        }
        
        if (!rate) {
            return res.status(404).json({ message: 'No rates found. Please set rates.' });
        }
        
        res.json(rate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllRates = async (req, res) => {
    try {
        const rates = await Rate.find().sort({ effectiveDate: -1 }).limit(30);
        res.json(rates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOrUpdateRate = async (req, res) => {
    try {
        const { goldRate, silverRate, diamondRate, gst, defaultWastage } = req.body;
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        let rate = await Rate.findOne({
            effectiveDate: { $gte: todayStart }
        });
        
        if (rate) {
            rate.goldRate = goldRate;
            rate.silverRate = silverRate;
            rate.diamondRate = diamondRate;
            rate.gst = gst || rate.gst;
            rate.defaultWastage = defaultWastage || rate.defaultWastage;
            await rate.save();
        } else {
            rate = await Rate.create({
                goldRate,
                silverRate,
                diamondRate,
                gst: gst || 3,
                defaultWastage: defaultWastage || 8,
                location: 'Coimbatore',
                effectiveDate: new Date()
            });
        }
        
        res.json(rate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGstWastage = async (req, res) => {
    try {
        const { gst, defaultWastage } = req.body;
        
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const rate = await Rate.findOne({
            effectiveDate: { $gte: todayStart }
        });
        
        if (!rate) {
            return res.status(404).json({ message: 'No rate found for today' });
        }
        
        if (gst !== undefined) rate.gst = gst;
        if (defaultWastage !== undefined) rate.defaultWastage = defaultWastage;
        await rate.save();
        
        res.json(rate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTodayRate,
    getAllRates,
    createOrUpdateRate,
    updateGstWastage
};
