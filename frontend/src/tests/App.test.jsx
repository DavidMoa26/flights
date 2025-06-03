import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App component", () => {
  it("should render the heading 'Flight Booking'", () => {
    render(<App />);
    expect(screen.getByText(/Flight Booking/i)).toBeInTheDocument();
  });
});
