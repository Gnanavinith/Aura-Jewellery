import mongoose from 'mongoose';

const rateSchema = new mongoose.Schema(
  {
    goldRate: {
      type: Number,
      required: true
    },
    silverRate: {
      type: Number,
      required: true
    },
    diamondRate: {
      type: Number,
      required: true
    },
    gst: {
      type: Number,
      default: 3
    },
    defaultWastage: {
      type: Number,
      default: 8
    },
    location: {
      type: String,
      default: 'Coimbatore'
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Rate = mongoose.model('Rate', rateSchema);

export default Rate;
