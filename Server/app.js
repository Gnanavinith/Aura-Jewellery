const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const rateRoutes = require('./src/routes/rate.routes');
const billRoutes = require('./src/routes/bill.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/bills', billRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Aura Jewellary API is running...');
});

module.exports = app;
