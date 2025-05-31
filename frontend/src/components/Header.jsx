import React from 'react';

const Header = ({ onNewSearch, onBookingLookup, currentView }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={onNewSearch}>
          <h1>✈️ SkyBook</h1>
          <p>Your Flight Booking Companion</p>
        </div>
        
        <nav className="navigation">
          <button 
            className={`nav-button ${currentView === 'search' || currentView === 'results' ? 'active' : ''}`}
            onClick={onNewSearch}
            data-testid="search-flights-nav-button"
          >
            Search Flights
          </button>
          <button 
            className={`nav-button ${currentView === 'lookup' ? 'active' : ''}`}
            onClick={onBookingLookup}
            data-testid="manage-booking-nav-button"
          >
            Manage Booking
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;