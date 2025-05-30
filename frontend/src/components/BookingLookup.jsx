import React, { useState } from 'react';
import { bookingAPI, utils } from '../services/api';

const BookingLookup = ({ onBack, setLoading, setError }) => {
  const [searchType, setSearchType] = useState('reference');
  const [searchValue, setSearchValue] = useState('');
  const [foundBooking, setFoundBooking] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setLoading(true);
    setError(null);
    setFoundBooking(null);
    setUserBookings([]);

    try {
      if (searchType === 'reference') {
        const booking = await bookingAPI.getBookingByReference(searchValue.trim());
        setFoundBooking(booking);
      } else {
        const bookings = await bookingAPI.getUserBookings(searchValue.trim());
        setUserBookings(bookings);
        if (bookings.length === 0) {
          setError('No bookings found for this email address');
        }
      }
    } catch (error) {
      if (error.message.includes('not found')) {
        setError(`No booking found with ${searchType === 'reference' ? 'reference number' : 'email'}: ${searchValue}`);
      } else {
        setError(error.message || 'Failed to find booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(true);
    try {
      await bookingAPI.cancelBooking(bookingId);
      
      // Refresh the booking data
      if (foundBooking) {
        const updatedBooking = await bookingAPI.getBookingById(bookingId);
        setFoundBooking(updatedBooking);
      } else {
        // Refresh user bookings
        const bookings = await bookingAPI.getUserBookings(searchValue.trim());
        setUserBookings(bookings);
      }
      
      alert('Booking cancelled successfully');
    } catch (error) {
      setError(error.message || 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'cancelled': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const renderBookingCard = (booking, showActions = true) => (
    <div key={booking.id} className="booking-card">
      <div className="booking-header">
        <div className="booking-reference">
          <h3>{booking.bookingReference}</h3>
          <span className={`status-badge ${getStatusBadgeClass(booking.bookingStatus)}`}>
            {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
          </span>
        </div>
        <div className="booking-date">
          Booked: {utils.formatDate(booking.createdAt)}
        </div>
      </div>

      <div className="booking-details">
        <div className="flight-info">
          <h4>{booking.flight.airline} {booking.flight.flightNumber}</h4>
          <div className="route">
            {booking.flight.origin} → {booking.flight.destination}
          </div>
          <div className="timing">
            <div>
              <strong>Departure:</strong> {utils.formatDate(booking.flight.departureTime)} at {utils.formatTime(booking.flight.departureTime)}
            </div>
            <div>
              <strong>Arrival:</strong> {utils.formatDate(booking.flight.arrivalTime)} at {utils.formatTime(booking.flight.arrivalTime)}
            </div>
          </div>
        </div>

        <div className="passenger-info">
          <div><strong>Passenger:</strong> {booking.passengerName}</div>
          <div><strong>Email:</strong> {booking.passengerEmail}</div>
          <div><strong>Phone:</strong> {booking.passengerPhone}</div>
          <div><strong>Passengers:</strong> {booking.numberOfPassengers}</div>
          <div><strong>Total Paid:</strong> {utils.formatPrice(booking.totalPrice)}</div>
        </div>

        {booking.specialRequests && (
          <div className="special-requests">
            <strong>Special Requests:</strong>
            <p>{booking.specialRequests}</p>
          </div>
        )}
      </div>

      {showActions && booking.bookingStatus === 'confirmed' && (
        <div className="booking-actions">
          <button 
            onClick={() => handleCancelBooking(booking.id)}
            className="cancel-booking-button"
          >
            Cancel Booking
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="booking-lookup">
      <div className="lookup-container">
        <div className="lookup-header">
          <button onClick={onBack} className="back-button">
            ← Back to Search
          </button>
          <h2>Manage Your Booking</h2>
          <p>Find and manage your flight bookings</p>
        </div>

        <div className="lookup-form">
          <form onSubmit={handleSearch}>
            <div className="search-type-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  value="reference"
                  checked={searchType === 'reference'}
                  onChange={(e) => setSearchType(e.target.value)}
                />
                <span>Search by Booking Reference</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="email"
                  checked={searchType === 'email'}
                  onChange={(e) => setSearchType(e.target.value)}
                />
                <span>Search by Email Address</span>
              </label>
            </div>

            <div className="search-input-group">
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === 'reference' 
                    ? 'Enter booking reference (e.g., FB123ABC)'
                    : 'Enter email address used for booking'
                }
                required
              />
              <button type="submit" className="search-button">
                🔍 Search
              </button>
            </div>
          </form>
        </div>

        {foundBooking && (
          <div className="search-results">
            <h3>Booking Found</h3>
            {renderBookingCard(foundBooking)}
          </div>
        )}

        {userBookings.length > 0 && (
          <div className="search-results">
            <h3>Your Bookings ({userBookings.length})</h3>
            {userBookings.map(booking => renderBookingCard(booking))}
          </div>
        )}

        <div className="lookup-tips">
          <h3>Booking Management Tips</h3>
          <ul>
            <li>📧 Your booking reference was sent to your email address</li>
            <li>📱 Save your booking reference for easy access</li>
            <li>⏰ Free cancellation within 24 hours of booking</li>
            <li>✈️ Check-in online 24 hours before departure</li>
            <li>📞 Contact customer service for any assistance</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <div className="help-options">
            <div className="help-option">
              <h4>📞 Call Us</h4>
              <p>1-800-SKY-BOOK (1-800-759-2665)</p>
              <p>Available 24/7</p>
            </div>
            <div className="help-option">
              <h4>💬 Live Chat</h4>
              <p>Chat with our support team</p>
              <p>Mon-Fri 9 AM - 9 PM</p>
            </div>
            <div className="help-option">
              <h4>📧 Email</h4>
              <p>support@skybook.com</p>
              <p>Response within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingLookup;