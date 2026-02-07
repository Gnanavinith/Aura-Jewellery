import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './src/config/db.js';
import { seedDatabase } from './src/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // 🌱 Seed only when enabled
    if (process.env.SEED_DB === 'true') {
      console.log('🌱 Seeding database...');
      await seedDatabase();
      console.log('✅ Database seeded successfully');
    }

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

