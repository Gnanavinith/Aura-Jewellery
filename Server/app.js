import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import rateRoutes from './src/routes/rate.routes.js';
import billRoutes from './src/routes/bill.routes.js';

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

export default app;
