import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import { sequelize, Flight } from '../src/data-access/models.js';

describe('Flight API', () => {
  let testFlight;

  before(async function() {
    this.timeout(15000);
    
    try {
      console.log('🧪 Setting up flight test database...');
      
      // Clean database including enum types
      await sequelize.drop({ cascade: true });
      console.log('✅ Flight test database cleaned');
      
      // Sync database
      await sequelize.sync({ force: true });
      console.log('✅ Flight test database synchronized');
      
      // Create test flight
      testFlight = await Flight.create({
        flightNumber: 'FL001',
        airline: 'Test Airways',
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
      
      console.log('✅ Test flight created');
    } catch (error) {
      console.error('❌ Flight test setup failed:', error);
      throw error;
    }
  });

  after(async function() {
    this.timeout(10000);
    
    try {
      console.log('🧹 Cleaning up flight test database...');
      await sequelize.drop({ cascade: true });
      await sequelize.close();
      console.log('✅ Flight test cleanup completed');
    } catch (error) {
      console.error('❌ Flight test cleanup failed:', error);
    }
  });

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
    it('should get a specific flight by ID', async () => {
      const res = await request(app).get(`/api/flights/${testFlight.id}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id', testFlight.id);
      expect(res.body).to.have.property('flightNumber', 'FL001');
      expect(res.body).to.have.property('airline', 'Test Airways');
    });

    it('should return 404 for non-existent flight', async () => {
      const res = await request(app).get('/api/flights/123e4567-e89b-12d3-a456-426614174000');
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'Flight not found');
    });
  });

  describe('POST /api/flights', () => {
    it('should create a new flight', async () => {
      const newFlight = {
        flightNumber: 'FL002',
        airline: 'Test Airways',
        origin: 'Chicago',
        destination: 'Miami',
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 48 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        duration: 180,
        price: 199.99,
        totalSeats: 120
      };

      const res = await request(app)
        .post('/api/flights')
        .send(newFlight);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('flightNumber', 'FL002');
      expect(res.body).to.have.property('availableSeats', 120);
      expect(res.body).to.have.property('price', '199.99');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        flightNumber: 'FL003',
        airline: 'Test Airways'
        // Missing origin, destination, times, etc.
      };

      const res = await request(app)
        .post('/api/flights')
        .send(incompleteData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Missing required fields');
    });

    it('should return 400 for duplicate flight number', async () => {
      const duplicateFlight = {
        flightNumber: 'FL001', // Same as testFlight
        airline: 'Another Airline',
        origin: 'Boston',
        destination: 'Seattle',
        departureTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 72 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        duration: 240,
        price: 350.00,
        totalSeats: 180
      };

      const res = await request(app)
        .post('/api/flights')
        .send(duplicateFlight);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });
  });

  describe('GET /api/flights/search', () => {
    it('should search flights with query parameters', async () => {
      const res = await request(app)
        .get('/api/flights/search')
        .query({
          origin: 'New York',
          destination: 'Los Angeles',
          departureDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('flights');
      expect(res.body.flights).to.be.an('array');
    });

    it('should return empty results for no matching flights', async () => {
      const res = await request(app)
        .get('/api/flights/search')
        .query({
          origin: 'NonExistent',
          destination: 'AlsoNonExistent',
          departureDate: '2025-12-31'
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('flights');
      expect(res.body.flights).to.be.an('array').that.is.empty;
    });
  });

  describe('GET /api/flights/popular-destinations', () => {
    it('should get popular destinations', async () => {
      const res = await request(app).get('/api/flights/popular-destinations');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });
});