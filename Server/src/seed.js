const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User.model');
const Rate = require('./models/Rate.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aura-jewellary';

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
        if (!existingAdmin) {
            await User.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: 'Admin123',
                role: 'admin'
            });
            console.log('Admin user created: admin@gmail.com / Admin123');
        } else {
            console.log('Admin user already exists');
        }

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
            console.log('Default rates created');
        } else {
            console.log('Today\'s rates already exist');
        }

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
