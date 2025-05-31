import { Flight, sequelize } from './models.js';
import dotenv from 'dotenv';

dotenv.config();

// All flights are on June 15, change it if date exeds (Find and replalce -06- with -07- or -08- etc.)
const sampleFlights = [
  {
    flightNumber: 'AA101',
    airline: 'American Airlines',
    origin: 'New York',
    destination: 'Los Angeles',
    departureTime: new Date('2025-06-15T08:00:00Z'),
    arrivalTime: new Date('2025-06-15T14:30:00Z'),
    duration: 390, // 6.5 hours
    price: 299.99,
    totalSeats: 180,
    availableSeats: 45,
    aircraft: 'Boeing 737-800'
  },
  {
    flightNumber: 'DL205',
    airline: 'Delta Air Lines',
    origin: 'New York',
    destination: 'Miami',
    departureTime: new Date('2025-06-15T10:30:00Z'),
    arrivalTime: new Date('2025-06-15T13:45:00Z'),
    duration: 195, // 3.25 hours
    price: 189.99,
    totalSeats: 160,
    availableSeats: 78,
    aircraft: 'Airbus A320'
  },
  {
    flightNumber: 'UA350',
    airline: 'United Airlines',
    origin: 'Chicago',
    destination: 'San Francisco',
    departureTime: new Date('2025-06-15T14:15:00Z'),
    arrivalTime: new Date('2025-06-15T17:45:00Z'),
    duration: 270, // 4.5 hours
    price: 349.99,
    totalSeats: 200,
    availableSeats: 92,
    aircraft: 'Boeing 777-200'
  },
  {
    flightNumber: 'SW420',
    airline: 'Southwest Airlines',
    origin: 'Dallas',
    destination: 'Las Vegas',
    departureTime: new Date('2025-06-15T16:00:00Z'),
    arrivalTime: new Date('2025-06-15T17:30:00Z'),
    duration: 150, // 2.5 hours
    price: 159.99,
    totalSeats: 143,
    availableSeats: 67,
    aircraft: 'Boeing 737-700'
  },
  {
    flightNumber: 'JB180',
    airline: 'JetBlue Airways',
    origin: 'Boston',
    destination: 'Orlando',
    departureTime: new Date('2025-06-15T09:45:00Z'),
    arrivalTime: new Date('2025-06-15T13:00:00Z'),
    duration: 195, // 3.25 hours
    price: 219.99,
    totalSeats: 150,
    availableSeats: 34,
    aircraft: 'Airbus A320'
  },
  {
    flightNumber: 'AS675',
    airline: 'Alaska Airlines',
    origin: 'Seattle',
    destination: 'Anchorage',
    departureTime: new Date('2025-06-15T11:20:00Z'),
    arrivalTime: new Date('2025-06-15T15:45:00Z'),
    duration: 205, // 3.4 hours
    price: 389.99,
    totalSeats: 124,
    availableSeats: 18,
    aircraft: 'Boeing 737-900'
  },
  {
    flightNumber: 'F9810',
    airline: 'Frontier Airlines',
    origin: 'Denver',
    destination: 'Phoenix',
    departureTime: new Date('2025-06-15T13:30:00Z'),
    arrivalTime: new Date('2025-06-15T15:15:00Z'),
    duration: 105, // 1.75 hours
    price: 129.99,
    totalSeats: 186,
    availableSeats: 142,
    aircraft: 'Airbus A320neo'
  },
  {
    flightNumber: 'NK522',
    airline: 'Spirit Airlines',
    origin: 'Fort Lauderdale',
    destination: 'Atlanta',
    departureTime: new Date('2025-06-15T17:00:00Z'),
    arrivalTime: new Date('2025-06-15T19:30:00Z'),
    duration: 150, // 2.5 hours
    price: 99.99,
    totalSeats: 178,
    availableSeats: 89,
    aircraft: 'Airbus A321'
  },
  {
    flightNumber: 'HA455',
    airline: 'Hawaiian Airlines',
    origin: 'Los Angeles',
    destination: 'Honolulu',
    departureTime: new Date('2025-06-15T22:30:00Z'),
    arrivalTime: new Date('2025-06-16T01:45:00Z'),
    duration: 315, // 5.25 hours
    price: 459.99,
    totalSeats: 294,
    availableSeats: 156,
    aircraft: 'Airbus A330-200'
  },
  {
    flightNumber: 'B6742',
    airline: 'JetBlue Airways',
    origin: 'Los Angeles',
    destination: 'New York',
    departureTime: new Date('2025-06-16T06:00:00Z'),
    arrivalTime: new Date('2025-06-16T14:30:00Z'),
    duration: 330, // 5.5 hours
    price: 329.99,
    totalSeats: 150,
    availableSeats: 72,
    aircraft: 'Airbus A321'
  },
  // Add more flights for different dates
  {
    flightNumber: 'AA202',
    airline: 'American Airlines',
    origin: 'Miami',
    destination: 'New York',
    departureTime: new Date('2025-06-16T08:15:00Z'),
    arrivalTime: new Date('2025-06-16T11:30:00Z'),
    duration: 195,
    price: 249.99,
    totalSeats: 160,
    availableSeats: 87,
    aircraft: 'Boeing 737-800'
  },
  {
    flightNumber: 'DL390',
    airline: 'Delta Air Lines',
    origin: 'Atlanta',
    destination: 'Los Angeles',
    departureTime: new Date('2025-06-16T12:45:00Z'),
    arrivalTime: new Date('2025-06-16T15:20:00Z'),
    duration: 275,
    price: 379.99,
    totalSeats: 200,
    availableSeats: 103,
    aircraft: 'Boeing 767-300'
  },
  {
    flightNumber: 'UA520',
    airline: 'United Airlines',
    origin: 'San Francisco',
    destination: 'Chicago',
    departureTime: new Date('2025-06-16T18:30:00Z'),
    arrivalTime: new Date('2025-06-17T00:45:00Z'),
    duration: 255,
    price: 299.99,
    totalSeats: 180,
    availableSeats: 65,
    aircraft: 'Boeing 737 MAX 9'
  },
  {
    flightNumber: 'SW115',
    airline: 'Southwest Airlines',
    origin: 'Las Vegas',
    destination: 'Dallas',
    departureTime: new Date('2025-06-16T20:00:00Z'),
    arrivalTime: new Date('2025-06-17T01:15:00Z'),
    duration: 135,
    price: 179.99,
    totalSeats: 143,
    availableSeats: 98,
    aircraft: 'Boeing 737-800'
  },
  {
    flightNumber: 'AS240',
    airline: 'Alaska Airlines',
    origin: 'Portland',
    destination: 'Los Angeles',
    departureTime: new Date('2025-06-17T07:30:00Z'),
    arrivalTime: new Date('2025-06-17T09:45:00Z'),
    duration: 135,
    price: 199.99,
    totalSeats: 124,
    availableSeats: 76,
    aircraft: 'Boeing 737-900'
  }
];

export const seedDatabase = async () => {
  try {
    // Add connection retry logic
    console.log('🌱 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Sync database (recreate tables)
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');
    
    // Insert sample flights data
    console.log('📝 Inserting sample flights...');
    const flights = await Flight.bulkCreate(sampleFlights);
    console.log(`✅ Successfully created ${flights.length} flights`);
    
    // Log some sample data
    console.log('📊 Sample flights created:');
    flights.slice(0, 3).forEach(flight => {
      console.log(`   ${flight.flightNumber}: ${flight.origin} → ${flight.destination} ($${flight.price})`);
    });
    
    console.log('🌱 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}