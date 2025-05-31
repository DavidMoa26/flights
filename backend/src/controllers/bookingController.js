import { Booking, Flight } from '../data-access/models.js';
import { updateFlightAvailability } from './flightController.js';
import { sequelize } from '../data-access/database.js';

// Generate unique booking reference
const generateBookingReference = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `FB${timestamp}${random}`;
};

// Create a new booking
export const createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      flightId,
      passengerName,
      passengerEmail,
      passengerPhone,
      numberOfPassengers = 1,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!flightId || !passengerName || !passengerEmail || !passengerPhone) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(passengerEmail)) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate number of passengers
    if (numberOfPassengers < 1 || numberOfPassengers > 9) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Number of passengers must be between 1 and 9' });
    }

    // Get flight details
    const flight = await Flight.findByPk(flightId, { transaction });
    if (!flight) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Check if enough seats are available
    if (flight.availableSeats < numberOfPassengers) {
      await transaction.rollback();
      return res.status(400).json({ 
        error: 'Not enough available seats',
        availableSeats: flight.availableSeats,
        requestedSeats: numberOfPassengers
      });
    }

    // Check if flight is still scheduled
    if (flight.status !== 'scheduled') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Flight is not available for booking' });
    }

    // Calculate total price
    const totalPrice = parseFloat(flight.price) * numberOfPassengers;

    // Generate unique booking reference
    const bookingReference = generateBookingReference();

    // Create booking
    const booking = await Booking.create({
      bookingReference,
      flightId,
      passengerName,
      passengerEmail,
      passengerPhone,
      numberOfPassengers,
      totalPrice,
      specialRequests: specialRequests || null
    }, { transaction });

    // Update flight availability
    await flight.update({
      availableSeats: flight.availableSeats - numberOfPassengers
    }, { transaction });

    await transaction.commit();

    // Fetch complete booking with flight details
    const completeBooking = await Booking.findByPk(booking.id, {
      include: [{
        model: Flight,
        as: 'flight'
      }]
    });

    res.status(201).json(completeBooking);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get all bookings (admin function)
export const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status) {
      whereClause.bookingStatus = status;
    }

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      include: [{
        model: Flight,
        as: 'flight'
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      bookings: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Flight,
        as: 'flight'
      }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Get booking by reference number
export const getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({
      where: { bookingReference: reference },
      include: [{
        model: Flight,
        as: 'flight'
      }]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, { 
      include: [{
        model: Flight,
        as: 'flight'
      }],
      transaction 
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update booking status
    await booking.update({
      bookingStatus: 'cancelled'
    }, { transaction });

    // Restore flight availability
    await booking.flight.update({
      availableSeats: booking.flight.availableSeats + booking.numberOfPassengers
    }, { transaction });

    await transaction.commit();

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: booking
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Get user bookings by email
export const getUserBookings = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const bookings = await Booking.findAll({
      where: { passengerEmail: email },
      include: [{
        model: Flight,
        as: 'flight'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
};