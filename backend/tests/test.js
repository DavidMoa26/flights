import express from 'express';
import FlightsRoutes from '../src/routes/flightsRoutes.js';
import { initDb } from '../src/data-access/db.js';

export const app = express();
app.use(express.json());

app.use('/', FlightsRoutes);

let server = null;
const port = 4000;

export async function startTestServer() {
  try {
    await initDb();
    return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`service running on port ${port}`);
        resolve(server);
      });
      server.on('error', (err) => {
        reject(err);
      });
    });
  } catch (dbErr) {
    return Promise.reject(dbErr);
  }
}
