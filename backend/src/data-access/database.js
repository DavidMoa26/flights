import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

export const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false, // Disable logging for production
  dialectOptions: {
    ssl: false
    // ssl: {
    //  require: true,
    //  rejectUnauthorized: false, // Allow self-signed certificates
    //} 
  }
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    // Sync all defined models
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.error('Unable to connect to the products database : ', err);
    throw err;
  }
}
