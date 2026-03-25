import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form heading', () => {
  render(<App />);
  const heading = screen.getByText(/eventflow login/i);
  expect(heading).toBeInTheDocument();
});
