const InvoiceCounter = require('../models/InvoiceCounter.model');

/**
 * Generates a professional invoice number based on metal type and year.
 * Format: AJ-{TYPE}-{YEAR}-{RUNNING_NUMBER} or EST-{TYPE}-{YEAR}-{RUNNING_NUMBER} for estimates
 * @param {string} metalType - GOLD, SILVER, or DIAMOND
 * @param {boolean} isEstimate - Whether it's an estimate
 * @returns {Promise<string>}
 */
const generateInvoiceNumber = async (metalType, isEstimate = false) => {
    const type = metalType.toUpperCase();
    const year = new Date().getFullYear();

    let counter = await InvoiceCounter.findOneAndUpdate(
        { year, type },
        { $inc: { currentNumber: 1 } },
        { new: true, upsert: true }
    );

    const prefix = isEstimate ? 'EST' : 'AJ';
    const paddedNumber = String(counter.currentNumber).padStart(4, '0');
    return `${prefix}-${type}-${year}-${paddedNumber}`;
};

module.exports = {
    generateInvoiceNumber
};
