import express from 'express';
import cors from 'cors';
import flightRoutes from './routes/flightRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'SkyBook Flight Booking API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      flights: '/api/flights',
      bookings: '/api/bookings'
    },
    documentation: 'Visit /health for health check'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Flight Booking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;