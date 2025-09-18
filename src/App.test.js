import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  // Simple test that just checks if the component renders
  // This avoids Firebase mocking complexities while ensuring basic functionality
  expect(() => render(<App />)).not.toThrow();
});
