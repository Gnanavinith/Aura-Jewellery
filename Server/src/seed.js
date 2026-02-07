// src/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from './models/User.model.js';
import Rate from './models/Rate.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

export const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB for seeding');

    // ---------- Admin User ----------
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'Admin123', // ✅ PLAIN PASSWORD ONLY
        role: 'admin'
      });

      console.log('✅ Admin created (admin@gmail.com / Admin123)');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // ---------- Today Rate ----------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingRate = await Rate.findOne({
      effectiveDate: { $gte: todayStart }
    });

    if (!existingRate) {
      await Rate.create({
        goldRate: 6200,
        silverRate: 75,
        diamondRate: 50000,
        gst: 3,
        defaultWastage: 8,
        location: 'Coimbatore'
      });

      console.log('✅ Default rates created');
    } else {
      console.log('ℹ️ Today’s rates already exist');
    }

    console.log('🌱 Seeding completed');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};
