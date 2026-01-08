const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    category: { type: String, required: true },
    weight: { type: Number, required: true },
    rate: { type: Number, required: true },
    metalPrice: { type: Number, required: true },
    wastagePercent: { type: Number, required: true },
    wastageAmount: { type: Number, required: true },
    makingCharge: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    gstPercent: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
});

const billSchema = new mongoose.Schema({
    billNumber: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String },
    items: [billItemSchema],
    totalMetalPrice: { type: Number, required: true },
    totalWastage: { type: Number, required: true },
    totalMakingCharge: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    totalGst: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    metalType: { type: String, enum: ['GOLD', 'SILVER', 'DIAMOND'], required: true },
    type: { type: String, enum: ['Bill', 'Estimate'], default: 'Bill' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Paid' },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'], default: 'Cash' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
