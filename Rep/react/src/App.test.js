import { render, screen } from '@testing-library/react';
import App from './App';
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

test('renders auth heading', () => {
  render(<App />);
  const heading = screen.getByText(/^eventflow$/i);
  expect(heading).toBeInTheDocument();
});
