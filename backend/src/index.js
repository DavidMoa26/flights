import dotenv from 'dotenv';
import { sequelize } from './data-access/database.js';
import app from './app.js';
import { seedDatabase } from './data-access/seed.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
   
    // Sync database models
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');

    // Run seeding if flag is set
    if (process.env.RUN_SEED === 'true') {
      console.log('🌱 Running database seeding...');
      try {
        await seedDatabase();
        console.log('✅ Database seeding completed!');
      } catch (seedError) {
        console.log('⚠️ Seeding failed, but continuing:', seedError.message);
      }
    }
   
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();