import React, { useState } from 'react';
import './App.css';
import FlightSearch from './components/FlightSearch';
import FlightList from './components/FlightList';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import BookingLookup from './components/BookingLookup';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState('search');
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchResults) => {
    setFlights(searchResults);
    setCurrentView('results');
    setError(null);
  };

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight);
    setCurrentView('booking');
  };

  const handleBookingComplete = (bookingData) => {
    setBooking(bookingData);
    setCurrentView('confirmation');
  };

  const handleNewSearch = () => {
    setCurrentView('search');
    setFlights([]);
    setSelectedFlight(null);
    setBooking(null);
    setError(null);
  };

  const handleBookingLookup = () => {
    setCurrentView('lookup');
  };

  const handleBackToResults = () => {
    setCurrentView('results');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search':
        return (
          <FlightSearch 
            onSearch={handleSearch} 
            setLoading={setLoading}
            setError={setError}
          />
        );
      case 'results':
        return (
          <FlightList 
            flights={flights}
            onFlightSelect={handleFlightSelect}
            onNewSearch={handleNewSearch}
          />
        );
      case 'booking':
        return (
          <BookingForm 
            flight={selectedFlight}
            onBookingComplete={handleBookingComplete}
            onBack={handleBackToResults}
            setLoading={setLoading}
            setError={setError}
          />
        );
      case 'confirmation':
        return (
          <BookingConfirmation 
            booking={booking}
            onNewSearch={handleNewSearch}
          />
        );
      case 'lookup':
        return (
          <BookingLookup 
            onBack={handleNewSearch}
            setLoading={setLoading}
            setError={setError}
          />
        );
      default:
        return (
          <FlightSearch 
            onSearch={handleSearch} 
            setLoading={setLoading}
            setError={setError}
          />
        );
    }
  };

  return (
    <div className="App">
      <Header 
        onNewSearch={handleNewSearch}
        onBookingLookup={handleBookingLookup}
        currentView={currentView}
      />
      
      <main className="main-content">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="close-error">×</button>
          </div>
        )}
        
        {renderCurrentView()}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;