import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { sequelize, Flight, Booking } from '../src/data-access/models.js';

describe('Booking API', () => {
  let testFlight;
  let testBooking;

  before(async function() {
    this.timeout(15000);
    
    try {
      console.log('🧪 Setting up booking test database...');
      
      // Clean database including enum types
      await sequelize.drop({ cascade: true });
      console.log('✅ Booking test database cleaned');
      
      // Sync database for testing
      await sequelize.sync({ force: true });
      console.log('✅ Booking test database synchronized');
      
      // Create a test flight
      testFlight = await Flight.create({
        flightNumber: 'BK001',
        airline: 'Booking Test Airlines',
        origin: 'New York',
        destination: 'Los Angeles',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        duration: 300,
        price: 299.99,
        totalSeats: 150,
        availableSeats: 150,
        aircraft: 'Boeing 737'
      });
      
      console.log('✅ Test flight for bookings created');
    } catch (error) {
      console.error('❌ Booking test setup failed:', error);
      throw error;
    }
  });

  after(async function() {
    this.timeout(10000);
    
    try {
      console.log('🧹 Cleaning up booking test database...');
      await sequelize.drop({ cascade: true });
      console.log('✅ Booking test cleanup completed');
    } catch (error) {
      console.error('❌ Booking test cleanup failed:', error);
    }
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        flightId: testFlight.id,
        passengerName: 'John Doe',
        passengerEmail: 'john.doe@test.com',
        passengerPhone: '+1-555-123-4567',
        numberOfPassengers: 2,
        specialRequests: 'Window seat preferred'
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('bookingReference');
      expect(res.body.passengerName).to.equal('John Doe');
      expect(res.body.numberOfPassengers).to.equal(2);
      expect(res.body.totalPrice).to.equal('599.98'); // 299.99 * 2
      expect(res.body.specialRequests).to.equal('Window seat preferred');
      expect(res.body.flight).to.have.property('flightNumber', 'BK001');

      testBooking = res.body;
    });

    it('should reduce available seats after booking', async () => {
      const updatedFlight = await Flight.findByPk(testFlight.id);
      expect(updatedFlight.availableSeats).to.equal(148); // 150 - 2
    });

    it('should fail with missing required fields', async () => {
      const incompleteData = {
        flightId: testFlight.id,
        passengerName: 'Jane Doe'
        // Missing email and phone
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(incompleteData);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Missing required fields');
    });

    it('should fail with invalid email', async () => {
      const invalidData = {
        flightId: testFlight.id,
        passengerName: 'Jane Doe',
        passengerEmail: 'invalid-email',
        passengerPhone: '+1-555-123-4567'
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Invalid email format');
    });

    it('should fail when requesting more seats than available', async () => {
      // Create a flight with only 3 available seats
      const lowSeatFlight = await Flight.create({
        flightNumber: 'LOW001',
        airline: 'Low Seat Airlines', 
        origin: 'Boston',
        destination: 'Chicago',
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        duration: 120,
        price: 199.99,
        totalSeats: 10,
        availableSeats: 3, // Only 3 seats available
        aircraft: 'Small Plane'
      });

      const tooManySeats = {
        flightId: lowSeatFlight.id,
        passengerName: 'Jane Doe',
        passengerEmail: 'jane@test.com', 
        passengerPhone: '+1-555-123-4567',
        numberOfPassengers: 5 // More than the 3 available seats
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(tooManySeats);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Not enough available seats');
    });

    it('should fail with non-existent flight', async () => {
      const invalidFlightData = {
        flightId: '123e4567-e89b-12d3-a456-426614174000',
        passengerName: 'Jane Doe',
        passengerEmail: 'jane@test.com',
        passengerPhone: '+1-555-123-4567'
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(invalidFlightData);

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Flight not found');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should get a booking by ID', async () => {
      const res = await request(app)
        .get(`/api/bookings/${testBooking.id}`);

      expect(res.status).to.equal(200);
      expect(res.body.id).to.equal(testBooking.id);
      expect(res.body.passengerName).to.equal('John Doe');
      expect(res.body.flight).to.have.property('flightNumber', 'BK001');
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .get('/api/bookings/123e4567-e89b-12d3-a456-426614174000');

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Booking not found');
    });
  });

  describe('GET /api/bookings/reference/:reference', () => {
    it('should get a booking by reference number', async () => {
      const res = await request(app)
        .get(`/api/bookings/reference/${testBooking.bookingReference}`);

      expect(res.status).to.equal(200);
      expect(res.body.bookingReference).to.equal(testBooking.bookingReference);
      expect(res.body.passengerName).to.equal('John Doe');
    });

    it('should return 404 for non-existent reference', async () => {
      const res = await request(app)
        .get('/api/bookings/reference/INVALID123');

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Booking not found');
    });
  });

  describe('GET /api/bookings (user bookings)', () => {
    it('should get user bookings by email', async () => {
      const res = await request(app)
        .get('/api/bookings?email=john.doe@test.com');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1);
      expect(res.body[0].passengerEmail).to.equal('john.doe@test.com');
    });

    it('should return empty array for email with no bookings', async () => {
      const res = await request(app)
        .get('/api/bookings?email=noemail@test.com');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(0);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should cancel a booking successfully', async () => {
      const res = await request(app)
        .put(`/api/bookings/${testBooking.id}/cancel`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Booking cancelled successfully');
      expect(res.body.booking.bookingStatus).to.equal('cancelled');
    });

    it('should restore flight availability after cancellation', async () => {
      const updatedFlight = await Flight.findByPk(testFlight.id);
      expect(updatedFlight.availableSeats).to.equal(150); // Back to original
    });

    it('should fail to cancel already cancelled booking', async () => {
      const res = await request(app)
        .put(`/api/bookings/${testBooking.id}/cancel`);

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal('Booking is already cancelled');
    });

    it('should return 404 for non-existent booking', async () => {
      const res = await request(app)
        .put('/api/bookings/123e4567-e89b-12d3-a456-426614174000/cancel');

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal('Booking not found');
    });
  });

  describe('Booking reference generation', () => {
    it('should generate unique booking references', async () => {
      const bookingData = {
        flightId: testFlight.id,
        passengerName: 'Test User',
        passengerEmail: 'test@test.com',
        passengerPhone: '+1-555-123-4567'
      };

      const booking1 = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      const booking2 = await request(app)
        .post('/api/bookings')
        .send({
          ...bookingData,
          passengerEmail: 'test2@test.com'
        });

      expect(booking1.body.bookingReference).to.not.equal(booking2.body.bookingReference);
      expect(booking1.body.bookingReference).to.match(/^FB[A-Z0-9]+$/);
      expect(booking2.body.bookingReference).to.match(/^FB[A-Z0-9]+$/);
    });
  });

  describe('Price calculation', () => {
    it('should calculate correct total price for multiple passengers', async () => {
      const bookingData = {
        flightId: testFlight.id,
        passengerName: 'Price Test',
        passengerEmail: 'price@test.com',
        passengerPhone: '+1-555-123-4567',
        numberOfPassengers: 3
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(res.status).to.equal(201);
      const expectedTotal = parseFloat(testFlight.price) * 3;
      expect(parseFloat(res.body.totalPrice)).to.equal(expectedTotal);
    });
  });
});