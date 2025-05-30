import React from 'react';
import { utils } from '../services/api';

const FlightList = ({ flights, onFlightSelect, onNewSearch }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return '✅';
      case 'delayed': return '⏰';
      case 'cancelled': return '❌';
      default: return '✈️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'green';
      case 'delayed': return 'orange';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  if (!flights || flights.length === 0) {
    return (
      <div className="flight-list">
        <div className="no-flights">
          <h2>No Flights Found</h2>
          <p>We couldn't find any flights matching your search criteria.</p>
          <button onClick={onNewSearch} className="new-search-button">
            Try New Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-list">
      <div className="flight-list-header">
        <h2>Available Flights ({flights.length})</h2>
        <button onClick={onNewSearch} className="new-search-button">
          New Search
        </button>
      </div>

      <div className="flight-results">
        {flights.map((flight) => (
          <div key={flight.id} className="flight-card">
            <div className="flight-main-info">
              <div className="airline-section">
                <div className="airline-name">{flight.airline}</div>
                <div className="flight-number">{flight.flightNumber}</div>
                {flight.aircraft && (
                  <div className="aircraft">{flight.aircraft}</div>
                )}
              </div>

              <div className="route-section">
                <div className="departure">
                  <div className="time">
                    {utils.formatTime(flight.departureTime)}
                  </div>
                  <div className="airport">{flight.origin}</div>
                  <div className="date">
                    {utils.formatDate(flight.departureTime)}
                  </div>
                </div>

                <div className="flight-duration">
                  <div className="duration-line">
                    <span className="duration-text">
                      {utils.formatDuration(flight.duration)}
                    </span>
                  </div>
                  <div className="route-line"></div>
                </div>

                <div className="arrival">
                  <div className="time">
                    {utils.formatTime(flight.arrivalTime)}
                  </div>
                  <div className="airport">{flight.destination}</div>
                  <div className="date">
                    {utils.formatDate(flight.arrivalTime)}
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <div className="price">
                  {utils.formatPrice(flight.price)}
                  <span className="price-per-person">per person</span>
                </div>
                
                <div className="availability">
                  <span className="seats-left">
                    {flight.availableSeats} seats left
                  </span>
                </div>

                <div className="status" style={{ color: getStatusColor(flight.status) }}>
                  {getStatusIcon(flight.status)} {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                </div>

                <button 
                  className="select-flight-button"
                  onClick={() => onFlightSelect(flight)}
                  disabled={flight.status !== 'scheduled' || flight.availableSeats === 0}
                >
                  {flight.status === 'scheduled' && flight.availableSeats > 0 
                    ? 'Select Flight' 
                    : 'Unavailable'
                  }
                </button>
              </div>
            </div>

            <div className="flight-details">
              <div className="detail-item">
                <span className="label">Total Seats:</span>
                <span className="value">{flight.totalSeats}</span>
              </div>
              <div className="detail-item">
                <span className="label">Available:</span>
                <span className="value">{flight.availableSeats}</span>
              </div>
              {flight.bookings && flight.bookings.length > 0 && (
                <div className="detail-item">
                  <span className="label">Bookings:</span>
                  <span className="value">{flight.bookings.length}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="search-tips">
        <h3>💡 Booking Tips</h3>
        <ul>
          <li>Prices include taxes and fees</li>
          <li>Free cancellation within 24 hours of booking</li>
          <li>Check-in opens 24 hours before departure</li>
          <li>Arrive at the airport at least 2 hours early for domestic flights</li>
        </ul>
      </div>
    </div>
  );
};

export default FlightList;