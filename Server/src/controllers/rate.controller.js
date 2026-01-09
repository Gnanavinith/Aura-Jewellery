import Rate from '../models/Rate.model.js';

export const getTodayRate = async (req, res) => {
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
      return res.status(404).json({ message: 'No rates found' });
    }

    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllRates = async (req, res) => {
  try {
    const rates = await Rate.find().sort({ effectiveDate: -1 }).limit(30);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateRate = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let rate = await Rate.findOne({
      effectiveDate: { $gte: todayStart }
    });

    if (rate) {
      Object.assign(rate, req.body);
      await rate.save();
    } else {
      rate = await Rate.create({
        ...req.body,
        effectiveDate: new Date()
      });
    }

    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGstWastage = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const rate = await Rate.findOne({
      effectiveDate: { $gte: todayStart }
    });

    if (!rate) {
      return res.status(404).json({ message: 'No rate found for today' });
    }

    if (req.body.gst !== undefined) rate.gst = req.body.gst;
    if (req.body.defaultWastage !== undefined) rate.defaultWastage = req.body.defaultWastage;

    await rate.save();
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
