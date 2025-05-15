/* eslint-env vitest */
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App component', () => {
  it('renders Vite + React title', () => {
    render(<App />);
    expect(screen.getByText('Vite + React')).toBeInTheDocument();
  });

  it('renders a button with text "Click"', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /click/i })).toBeInTheDocument();
  });
});
