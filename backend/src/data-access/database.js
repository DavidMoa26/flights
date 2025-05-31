import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

export const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: false, // Disable SSL for local development
    // OR for production with SSL:
    // ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
