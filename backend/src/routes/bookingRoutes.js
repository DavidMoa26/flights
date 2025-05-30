import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingByReference,
  cancelBooking,
  getUserBookings
} from '../controllers/bookingController.js';

const router = express.Router();

// POST /api/bookings - Create a new booking
router.post('/', createBooking);

// GET /api/bookings - Get all bookings (admin) or user bookings by email
router.get('/', (req, res) => {
  if (req.query.email) {
    return getUserBookings(req, res);
  }
  return getAllBookings(req, res);
});

// GET /api/bookings/reference/:reference - Get booking by reference number
router.get('/reference/:reference', getBookingByReference);

// GET /api/bookings/:id - Get a single booking by ID
router.get('/:id', getBookingById);

// PUT /api/bookings/:id/cancel - Cancel a booking
router.put('/:id/cancel', cancelBooking);

export default router;