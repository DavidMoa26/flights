import React, { useState, useEffect } from 'react';
import { flightAPI } from '../services/api';

const FlightSearch = ({ onSearch, setLoading, setError }) => {
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    passengers: 1
  });
  
  const [popularDestinations, setPopularDestinations] = useState([]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setSearchForm(prev => ({ ...prev, departureDate: today }));

    // Load popular destinations
    loadPopularDestinations();
  }, []);

  const loadPopularDestinations = async () => {
    try {
      const destinations = await flightAPI.getPopularDestinations();
      setPopularDestinations(destinations.slice(0, 6)); // Show top 6
    } catch (error) {
      console.error('Error loading popular destinations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchForm.origin.trim() || !searchForm.destination.trim()) {
      setError('Please enter both origin and destination');
      return;
    }

    if (searchForm.origin.toLowerCase() === searchForm.destination.toLowerCase()) {
      setError('Origin and destination cannot be the same');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await flightAPI.searchFlights(searchForm);
      
      if (searchResults.flights.length === 0) {
        setError('No flights found for your search criteria. Please try different dates or destinations.');
      } else {
        onSearch(searchResults.flights);
      }
    } catch (error) {
      setError(error.message || 'Failed to search flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePopularDestinationClick = (origin, destination) => {
    setSearchForm(prev => ({
      ...prev,
      origin: origin,
      destination: destination
    }));
  };

  const swapOriginDestination = () => {
    setSearchForm(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flight-search">
      <div className="search-container">
        <div className="search-header">
          <h2>Find Your Perfect Flight</h2>
          <p>Search from thousands of flights to find the best deals</p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="origin">From</label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={searchForm.origin}
                onChange={handleInputChange}
                placeholder="Enter departure city"
                required
              />
            </div>

            <button 
              type="button" 
              className="swap-button"
              onClick={swapOriginDestination}
              title="Swap origin and destination"
            >
              ⇄
            </button>

            <div className="form-group">
              <label htmlFor="destination">To</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={searchForm.destination}
                onChange={handleInputChange}
                placeholder="Enter destination city"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="departureDate">Departure Date</label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={searchForm.departureDate}
                onChange={handleInputChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="passengers">Passengers</label>
              <select
                id="passengers"
                name="passengers"
                value={searchForm.passengers}
                onChange={handleInputChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="search-button" id="search-flights-btn">
            🔍 Search Flights
          </button>
        </form>

        {popularDestinations.length > 0 && (
          <div className="popular-destinations">
            <h3>Popular Destinations</h3>
            <div className="destination-grid">
              {popularDestinations.map((dest, index) => (
                <button
                  key={index}
                  className="destination-card"
                  onClick={() => handlePopularDestinationClick(dest.origin, dest.destination)}
                >
                  <span className="origin-name">{dest.origin}</span>
                  <span className="destination-name">{dest.destination}</span>
                  <span className="flight-count">{dest.flightCount} flights</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="search-tips">
          <h3>Search Tips</h3>
          <ul>
            <li>🗓️ Book in advance for better prices</li>
            <li>📅 Flexible dates can save you money</li>
            <li>🌍 Try nearby airports for more options</li>
            <li>⏰ Early morning and late evening flights are often cheaper</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;