import 'dotenv/config';
import express, { json } from 'express';
import { initDb } from './data-access/db.js';
import Routes from './routes/flightsRoutes.js';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4006;

app.use(json());
initDb()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

app.use('/', Routes);

app.listen(PORT, () => {
  console.log(`service running on port ${PORT}`);
});
