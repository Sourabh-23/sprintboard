import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the SprintBoard sign-in experience', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getAllByText('SprintBoard').length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: /sign in to sprintboard/i })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /sign in/i })).toHaveLength(2);
});
