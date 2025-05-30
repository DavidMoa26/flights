import React from 'react';
import { utils } from '../services/api';

const BookingConfirmation = ({ booking, onNewSearch }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleEmailConfirmation = () => {
    const subject = `Flight Booking Confirmation - ${booking.bookingReference}`;
    const body = `
Dear ${booking.passengerName},

Your flight booking has been confirmed!

Booking Reference: ${booking.bookingReference}
Flight: ${booking.flight.airline} ${booking.flight.flightNumber}
Route: ${booking.flight.origin} → ${booking.flight.destination}
Departure: ${utils.formatDate(booking.flight.departureTime)} at ${utils.formatTime(booking.flight.departureTime)}
Arrival: ${utils.formatDate(booking.flight.arrivalTime)} at ${utils.formatTime(booking.flight.arrivalTime)}
Passengers: ${booking.numberOfPassengers}
Total Paid: ${utils.formatPrice(booking.totalPrice)}

Please arrive at the airport at least 2 hours before departure.

Thank you for choosing SkyBook!
    `;
    
    const mailtoLink = `mailto:${booking.passengerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="booking-confirmation">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Booking Confirmed!</h1>
          <p>Your flight has been successfully booked</p>
        </div>

        <div className="confirmation-details">
          <div className="booking-reference-card">
            <h2>Booking Reference</h2>
            <div className="reference-number">{booking.bookingReference}</div>
            <p>Save this reference number for future use</p>
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            
            <div className="summary-section">
              <h4>Flight Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Airline:</label>
                  <span>{booking.flight.airline}</span>
                </div>
                <div className="info-item">
                  <label>Flight Number:</label>
                  <span>{booking.flight.flightNumber}</span>
                </div>
                <div className="info-item">
                  <label>Route:</label>
                  <span>{booking.flight.origin} → {booking.flight.destination}</span>
                </div>
                <div className="info-item">
                  <label>Aircraft:</label>
                  <span>{booking.flight.aircraft || 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h4>Travel Details</h4>
              <div className="travel-timeline">
                <div className="timeline-item">
                  <div className="timeline-icon">🛫</div>
                  <div className="timeline-content">
                    <div className="timeline-title">Departure</div>
                    <div className="timeline-time">
                      {utils.formatTime(booking.flight.departureTime)}
                    </div>
                    <div className="timeline-date">
                      {utils.formatDate(booking.flight.departureTime)}
                    </div>
                    <div className="timeline-location">{booking.flight.origin}</div>
                  </div>
                </div>
                
                <div className="timeline-divider">
                  <span>{utils.formatDuration(booking.flight.duration)}</span>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-icon">🛬</div>
                  <div className="timeline-content">
                    <div className="timeline-title">Arrival</div>
                    <div className="timeline-time">
                      {utils.formatTime(booking.flight.arrivalTime)}
                    </div>
                    <div className="timeline-date">
                      {utils.formatDate(booking.flight.arrivalTime)}
                    </div>
                    <div className="timeline-location">{booking.flight.destination}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h4>Passenger Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{booking.passengerName}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{booking.passengerEmail}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{booking.passengerPhone}</span>
                </div>
                <div className="info-item">
                  <label>Passengers:</label>
                  <span>{booking.numberOfPassengers}</span>
                </div>
              </div>
              
              {booking.specialRequests && (
                <div className="special-requests">
                  <label>Special Requests:</label>
                  <p>{booking.specialRequests}</p>
                </div>
              )}
            </div>

            <div className="summary-section">
              <h4>Payment Summary</h4>
              <div className="payment-details">
                <div className="payment-row">
                  <span>Price per passenger:</span>
                  <span>{utils.formatPrice(booking.flight.price)}</span>
                </div>
                <div className="payment-row">
                  <span>Number of passengers:</span>
                  <span>{booking.numberOfPassengers}</span>
                </div>
                <div className="payment-row total">
                  <span><strong>Total Paid:</strong></span>
                  <span><strong>{utils.formatPrice(booking.totalPrice)}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <button onClick={handlePrint} className="print-button">
            🖨️ Print Confirmation
          </button>
          <button onClick={handleEmailConfirmation} className="email-button">
            📧 Email Confirmation
          </button>
          <button onClick={onNewSearch} className="new-search-button">
            ✈️ Book Another Flight
          </button>
        </div>

        <div className="important-notes">
          <h3>Important Information</h3>
          <ul>
            <li><strong>Check-in:</strong> Online check-in opens 24 hours before departure</li>
            <li><strong>Airport Arrival:</strong> Arrive at least 2 hours early for domestic flights</li>
            <li><strong>Documents:</strong> Bring valid government-issued photo ID</li>
            <li><strong>Baggage:</strong> Check airline website for baggage policies</li>
            <li><strong>Cancellation:</strong> Free cancellation within 24 hours of booking</li>
          </ul>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Save Your Confirmation</h4>
                <p>Keep your booking reference number safe for check-in and changes</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Check-in Online</h4>
                <p>Check-in online 24 hours before departure to save time</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Prepare for Travel</h4>
                <p>Review baggage policies and ensure you have required documents</p>
              </div>
            </div>
          </div>
        </div>

        <div className="booking-status">
          <span className="status-badge confirmed">
            Status: {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
          </span>
          <span className="booking-date">
            Booked on: {utils.formatDate(booking.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;