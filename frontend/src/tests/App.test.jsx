import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { flightAPI, bookingAPI } from '../services/api';

// Mock the API modules
vi.mock('../services/api', () => ({
  flightAPI: {
    searchFlights: vi.fn(),
    getPopularDestinations: vi.fn(),
  },
  bookingAPI: {
    createBooking: vi.fn(),
    getBookingByReference: vi.fn(),
  },
  utils: {
    formatPrice: (price) => `$${price.toFixed(2)}`,
    formatDate: (date) => new Date(date).toLocaleDateString(),
    formatTime: (date) => new Date(date).toLocaleTimeString(),
    formatDuration: (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    validatePhone: (phone) => /^[+]?[\d\s()-]{10,}$/.test(phone),
  }
}));

// Mock data
const mockFlights = [
  {
    id: '1',
    flightNumber: 'AA101',
    airline: 'American Airlines',
    origin: 'New York',
    destination: 'Los Angeles',
    departureTime: '2025-06-15T08:00:00Z',
    arrivalTime: '2025-06-15T14:30:00Z',
    duration: 390,
    price: 299.99,
    availableSeats: 45,
    totalSeats: 180,
    status: 'scheduled',
    aircraft: 'Boeing 737-800'
  },
  {
    id: '2',
    flightNumber: 'DL205',
    airline: 'Delta Air Lines',
    origin: 'New York',
    destination: 'Miami',
    departureTime: '2025-06-15T10:30:00Z',
    arrivalTime: '2025-06-15T13:45:00Z',
    duration: 195,
    price: 189.99,
    availableSeats: 78,
    totalSeats: 160,
    status: 'scheduled',
    aircraft: 'Airbus A320'
  }
];

const mockBooking = {
  id: 'booking-1',
  bookingReference: 'FB123ABC',
  passengerName: 'John Doe',
  passengerEmail: 'john@example.com',
  passengerPhone: '+1-555-123-4567',
  numberOfPassengers: 2,
  totalPrice: 599.98,
  bookingStatus: 'confirmed',
  flight: mockFlights[0]
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Default mock implementations
    flightAPI.getPopularDestinations.mockResolvedValue([
      { destination: 'Los Angeles', flightCount: 15 },
      { destination: 'Miami', flightCount: 12 }
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the main app with header and search form', () => {
    render(<App />);
    
    // Check for header elements
    expect(screen.getByText('✈️ SkyBook')).toBeInTheDocument();
    expect(screen.getByText('Your Flight Booking Companion')).toBeInTheDocument();
    
    // Check for search form
    expect(screen.getByText('Find Your Perfect Flight')).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByLabelText('Departure Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Passengers')).toBeInTheDocument();
  });

  it('allows user to fill out search form', () => {
    render(<App />);
    
    const originInput = screen.getByLabelText('From');
    const destinationInput = screen.getByLabelText('To');
    const dateInput = screen.getByLabelText('Departure Date');
    const passengersSelect = screen.getByLabelText('Passengers');

    fireEvent.change(originInput, { target: { value: 'New York' } });
    fireEvent.change(destinationInput, { target: { value: 'Los Angeles' } });
    fireEvent.change(dateInput, { target: { value: '2025-06-15' } });
    fireEvent.change(passengersSelect, { target: { value: '2' } });

    expect(originInput.value).toBe('New York');
    expect(destinationInput.value).toBe('Los Angeles');
    expect(dateInput.value).toBe('2025-06-15');
    expect(passengersSelect.value).toBe('2');
  });

  it('performs flight search and displays results', async () => {
    flightAPI.searchFlights.mockResolvedValue({
      flights: mockFlights,
      pagination: { total: 2, page: 1, pages: 1 }
    });

    render(<App />);
    
    // Fill out search form
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Los Angeles' } });
    fireEvent.change(screen.getByLabelText('Departure Date'), { target: { value: '2025-06-15' } });
    
    // Submit search
    fireEvent.click(screen.getByText('🔍 Search Flights'));
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Available Flights (2)')).toBeInTheDocument();
    });
    
    // Check flight results
    expect(screen.getByText('American Airlines')).toBeInTheDocument();
    expect(screen.getByText('AA101')).toBeInTheDocument();
    expect(screen.getByText('Delta Air Lines')).toBeInTheDocument();
    expect(screen.getByText('DL205')).toBeInTheDocument();
  });

  it('handles search errors gracefully', async () => {
    flightAPI.searchFlights.mockRejectedValue(new Error('Network error'));

    render(<App />);
    
    // Fill out and submit search form
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Los Angeles' } });
    fireEvent.click(screen.getByText('🔍 Search Flights'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('prevents searching with same origin and destination', async () => {
    render(<App />);
    
    // Fill with same origin and destination
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'New York' } });
    fireEvent.click(screen.getByTestId('search-flights-button')); // Changed from text to testId for better targeting
    
    await waitFor(() => {
      expect(screen.getByText('Origin and destination cannot be the same')).toBeInTheDocument();
    });
  });

  it('allows swapping origin and destination', () => {
    render(<App />);
    
    const originInput = screen.getByLabelText('From');
    const destinationInput = screen.getByLabelText('To');
    
    // Fill out origin and destination
    fireEvent.change(originInput, { target: { value: 'New York' } });
    fireEvent.change(destinationInput, { target: { value: 'Los Angeles' } });
    
    // Click swap button
    fireEvent.click(screen.getByTitle('Swap origin and destination'));
    
    // Check if values are swapped
    expect(originInput.value).toBe('Los Angeles');
    expect(destinationInput.value).toBe('New York');
  });

  it('navigates to booking lookup', () => {
    render(<App />);
    
    // Click on Manage Booking
    fireEvent.click(screen.getByTestId('manage-booking-nav-button')); // Changed from text to testId for better targeting
    
    // Check if we're on the lookup page
    expect(screen.getByText('Manage Your Booking')).toBeInTheDocument();
    expect(screen.getByText('Find and manage your flight bookings')).toBeInTheDocument();
  });

  it('displays popular destinations', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Popular Destinations')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
      expect(screen.getByText('Miami')).toBeInTheDocument();
    });
  });

  it('selects popular destination when clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      const losAngelesButton = screen.getByText('Los Angeles');
      fireEvent.click(losAngelesButton);
    });
    
    // Check if destination is filled
    const destinationInput = screen.getByLabelText('To');
    expect(destinationInput.value).toBe('Los Angeles');
  });

  it('shows loading state during search', async () => {
    // Mock a delayed response
    flightAPI.searchFlights.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ flights: [] }), 100))
    );

    render(<App />);
    
    // Fill out and submit search form
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Los Angeles' } });
    fireEvent.click(screen.getByText('🔍 Search Flights'));
    
    // Check for loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('handles no search results', async () => {
    flightAPI.searchFlights.mockResolvedValue({ flights: [] });

    render(<App />);
    
    // Perform search
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Los Angeles' } });
    fireEvent.click(screen.getByText('🔍 Search Flights'));
    
    await waitFor(() => {
      expect(screen.getByText('No flights found for your search criteria. Please try different dates or destinations.')).toBeInTheDocument();
    });
  });

  it('navigates through booking flow', async () => {
    flightAPI.searchFlights.mockResolvedValue({ flights: mockFlights });
    bookingAPI.createBooking.mockResolvedValue(mockBooking);

    render(<App />);
    
    // Search for flights
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'New York' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Los Angeles' } });
    fireEvent.click(screen.getByText('🔍 Search Flights'));
    
    // Wait for results and select first flight
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Select Flight')[0]);
    });
    
    // Should be on booking form
    expect(screen.getByText('Complete Your Booking')).toBeInTheDocument();
    
    // Fill out booking form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/), { target: { value: '+1-555-123-4567' } });
    
    // Submit booking
    fireEvent.click(screen.getByTestId('confirm-booking-button')); // Changed from text to testId for better targeting
    
    // Should navigate to confirmation
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('FB123ABC')).toBeInTheDocument();
    });
  });
});