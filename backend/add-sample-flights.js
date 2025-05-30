import { Flight, sequelize } from './src/data-access/models.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleFlights = [
  {
    flightNumber: 'AA101',
    airline: 'American Airlines',
    origin: 'New York (JFK)',
    destination: 'Los Angeles (LAX)',
    departureTime: new Date('2025-06-01T08:00:00Z'),
    arrivalTime: new Date('2025-06-01T14:30:00Z'),
    duration: 390, // 6.5 hours
    price: 299.99,
    totalSeats: 180,
    availableSeats: 45,
    aircraft: 'Boeing 737-800'
  },
  {
    flightNumber: 'DL205',
    airline: 'Delta Air Lines',
    origin: 'New York (LGA)',
    destination: 'Miami (MIA)',
    departureTime: new Date('2025-06-01T10:30:00Z'),
    arrivalTime: new Date('2025-06-01T13:45:00Z'),
    duration: 195, // 3.25 hours
    price: 189.99,
    totalSeats: 160,
    availableSeats: 78,
    aircraft: 'Airbus A320'
  },
  {
    flightNumber: 'UA350',
    airline: 'United Airlines',
    origin: 'Chicago (ORD)',
    destination: 'San Francisco (SFO)',
    departureTime: new Date('2025-06-01T14:15:00Z'),
    arrivalTime: new Date('2025-06-01T17:45:00Z'),
    duration: 270, // 4.5 hours
    price: 349.99,
    totalSeats: 200,
    availableSeats: 92,
    aircraft: 'Boeing 777-200'
  },
  {
    flightNumber: 'SW420',
    airline: 'Southwest Airlines',
    origin: 'Dallas (DFW)',
    destination: 'Las Vegas (LAS)',
    departureTime: new Date('2025-06-01T16:00:00Z'),
    arrivalTime: new Date('2025-06-01T17:30:00Z'),
    duration: 150, // 2.5 hours
    price: 159.99,
    totalSeats: 143,
    availableSeats: 67,
    aircraft: 'Boeing 737-700'
  },
  {
    flightNumber: 'JB180',
    airline: 'JetBlue Airways',
    origin: 'Boston (BOS)',
    destination: 'Orlando (MCO)',
    departureTime: new Date('2025-06-02T09:45:00Z'),
    arrivalTime: new Date('2025-06-02T13:00:00Z'),
    duration: 195, // 3.25 hours
    price: 219.99,
    totalSeats: 150,
    availableSeats: 34,
    aircraft: 'Airbus A320'
  },
  {
    flightNumber: 'AS675',
    airline: 'Alaska Airlines',
    origin: 'Seattle (SEA)',
    destination: 'Anchorage (ANC)',
    departureTime: new Date('2025-06-02T11:20:00Z'),
    arrivalTime: new Date('2025-06-02T15:45:00Z'),
    duration: 205, // 3.4 hours
    price: 389.99,
    totalSeats: 124,
    availableSeats: 18,
    aircraft: 'Boeing 737-900'
  },
  {
    flightNumber: 'F9810',
    airline: 'Frontier Airlines',
    origin: 'Denver (DEN)',
    destination: 'Phoenix (PHX)',
    departureTime: new Date('2025-06-02T13:30:00Z'),
    arrivalTime: new Date('2025-06-02T15:15:00Z'),
    duration: 105, // 1.75 hours
    price: 129.99,
    totalSeats: 186,
    availableSeats: 142,
    aircraft: 'Airbus A320neo'
  },
  {
    flightNumber: 'NK522',
    airline: 'Spirit Airlines',
    origin: 'Fort Lauderdale (FLL)',
    destination: 'Atlanta (ATL)',
    departureTime: new Date('2025-06-02T17:00:00Z'),
    arrivalTime: new Date('2025-06-02T19:30:00Z'),
    duration: 150, // 2.5 hours
    price: 99.99,
    totalSeats: 178,
    availableSeats: 89,
    aircraft: 'Airbus A321'
  }
];

const addSampleFlights = async () => {
  try {
    console.log('🛫 Adding sample flights to database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    // Check if flights already exist
    const existingFlights = await Flight.count();
    if (existingFlights > 0) {
      console.log(`ℹ️  Database already contains ${existingFlights} flights.`);
      const choice = process.argv.includes('--force');
      if (!choice) {
        console.log('💡 Use --force to add flights anyway');
        console.log('Example: node add-sample-flights.js --force');
        return;
      }
    }
    
    // Create sample flights
    console.log('📝 Creating sample flights...');
    const createdFlights = await Flight.bulkCreate(sampleFlights);
    console.log(`✅ Successfully added ${createdFlights.length} sample flights!`);
    
    console.log('\n🎉 Sample flights added successfully!');
    console.log('🌐 Visit http://localhost:3000 to see them in the frontend');
    
  } catch (error) {
    console.error('❌ Error adding sample flights:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the script
addSampleFlights();