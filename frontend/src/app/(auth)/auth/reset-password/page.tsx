'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../../context/ToastContext';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Loading component for Suspense fallback
function LoadingState() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
        <p className='text-gray-600'>Loading...</p>
      </div>
    </div>
  );
}

// Actual reset password component
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [step, setStep] = useState(1); // 1: Form, 2: Success

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const [formTouched, setFormTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // Verify token when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError(
          'Reset token is missing. Please request a new password reset link.'
        );
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired token');
        }

        setIsTokenValid(true);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Token validation failed. Please request a new password reset link.';
        setError(errorMessage);
        toast.error(errorMessage, 'Token Validation Failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mark field as touched
    if (!formTouched[name as keyof typeof formTouched]) {
      setFormTouched({
        ...formTouched,
        [name]: true,
      });
    }

    // Validate on change if already touched
    if (formTouched[name as keyof typeof formTouched]) {
      validateField(name, value);
    }

    // Special case for password confirmation
    if (name === 'password' && formTouched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  // Field blur handler for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormTouched({
      ...formTouched,
      [name]: true,
    });
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (name: string, value: string) => {
    let errorMsg = '';

    switch (name) {
      case 'password':
        if (!value) {
          errorMsg = 'Password is required';
        } else if (value.length < 6) {
          errorMsg = 'Password must be at least 6 characters';
        } else if (value.length > 50) {
          errorMsg = 'Password must be less than 50 characters';
        } else if (!/\d/.test(value)) {
          errorMsg = 'Password must contain at least one number';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errorMsg = 'Please confirm your password';
        } else if (value !== formData.password) {
          errorMsg = 'Passwords do not match';
        }
        break;
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));

    return !errorMsg;
  };

  // Validate entire form
  const validateForm = () => {
    // Validate each field
    const passwordValid = validateField('password', formData.password);
    const confirmPasswordValid = validateField(
      'confirmPassword',
      formData.confirmPassword
    );

    // Mark all fields as touched
    setFormTouched({
      password: true,
      confirmPassword: true,
    });

    return passwordValid && confirmPasswordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      // Show success message and move to step 2
      setSuccessMessage(
        'Your password has been reset successfully! You can now log in with your new password.'
      );
      setStep(2);
      toast.success('Password reset successfully!', 'Password Updated');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while resetting your password';
      setError(errorMessage);
      toast.error(errorMessage, 'Reset Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4'>
        <div className='relative z-10 w-full max-w-6xl mx-auto'>
          <div className='bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100'>
            <div className='flex flex-col lg:flex-row min-h-[600px]'>
              <div className='flex-1 lg:max-w-md xl:max-w-lg p-8 sm:p-12 flex flex-col justify-center'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                    Verifying reset token...
                  </h2>
                  <p className='text-gray-600'>
                    Please wait while we verify your password reset link.
                  </p>
                </div>
              </div>
              <div className='hidden lg:flex flex-1 bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100 items-center justify-center p-8 relative overflow-hidden'>
                <div className='relative z-10 w-full h-full flex items-center justify-center'>
                  <Image
                    src='/login1.png'
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
              {!isTokenValid ? (
                <>
                  {/* Invalid Token State */}
                  <div className='text-center'>
                    <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6'>
                      <AlertCircle className='h-8 w-8 text-red-600' />
                    </div>

                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Invalid Reset Link
                    </h1>
                    <p className='text-gray-600 mb-6'>
                      This password reset link is invalid or has expired.
                    </p>

                    {error && (
                      <div className='mb-6 bg-red-50 border border-red-200 rounded-2xl p-4'>
                        <p className='text-sm text-red-800'>{error}</p>
                      </div>
                    )}

                    <div className='space-y-4'>
                      <Link
                        href='/auth/forgot-password'
                        className='w-full inline-flex justify-center py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl'
                      >
                        Request new reset link
                      </Link>

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
              ) : step === 1 ? (
                <>
                  {/* Reset Password Form */}
                  <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Reset your password
                    </h1>
                    <p className='text-gray-600'>
                      Enter your new password below to complete the reset
                      process.
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
                    {/* Password Input */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        New Password
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <Lock className='h-5 w-5 text-gray-400' />
                        </div>
                        <input
                          name='password'
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                            formTouched.password && validationErrors.password
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Enter your new password'
                        />
                        <div className='absolute inset-y-0 right-0 pr-4 flex items-center'>
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='text-gray-400 hover:text-gray-600 focus:outline-none'
                          >
                            {showPassword ? (
                              <EyeOff className='h-5 w-5' />
                            ) : (
                              <Eye className='h-5 w-5' />
                            )}
                          </button>
                        </div>
                      </div>
                      {formTouched.password && validationErrors.password && (
                        <p className='mt-2 text-sm text-red-600'>
                          {validationErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Confirm New Password
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                          <Lock className='h-5 w-5 text-gray-400' />
                        </div>
                        <input
                          name='confirmPassword'
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                            formTouched.confirmPassword &&
                            validationErrors.confirmPassword
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Confirm your new password'
                        />
                        <div className='absolute inset-y-0 right-0 pr-4 flex items-center'>
                          <button
                            type='button'
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className='text-gray-400 hover:text-gray-600 focus:outline-none'
                          >
                            {showConfirmPassword ? (
                              <EyeOff className='h-5 w-5' />
                            ) : (
                              <Eye className='h-5 w-5' />
                            )}
                          </button>
                        </div>
                      </div>
                      {formTouched.confirmPassword &&
                        validationErrors.confirmPassword && (
                          <p className='mt-2 text-sm text-red-600'>
                            {validationErrors.confirmPassword}
                          </p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className='bg-gray-50 border border-gray-200 rounded-xl p-4'>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Password requirements:
                      </h4>
                      <ul className='text-xs text-gray-600 space-y-1'>
                        <li className='flex items-center'>
                          <Check
                            className={`h-3 w-3 mr-2 ${
                              formData.password.length >= 6
                                ? 'text-green-500'
                                : 'text-gray-400'
                            }`}
                          />
                          At least 6 characters
                        </li>
                        <li className='flex items-center'>
                          <Check
                            className={`h-3 w-3 mr-2 ${
                              /\d/.test(formData.password)
                                ? 'text-green-500'
                                : 'text-gray-400'
                            }`}
                          />
                          Contains at least one number
                        </li>
                        <li className='flex items-center'>
                          <Check
                            className={`h-3 w-3 mr-2 ${
                              formData.password === formData.confirmPassword &&
                              formData.confirmPassword
                                ? 'text-green-500'
                                : 'text-gray-400'
                            }`}
                          />
                          Passwords match
                        </li>
                      </ul>
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
                          Resetting password...
                        </div>
                      ) : (
                        'Reset password'
                      )}
                    </button>

                    {/* Back to Login Link */}
                    <div className='text-center'>
                      <Link
                        href='/auth/login'
                        className='inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-600'
                      >
                        <ArrowLeft className='h-4 w-4 mr-1' />
                        Back to login
                      </Link>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <div className='text-center'>
                    <div className='mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6'>
                      <CheckCircle className='h-8 w-8 text-green-600' />
                    </div>

                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Password reset successful!
                    </h1>
                    <p className='text-gray-600 mb-6'>
                      Your password has been successfully reset. You can now log
                      in with your new password.
                    </p>

                    {successMessage && (
                      <div className='mb-6 bg-green-50 border border-green-200 rounded-2xl p-4'>
                        <p className='text-sm text-green-800'>
                          {successMessage}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleGoToLogin}
                      className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl'
                    >
                      Continue to login
                    </button>
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
                  src='/login1.png'
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

// Main component that wraps ResetPasswordContent with Suspense
export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
