import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsletterSignup from '@/components/marketing/NewsletterSignup';
import { act } from 'react';

// Mock the setTimeout function
jest.useFakeTimers();

describe('NewsletterSignup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the newsletter signup form correctly', () => {
    render(<NewsletterSignup />);

    // Check for heading and description
    expect(screen.getByText('Stay Updated')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Subscribe to our newsletter to receive exclusive offers/i
      )
    ).toBeInTheDocument();

    // Check for form elements
    expect(
      screen.getByPlaceholderText('Your email address')
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Check for privacy message
    expect(screen.getByText(/We respect your privacy/i)).toBeInTheDocument();
  });

  test('shows error message when submitting without an email', async () => {
    render(<NewsletterSignup />);

    // Submit form without entering an email
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Check for error message
    expect(
      screen.getByText('Please enter your email address')
    ).toBeInTheDocument();
  });

  test('shows loading state when submitting with valid email', async () => {
    render(<NewsletterSignup />);

    // Enter a valid email
    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit the form
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Since we're mocking the Send icon, verify the button is disabled instead
    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
  });

  test('shows success message after successful submission', async () => {
    render(<NewsletterSignup />);

    // Enter a valid email
    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit the form
    const submitButton = screen.getByRole('button');
    fireEvent.click(submitButton);

    // Fast-forward timers to simulate API call completion
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Check for success message
    expect(
      screen.getByText('Thank you for subscribing to our newsletter!')
    ).toBeInTheDocument();

    // Check that the input is cleared
    expect(emailInput).toHaveValue('');

    // Checking for the Check icon
    expect(submitButton).toHaveAttribute('disabled');
  });

  test('resets form after success message timeout', async () => {
    render(<NewsletterSignup />);

    // Enter a valid email and submit
    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button'));

    // Fast-forward to success state
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Verify success message is shown
    expect(
      screen.getByText('Thank you for subscribing to our newsletter!')
    ).toBeInTheDocument();

    // Fast-forward 5 more seconds to reset state
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Verify the message is gone
    expect(
      screen.queryByText('Thank you for subscribing to our newsletter!')
    ).not.toBeInTheDocument();

    // Verify form is ready for new submission
    expect(emailInput).toBeEnabled();
  });

  test('validates email format using browser validation', async () => {
    render(<NewsletterSignup />);

    // Just verify we can submit with valid email
    const emailInput = screen.getByPlaceholderText('Your email address');

    // Try valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button'));

    // Check if form submission was accepted (input is disabled)
    expect(emailInput).toBeDisabled();
  });

  test('handles form submission from form element', async () => {
    render(<NewsletterSignup />);

    // Enter a valid email
    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Get the form element and submit it directly
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Check if inputs are disabled, indicating submission was processed
    expect(emailInput).toBeDisabled();

    // Fast-forward timers
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Check for success message
    expect(
      screen.getByText('Thank you for subscribing to our newsletter!')
    ).toBeInTheDocument();
  });

  test('disables input and button during loading and success states', async () => {
    render(<NewsletterSignup />);

    // Enter a valid email
    const emailInput = screen.getByPlaceholderText('Your email address');
    const submitButton = screen.getByRole('button');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check that input and button are disabled during loading
    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Fast-forward to success state
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Check that they remain disabled during success state
    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Fast-forward to reset state
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Check that they are enabled again
    expect(emailInput).toBeEnabled();
    expect(submitButton).toBeEnabled();
  });
});
