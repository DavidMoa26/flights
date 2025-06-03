import { useEffect } from "react";
import "./App.css";
// import FlightSearch from "@/components/FlightSearch";

function App() {
  useEffect(() => {
    const createEmptyFlight = async () => {
      try {
        const response = await fetch("http://localhost:4000/create-flight", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        const data = await response.json();
        console.log("Response from backend:", data);
      } catch (error) {
        console.error("Error sending empty flight:", error);
      }
    };

    createEmptyFlight();
  }, []);

  return (
    <div className="app">
      <header className="p-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-center">Flight Booking</h1>
      </header>
      <main>{/* <FlightSearch /> */}</main>
    </div>
  );
}

export default App;
