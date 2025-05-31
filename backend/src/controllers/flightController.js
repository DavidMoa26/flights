import { Flight, Booking, sequelize } from '../data-access/models.js';
import { Op } from 'sequelize';

// Get all flights with optional filtering
export const getFlights = async (req, res) => {
  try {
    const { 
      origin, 
      destination, 
      departureDate, 
      passengers = 1,
      page = 1,
      limit = 20  // Increased default limit
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Apply filters only if provided
    if (origin) {
      whereClause.origin = {
        [Op.iLike]: `%${origin}%`
      };
    }

    if (destination) {
      whereClause.destination = {
        [Op.iLike]: `%${destination}%`
      };
    }

    if (departureDate) {
      const startOfDay = new Date(departureDate);
      const endOfDay = new Date(departureDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.departureTime = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }

    // Only show flights with available seats and future departures
    whereClause.availableSeats = {
      [Op.gte]: parseInt(passengers)
    };

    whereClause.departureTime = {
      [Op.gte]: new Date() // Only future flights
    };

    whereClause.status = 'scheduled';

    const { count, rows } = await Flight.findAndCountAll({
      where: whereClause,
      order: [['departureTime', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'numberOfPassengers']
      }]
    });

    res.json({
      flights: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
};

// Get a single flight by ID
export const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;

    const flight = await Flight.findByPk(id, {
      include: [{
        model: Booking,
        as: 'bookings',
        attributes: ['id', 'numberOfPassengers', 'bookingStatus']
      }]
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json(flight);
  } catch (error) {
    console.error('Error fetching flight:', error);
    res.status(500).json({ error: 'Failed to fetch flight' });
  }
};

// Create a new flight (admin function)
export const createFlight = async (req, res) => {
  try {
    const {
      flightNumber,
      airline,
      origin,
      destination,
      departureTime,
      arrivalTime,
      price,
      totalSeats,
      aircraft
    } = req.body;

    // Validate required fields
    if (!flightNumber || !airline || !origin || !destination || !departureTime || !arrivalTime || !price || !totalSeats) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate duration
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const duration = Math.round((arrival - departure) / (1000 * 60)); // Duration in minutes

    const flight = await Flight.create({
      flightNumber,
      airline,
      origin,
      destination,
      departureTime,
      arrivalTime,
      duration,
      price,
      totalSeats,
      availableSeats: totalSeats,
      aircraft: aircraft || null
    });

    res.status(201).json(flight);
  } catch (error) {
    console.error('Error creating flight:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Flight number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create flight' });
    }
  }
};

// Update flight availability (used internally when booking)
export const updateFlightAvailability = async (flightId, seatsBooked) => {
  const flight = await Flight.findByPk(flightId);
  if (!flight) {
    throw new Error('Flight not found');
  }
  if (flight.availableSeats < seatsBooked) {
    throw new Error('Not enough available seats');
  }
  await flight.update({
    availableSeats: flight.availableSeats - seatsBooked
  });
  return flight;
};

// Get popular routes (Origin -> Destination)
export const getPopularDestinations = async (req, res) => {
  try {
    const popularRoutes = await Flight.findAll({
      attributes: [
        'origin',
        'destination',
        [sequelize.fn('COUNT', sequelize.literal('*')), 'flight_count'],
        [sequelize.fn('MIN', sequelize.col('price')), 'min_price'],
        [sequelize.fn('MAX', sequelize.col('price')), 'max_price']
      ],
      where: {
        status: 'scheduled',
        departureTime: {
          [Op.gte]: new Date()
        }
      },
      group: ['origin', 'destination'],
      order: [[sequelize.col('flight_count'), 'DESC']],
      limit: 10
    });

    res.json(popularRoutes);
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    res.status(500).json({ error: 'Failed to fetch popular routes' });
  }
};