import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SERVICE_URL || 'http://localhost:4000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Unable to connect to the server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
);

// Flight API methods
export const flightAPI = {
  // Search flights with filters
  searchFlights: async (searchParams) => {
    const params = new URLSearchParams();
    
    if (searchParams.origin) params.append('origin', searchParams.origin);
    if (searchParams.destination) params.append('destination', searchParams.destination);
    if (searchParams.departureDate) params.append('departureDate', searchParams.departureDate);
    if (searchParams.passengers) params.append('passengers', searchParams.passengers);
    if (searchParams.page) params.append('page', searchParams.page);
    if (searchParams.limit) params.append('limit', searchParams.limit);

    const response = await api.get(`/api/flights?${params.toString()}`);
    return response.data;
  },

  // Get flight by ID
  getFlightById: async (flightId) => {
    const response = await api.get(`/api/flights/${flightId}`);
    return response.data;
  },

  // Get popular destinations
  getPopularDestinations: async () => {
    const response = await api.get('/api/flights/popular-destinations');
    return response.data;
  },

  // Create flight (admin function)
  createFlight: async (flightData) => {
    const response = await api.post('/api/flights', flightData);
    return response.data;
  }
};

// Booking API methods
export const bookingAPI = {
  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/api/bookings/${bookingId}`);
    return response.data;
  },

  // Get booking by reference number
  getBookingByReference: async (reference) => {
    const response = await api.get(`/api/bookings/reference/${reference}`);
    return response.data;
  },

  // Get user bookings by email
  getUserBookings: async (email) => {
    const response = await api.get(`/api/bookings?email=${encodeURIComponent(email)}`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    const response = await api.put(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // Get all bookings (admin function)
  getAllBookings: async (page = 1, limit = 10, status = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);

    const response = await api.get(`/api/bookings?${params.toString()}`);
    return response.data;
  }
};

// Utility functions
export const utils = {
  // Test API connection
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Format price
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format time
  formatTime: (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Format duration (minutes to hours and minutes)
  formatDuration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (basic validation)
  validatePhone: (phone) => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }
};

export default api;