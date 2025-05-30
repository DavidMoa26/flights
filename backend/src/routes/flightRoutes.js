import express from 'express';
import {
  getFlights,
  getFlightById,
  createFlight,
  getPopularDestinations
} from '../controllers/flightController.js';

const router = express.Router();

// GET /api/flights - Get all flights with filtering
router.get('/', getFlights);

// GET /api/flights/popular-routes - Get popular routes (Origin -> Destination)
//router.get('/popular-routes', getPopularDestinations);

// GET /api/flights/popular-destinations - Legacy endpoint (for compatibility)
router.get('/popular-destinations', getPopularDestinations);

// GET /api/flights/:id - Get a single flight by ID (MUST be last!)
router.get('/:id', getFlightById);

// POST /api/flights - Create a new flight (admin function)
router.post('/', createFlight);

export default router;