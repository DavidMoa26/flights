import React, { useState } from 'react';
import { bookingAPI, utils } from '../services/api';

const BookingForm = ({ flight, onBookingComplete, onBack, setLoading, setError }) => {
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    numberOfPassengers: 1,
    specialRequests: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.passengerName.trim()) {
      errors.passengerName = 'Passenger name is required';
    }

    if (!formData.passengerEmail.trim()) {
      errors.passengerEmail = 'Email is required';
    } else if (!utils.validateEmail(formData.passengerEmail)) {
      errors.passengerEmail = 'Please enter a valid email address';
    }

    if (!formData.passengerPhone.trim()) {
      errors.passengerPhone = 'Phone number is required';
    } else if (!utils.validatePhone(formData.passengerPhone)) {
      errors.passengerPhone = 'Please enter a valid phone number';
    }

    if (formData.numberOfPassengers < 1 || formData.numberOfPassengers > 9) {
      errors.numberOfPassengers = 'Number of passengers must be between 1 and 9';
    }

    if (formData.numberOfPassengers > flight.availableSeats) {
      errors.numberOfPassengers = `Only ${flight.availableSeats} seats available`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        flightId: flight.id,
        ...formData
      };

      const result = await bookingAPI.createBooking(bookingData);
      onBookingComplete(result);
    } catch (error) {
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = parseFloat(flight.price) * formData.numberOfPassengers;

  return (
    <div className="booking-form">
      <div className="booking-container">
        <div className="booking-header">
          <button onClick={onBack} className="back-button">
            ← Back to Results
          </button>
          <h2>Complete Your Booking</h2>
        </div>

        <div className="booking-content">
          <div className="flight-summary">
            <h3>Flight Details</h3>
            <div className="summary-card">
              <div className="flight-info">
                <div className="airline-flight">
                  <strong>{flight.airline}</strong> - {flight.flightNumber}
                </div>
                <div className="route">
                  {flight.origin} → {flight.destination}
                </div>
                <div className="timing">
                  <div>
                    Departure: {utils.formatDate(flight.departureTime)} at {utils.formatTime(flight.departureTime)}
                  </div>
                  <div>
                    Arrival: {utils.formatDate(flight.arrivalTime)} at {utils.formatTime(flight.arrivalTime)}
                  </div>
                  <div>
                    Duration: {utils.formatDuration(flight.duration)}
                  </div>
                </div>
              </div>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Price per passenger:</span>
                  <span>{utils.formatPrice(flight.price)}</span>
                </div>
                <div className="price-row">
                  <span>Number of passengers:</span>
                  <span>{formData.numberOfPassengers}</span>
                </div>
                <div className="price-row total">
                  <span><strong>Total:</strong></span>
                  <span><strong>{utils.formatPrice(totalPrice)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="passenger-form">
            <h3>Passenger Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="passengerName">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="passengerName"
                  name="passengerName"
                  value={formData.passengerName}
                  onChange={handleInputChange}
                  placeholder="Enter full name as it appears on ID"
                  className={formErrors.passengerName ? 'error' : ''}
                />
                {formErrors.passengerName && (
                  <span className="error-message">{formErrors.passengerName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="passengerEmail">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="passengerEmail"
                  name="passengerEmail"
                  value={formData.passengerEmail}
                  onChange={handleInputChange}
                  placeholder="Enter email address for booking confirmation"
                  className={formErrors.passengerEmail ? 'error' : ''}
                />
                {formErrors.passengerEmail && (
                  <span className="error-message">{formErrors.passengerEmail}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="passengerPhone">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="passengerPhone"
                  name="passengerPhone"
                  value={formData.passengerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number (e.g., +1-555-123-4567)"
                  className={formErrors.passengerPhone ? 'error' : ''}
                />
                {formErrors.passengerPhone && (
                  <span className="error-message">{formErrors.passengerPhone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="numberOfPassengers">
                  Number of Passengers *
                </label>
                <select
                  id="numberOfPassengers"
                  name="numberOfPassengers"
                  value={formData.numberOfPassengers}
                  onChange={handleInputChange}
                  className={formErrors.numberOfPassengers ? 'error' : ''}
                >
                  {Array.from({ length: Math.min(9, flight.availableSeats) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
                {formErrors.numberOfPassengers && (
                  <span className="error-message">{formErrors.numberOfPassengers}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="specialRequests">
                  Special Requests (Optional)
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requirements (e.g., wheelchair assistance, dietary restrictions, etc.)"
                  rows="3"
                />
              </div>

              <div className="booking-actions">
                <button type="button" onClick={onBack} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="confirm-booking-button">
                  Confirm Booking - {utils.formatPrice(totalPrice)}
                </button>
              </div>
            </form>

            <div className="booking-terms">
              <p>
                <small>
                  By clicking "Confirm Booking", you agree to our terms and conditions. 
                  Your booking is subject to availability and airline policies.
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;