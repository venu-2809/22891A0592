import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/AuthProvider';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

test('renders LinkShrink Pro header', () => {
  renderWithProviders(<App />);
  const headerElement = screen.getByText(/LinkShrink Pro/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders URL input form', () => {
  renderWithProviders(<App />);
  const inputElement = screen.getByPlaceholderText(/Enter your URL/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders shorten button', () => {
  renderWithProviders(<App />);
  const buttonElement = screen.getByRole('button', { name: /Shorten URL/i });
  expect(buttonElement).toBeInTheDocument();
});
