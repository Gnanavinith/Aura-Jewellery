import mongoose from 'mongoose';

const invoiceCounterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['GOLD', 'SILVER', 'DIAMOND'],
      required: true
    },
    currentNumber: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: false
  }
);

// Ensure unique combination of year and type
invoiceCounterSchema.index({ year: 1, type: 1 }, { unique: true });

const InvoiceCounter = mongoose.model('InvoiceCounter', invoiceCounterSchema);

export default InvoiceCounter;
