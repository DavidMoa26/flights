import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FlightForm from "./FlightForm";
function FlightSearch() {
  const [oneWayForm, setOneWayForm] = useState({
    source: "",
    destination: "",
    currency: "usd",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "ECONOMY",
    departureDate: "",
  });

  const [roundTripForm, setRoundTripForm] = useState({
    source: "",
    destination: "",
    currency: "usd",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "ECONOMY",
    departureDate: "",
    returnDate: "",
  });

  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0] + "T00:00:00";
  };

  const handleOneWaySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    // Format dates for API
    const departureDate = formatDate(oneWayForm.departureDate);

    const params = new URLSearchParams({
      source: `Country:${oneWayForm.source}`,
      destination: `City:${oneWayForm.destination}`,
      currency: oneWayForm.currency,
      locale: "en",
      adults: oneWayForm.adults,
      children: oneWayForm.children,
      infants: oneWayForm.infants,
      handbags: 1,
      holdbags: 0,
      cabinClass: oneWayForm.cabinClass,
      sortBy: "QUALITY",
      applyMixedClasses: "true",
      allowChangeInboundDestination: "true",
      allowChangeInboundSource: "true",
      allowDifferentStationConnection: "true",
      enableSelfTransfer: "true",
      allowOvernightStopover: "true",
      enableTrueHiddenCity: "true",
      allowReturnToDifferentCity: "false",
      allowReturnFromDifferentCity: "false",
      enableThrowAwayTicketing: "true",
      transportTypes: "FLIGHT",
      contentProviders: "FLIXBUS_DIRECTS,FRESH,KAYAK,KIWI",
      limit: 20,
    });

    // Add dates if provided
    if (departureDate) {
      params.append("outboundDepartmentDateStart", departureDate);
      params.append("outboundDepartmentDateEnd", departureDate);
    }

    const url = `https://kiwi-com-cheap-flights.p.rapidapi.com/one-way?${params.toString()}`;

    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "814c82b96bmshe7a474e104f962dp1213ecjsn50a4c6693b69",
        "x-rapidapi-host": "kiwi-com-cheap-flights.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch flights");
      }

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format from API");
      }

      let flights = [];
      if (Array.isArray(result)) {
        flights = result;
      } else if (result.data && Array.isArray(result.data)) {
        flights = result.data;
      } else if (result.results && Array.isArray(result.results)) {
        flights = result.results;
      } else {
        throw new Error("No flight data found in the response");
      }

      const formattedResults = flights.map((flight) => {
        console.log("Processing flight:", flight);

        return {
          airline: {
            name: flight.airline || flight.airlineName || "Unknown Airline",
            logo: flight.airlineLogo || flight.airlineLogoUrl || null,
          },
          flightNumber: flight.flightNumber || flight.flightNo || "N/A",
          departureTime: flight.departureTime || flight.departure || "N/A",
          departureAirport: flight.departureAirport || flight.origin || "N/A",
          arrivalTime: flight.arrivalTime || flight.arrival || "N/A",
          arrivalAirport: flight.arrivalAirport || flight.destination || "N/A",
          duration: flight.duration || flight.flightDuration || "N/A",
          price: flight.price || flight.totalPrice || 0,
          currency: flight.currency || "USD",
          cabinClass: flight.cabinClass || "ECONOMY",
          stops: flight.stops || flight.stopCount || 0,
          baggage: flight.baggage || flight.baggageAllowance || "N/A",
        };
      });

      console.log("Formatted Results:", formattedResults);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "Failed to fetch flights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoundTripSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    // Format dates for API
    const departureDate = formatDate(roundTripForm.departureDate);
    const returnDate = formatDate(roundTripForm.returnDate);

    const params = new URLSearchParams({
      source: `Country:${roundTripForm.source}`,
      destination: `City:${roundTripForm.destination}`,
      currency: roundTripForm.currency,
      locale: "en",
      adults: roundTripForm.adults,
      children: roundTripForm.children,
      infants: roundTripForm.infants,
      handbags: 1,
      holdbags: 0,
      cabinClass: roundTripForm.cabinClass,
      sortBy: "QUALITY",
      sortOrder: "ASCENDING",
      applyMixedClasses: "true",
      allowReturnFromDifferentCity: "true",
      allowChangeInboundDestination: "true",
      allowChangeInboundSource: "true",
      allowDifferentStationConnection: "true",
      enableSelfTransfer: "true",
      allowOvernightStopover: "true",
      enableTrueHiddenCity: "true",
      enableThrowAwayTicketing: "true",
      transportTypes: "FLIGHT",
      contentProviders: "FLIXBUS_DIRECTS,FRESH,KAYAK,KIWI",
      limit: 20,
    });

    // Add dates if provided
    if (departureDate) {
      params.append("outboundDepartmentDateStart", departureDate);
      params.append("outboundDepartmentDateEnd", departureDate);
    }
    if (returnDate) {
      params.append("inboundDepartmentDateStart", returnDate);
      params.append("inboundDepartmentDateEnd", returnDate);
    }

    const url = `https://kiwi-com-cheap-flights.p.rapidapi.com/round-trip?${params.toString()}`;

    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "814c82b96bmshe7a474e104f962dp1213ecjsn50a4c6693b69",
        "x-rapidapi-host": "kiwi-com-cheap-flights.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch flights");
      }

      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format from API");
      }

      let flights = [];
      if (Array.isArray(result)) {
        flights = result;
      } else if (result.data && Array.isArray(result.data)) {
        flights = result.data;
      } else if (result.results && Array.isArray(result.results)) {
        flights = result.results;
      } else {
        throw new Error("No flight data found in the response");
      }

      const formattedResults = flights.map((flight) => {
        console.log("Processing flight:", flight);

        return {
          airline: {
            name: flight.airline || flight.airlineName || "Unknown Airline",
            logo: flight.airlineLogo || flight.airlineLogoUrl || null,
          },
          flightNumber: flight.flightNumber || flight.flightNo || "N/A",
          departureTime: flight.departureTime || flight.departure || "N/A",
          departureAirport: flight.departureAirport || flight.origin || "N/A",
          arrivalTime: flight.arrivalTime || flight.arrival || "N/A",
          arrivalAirport: flight.arrivalAirport || flight.destination || "N/A",
          duration: flight.duration || flight.flightDuration || "N/A",
          price: flight.price || flight.totalPrice || 0,
          currency: flight.currency || "USD",
          cabinClass: flight.cabinClass || "ECONOMY",
          stops: flight.stops || flight.stopCount || 0,
          baggage: flight.baggage || flight.baggageAllowance || "N/A",
        };
      });

      console.log("Formatted Results:", formattedResults);
      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "Failed to fetch flights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-300 rounded-sm p-10">
      <Tabs defaultValue="round-trip" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="round-trip"
            className="text-grey data-[state=active]:text-blue-600"
          >
            Round Trip
          </TabsTrigger>
          <TabsTrigger
            value="one-way"
            className="text-grey data-[state=active]:text-blue-600"
          >
            One Way
          </TabsTrigger>
        </TabsList>
        <TabsContent value="round-trip" className="mt-4">
          <div className="space-y-4">
            <h2 className="text-xl text-blue-600 font-semibold">
              Round Trip Flight
            </h2>
            <FlightForm
              formData={roundTripForm}
              setFormData={setRoundTripForm}
              onSubmit={handleRoundTripSubmit}
              type="round"
            />
          </div>
        </TabsContent>
        <TabsContent value="one-way" className="mt-4">
          <div className="space-y-4">
            <h2 className="text-xl text-blue-600 font-semibold">
              One Way Flight
            </h2>
            <FlightForm
              formData={oneWayForm}
              setFormData={setOneWayForm}
              onSubmit={handleOneWaySubmit}
              type="one-way"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FlightSearch;
