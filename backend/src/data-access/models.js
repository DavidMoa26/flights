import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

// Flight Model
export const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  airline: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  aircraft: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'delayed', 'cancelled', 'completed'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'flights',
  timestamps: true
});

// Booking Model
export const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingReference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  passengerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passengerEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passengerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfPassengers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  bookingStatus: {
    type: DataTypes.ENUM('confirmed', 'pending', 'cancelled'),
    defaultValue: 'confirmed'
  },
  seatNumbers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true
});

// Define associations
Flight.hasMany(Booking, {
  foreignKey: 'flightId',
  as: 'bookings'
});

Booking.belongsTo(Flight, {
  foreignKey: 'flightId',
  as: 'flight'
});

// Generate booking reference, changed from ('FB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase()) ESLint
Booking.beforeCreate((booking) => {
  booking.bookingReference = 'FB' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
});

export { sequelize };