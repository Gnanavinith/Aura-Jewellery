import InvoiceCounter from '../models/InvoiceCounter.model.js';

/**
 * Generates a professional invoice number based on metal type and year.
 * Format:
 *  - Bill: AJ-{TYPE}-{YEAR}-{RUNNING_NUMBER}
 *  - Estimate: EST-{TYPE}-{YEAR}-{RUNNING_NUMBER}
 *
 * @param {string} metalType - GOLD, SILVER, or DIAMOND
 * @param {boolean} isEstimate - Whether it's an estimate
 * @returns {Promise<string>}
 */
export const generateInvoiceNumber = async (metalType, isEstimate = false) => {
  const type = metalType.toUpperCase();
  const year = new Date().getFullYear();

  const counter = await InvoiceCounter.findOneAndUpdate(
    { year, type },
    { $inc: { currentNumber: 1 } },
    {
      new: true,
      upsert: true
    }
  );

  const prefix = isEstimate ? 'EST' : 'AJ';
  const paddedNumber = String(counter.currentNumber).padStart(4, '0');

  return `${prefix}-${type}-${year}-${paddedNumber}`;
};
