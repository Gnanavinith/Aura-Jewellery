import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true
    },
    category: {
      type: String,
      enum: ['Gold', 'Silver', 'Diamond'],
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    makingCharge: {
      type: Number,
      default: 0
    },
    wastage: {
      type: Number,
      default: 8
    },
    stock: {
      type: Number,
      default: 0
    },
    minStock: {
      type: Number,
      default: 5
    },
    gst: {
      type: Number,
      default: 3
    },
    customRate: {
      type: Number,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
