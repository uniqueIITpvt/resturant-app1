'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Apple } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../../context/ToastContext';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create a separate component for the main content
function ForgotPasswordContent() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: Success notification
  const [formTouched, setFormTouched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (formTouched) {
      setValidationError(validateEmail(value));
    }
  };

  const handleBlur = () => {
    setFormTouched(true);
    setValidationError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFormTouched(true);

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      // Show success message and move to step 2
      setSuccessMessage(
        `Password reset instructions have been sent to ${email}. Please check your inbox (and spam folder).`
      );
      setStep(2);
      toast.success('Reset instructions sent to your email!', 'Email Sent');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while processing your request';
      setError(errorMessage);
      toast.error(errorMessage, 'Reset Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setStep(1);
    setEmail('');
    setError('');
    setSuccessMessage('');
    setFormTouched(false);
    setValidationError('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4'>
      {/* Background Decorative Elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full opacity-20 animate-pulse'></div>
        <div className='absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-red-300 to-orange-300 rounded-full opacity-30 animate-bounce'></div>
        <div className='absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-25 animate-pulse delay-300'></div>
        <div className='absolute top-10 right-1/4 w-20 h-20 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-20 animate-bounce delay-500'></div>
        <div className='absolute bottom-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-pink-300 to-red-300 rounded-full opacity-25 animate-pulse delay-700'></div>
      </div>

      {/* Main Card Container */}
      <div className='relative z-10 w-full max-w-6xl mx-auto'>
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100'>
          <div className='flex flex-col lg:flex-row min-h-[600px]'>
            {/* Left Side - Form */}
            <div className='flex-1 lg:max-w-md xl:max-w-lg p-8 sm:p-12 flex flex-col justify-center'>
              {step === 1 ? (
                <>
                  {/* Header */}
                  <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Reset your password
                    </h1>
                    <p className='text-gray-600'>
                      Enter your email address and we&apos;ll send you
                      instructions to reset your password
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className='mb-6 bg-red-50 border border-red-200 rounded-2xl p-4'>
                      <p className='text-sm text-red-800'>{error}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Email Input */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Email Address
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <Mail className='h-5 w-5 text-gray-400' />
                        </div>
                        <input
                          name='email'
                          type='email'
                          required
                          value={email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                            formTouched && validationError
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Enter your email address'
                        />
                      </div>
                      {formTouched && validationError && (
                        <p className='mt-2 text-sm text-red-600'>
                          {validationError}
                        </p>
                      )}
                    </div>

                    {/* Back to Login Link */}
                    <div className='flex items-center justify-start'>
                      <Link
                        href='/auth/login'
                        className='inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600'
                      >
                        <ArrowLeft className='h-4 w-4 mr-1' />
                        Back to login
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      type='submit'
                      disabled={isLoading}
                      className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isLoading ? (
                        <div className='flex items-center justify-center'>
                          <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                          Sending instructions...
                        </div>
                      ) : (
                        'Send reset instructions'
                      )}
                    </button>

                    {/* Divider */}
                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-gray-200'></div>
                      </div>
                      <div className='relative flex justify-center text-sm'>
                        <span className='px-2 bg-white text-gray-500'>or</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className='space-y-3'>
                      <button
                        type='button'
                        onClick={() =>
                          toast.info(
                            'Google login is under development',
                            'Feature Coming Soon'
                          )
                        }
                        className='w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all'
                      >
                        <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                          <path
                            fill='#4285F4'
                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                          />
                          <path
                            fill='#34A853'
                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                          />
                          <path
                            fill='#FBBC05'
                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                          />
                          <path
                            fill='#EA4335'
                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                          />
                        </svg>
                        Continue with Google
                      </button>

                      <button
                        type='button'
                        onClick={() =>
                          toast.info(
                            'Apple login is under development',
                            'Feature Coming Soon'
                          )
                        }
                        className='w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all'
                      >
                        <Apple className='w-5 h-5 mr-3' />
                        Continue with Apple
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className='text-center'>
                    {/* Header */}
                    <div className='mb-8'>
                      <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                        Check your email
                      </h1>
                      <p className='text-gray-600'>
                        We have sent the password reset instructions to your
                        email
                      </p>
                    </div>

                    {/* Success Icon */}
                    <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6'>
                      <CheckCircle className='h-8 w-8 text-green-600' />
                    </div>

                    {/* Success Message */}
                    <div className='mb-8 bg-green-50 border border-green-200 rounded-2xl p-4'>
                      <p className='text-sm text-green-800'>{successMessage}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className='space-y-4'>
                      <button
                        onClick={handleTryAgain}
                        className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl'
                      >
                        Try again with a different email
                      </button>

                      <Link
                        href='/auth/login'
                        className='w-full inline-flex justify-center py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all'
                      >
                        <ArrowLeft className='h-4 w-4 mr-2' />
                        Back to login
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Side - Restaurant Illustration */}
            <div className='hidden lg:flex flex-1 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 items-center justify-center p-8 relative overflow-hidden'>
              {/* Background Pattern */}
              <div className='absolute inset-0 opacity-20'>
                <div className='absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full animate-pulse'></div>
                <div className='absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-red-300 to-orange-300 rounded-full animate-bounce'></div>
                <div className='absolute top-1/2 left-5 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full animate-pulse delay-300'></div>
                <div className='absolute top-1/4 right-1/4 w-8 h-8 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full animate-bounce delay-500'></div>
              </div>

              {/* Main Restaurant Scene */}
              <div className='relative z-10 w-full h-full flex items-center justify-center'>
                <Image
                  src='/forgot.png'
                  alt='Restaurant Password Reset'
                  width={900}
                  height={900}
                  className='w-full h-full object-contain max-w-full max-h-full'
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps ForgotPasswordContent with Suspense
export default function ForgotPassword() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
