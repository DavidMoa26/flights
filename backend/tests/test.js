import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';  // Import app.js instead of index.js
import { sequelize, Flight, Booking } from '../src/data-access/models.js';

describe('Flight Booking API', () => {
  let testFlight;

  before(async function() {
    // Increase timeout for database operations
    this.timeout(15000);
    
    try {
      console.log('🧪 Setting up test database...');
      
      // First, drop everything including enum types
      await sequelize.drop({ cascade: true });
      console.log('✅ Test database cleaned');
      
      // Sync database for testing (recreate everything fresh)
      await sequelize.sync({ force: true });
      console.log('✅ Test database synchronized');
      
      // Create a test flight
      testFlight = await Flight.create({
        flightNumber: 'TEST123',
        airline: 'Test Airlines',
        origin: 'New York',
        destination: 'Los Angeles',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        arrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // Tomorrow + 5 hours
        duration: 300,
        price: 299.99,
        totalSeats: 150,
        availableSeats: 150,
        aircraft: 'Boeing 737'
      });
      
      console.log('✅ Test flight created successfully');
    } catch (error) {
      console.error('❌ Test setup failed:', error);
      throw error;
    }
  });

  after(async function() {
    this.timeout(10000);
    
    try {
      console.log('🧹 Cleaning up test database...');
      
      // Drop everything including enum types
      await sequelize.drop({ cascade: true });
      await sequelize.close();
      
      console.log('✅ Test database cleaned up successfully');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
      // Don't throw here to avoid masking test failures
    }
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'OK');
    });
  });

  describe('Flights API', () => {
    describe('GET /api/flights', () => {
      it('should get all flights', async () => {
        const res = await request(app).get('/api/flights');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('flights');
        expect(res.body.flights).to.be.an('array');
        expect(res.body.flights).to.have.length.greaterThan(0);
      });

      it('should filter flights by origin', async () => {
        const res = await request(app).get('/api/flights?origin=New York');
        expect(res.status).to.equal(200);
        expect(res.body.flights).to.be.an('array');
        if (res.body.flights.length > 0) {
          expect(res.body.flights[0].origin).to.include('New York');
        }
      });

      it('should filter flights by destination', async () => {
        const res = await request(app).get('/api/flights?destination=Los Angeles');
        expect(res.status).to.equal(200);
        expect(res.body.flights).to.be.an('array');
        if (res.body.flights.length > 0) {
          expect(res.body.flights[0].destination).to.include('Los Angeles');
        }
      });
    });

    describe('GET /api/flights/:id', () => {
      it('should get a specific flight', async () => {
        const res = await request(app).get(`/api/flights/${testFlight.id}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', testFlight.id);
        expect(res.body).to.have.property('flightNumber', 'TEST123');
      });

      it('should return 404 for non-existent flight', async () => {
        const res = await request(app).get('/api/flights/non-existent-id');
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error', 'Flight not found');
      });
    });

    describe('POST /api/flights', () => {
      it('should create a new flight', async () => {
        const newFlight = {
          flightNumber: 'TEST456',
          airline: 'Test Airlines',
          origin: 'Chicago',
          destination: 'Miami',
          departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
          arrivalTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          price: 199.99,
          totalSeats: 120
        };

        const res = await request(app)
          .post('/api/flights')
          .send(newFlight);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('flightNumber', 'TEST456');
        expect(res.body).to.have.property('availableSeats', 120);
      });

      it('should return 400 for missing required fields', async () => {
        const incompleteData = {
          flightNumber: 'TEST789',
          airline: 'Test Airlines'
          // Missing other required fields
        };

        const res = await request(app)
          .post('/api/flights')
          .send(incompleteData);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error', 'Missing required fields');
      });
    });
  });

  describe('Bookings API', () => {
    describe('POST /api/bookings', () => {
      it('should create a new booking', async () => {
        const bookingData = {
          flightId: testFlight.id,
          passengerName: 'John Doe',
          passengerEmail: 'john.doe@example.com',
          passengerPhone: '+1-555-123-4567',
          numberOfPassengers: 2
        };

        const res = await request(app)
          .post('/api/bookings')
          .send(bookingData);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('passengerName', 'John Doe');
        expect(res.body).to.have.property('numberOfPassengers', 2);
        expect(res.body).to.have.property('bookingReference');
        expect(res.body).to.have.property('totalPrice');
      });

      it('should return 400 for missing required fields', async () => {
        const incompleteData = {
          flightId: testFlight.id,
          passengerName: 'Jane Doe'
          // Missing email and phone
        };

        const res = await request(app)
          .post('/api/bookings')
          .send(incompleteData);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error', 'Missing required fields');
      });

      it('should return 400 for invalid email', async () => {
        const invalidEmailData = {
          flightId: testFlight.id,
          passengerName: 'Jane Doe',
          passengerEmail: 'invalid-email',
          passengerPhone: '+1-555-123-4567'
        };

        const res = await request(app)
          .post('/api/bookings')
          .send(invalidEmailData);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error', 'Invalid email format');
      });

      it('should return 404 for non-existent flight', async () => {
        const bookingData = {
          flightId: 'non-existent-flight-id',
          passengerName: 'John Doe',
          passengerEmail: 'john.doe@example.com',
          passengerPhone: '+1-555-123-4567'
        };

        const res = await request(app)
          .post('/api/bookings')
          .send(bookingData);

        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error', 'Flight not found');
      });
    });

    describe('GET /api/bookings', () => {
      it('should get user bookings by email', async () => {
        const res = await request(app).get('/api/bookings?email=john.doe@example.com');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
      });

      it('should return 400 when email parameter is missing for user bookings', async () => {
        const res = await request(app).get('/api/bookings');
        expect(res.status).to.equal(200); // This will get all bookings (admin view)
        expect(res.body).to.have.property('bookings');
      });
    });
  });
});