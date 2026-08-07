'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  Apple,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import OTPVerification from '../components/OTPVerification';
import CountryCodeSelector, {
  countries,
  type Country,
} from '../../../../components/CountryCodeSelector';
import api from '../../../../utils/api';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create a separate component for the main content
function RegisterContent() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Register form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    otpMethod: 'email' as 'email' | 'phone',
  });

  // Country code state
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to US

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [formTouched, setFormTouched] = useState({
    email: false,
    name: false,
    password: false,
    confirmPassword: false,
    phoneNumber: false,
  });

  // Availability checking states
  const [availabilityStatus, setAvailabilityStatus] = useState({
    email: { checking: false, available: null, message: '' },
    phoneNumber: { checking: false, available: null, message: '' },
  });
  const [availabilityTimeouts, setAvailabilityTimeouts] = useState({
    email: null as NodeJS.Timeout | null,
    phoneNumber: null as NodeJS.Timeout | null,
  });

  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userId, setUserId] = useState('');
  const [currentOtpMethod, setCurrentOtpMethod] = useState<'email' | 'phone'>(
    'email'
  );
  const [methodAutoSwitched, setMethodAutoSwitched] = useState(false);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(availabilityTimeouts).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [availabilityTimeouts]);

  // Check availability function
  const checkAvailability = useCallback(
    async (field: 'email' | 'phoneNumber', value: string) => {
      if (!value.trim()) return;

      // Clear previous timeout
      if (availabilityTimeouts[field]) {
        clearTimeout(availabilityTimeouts[field]!);
      }

      // Set checking state
      setAvailabilityStatus((prev) => ({
        ...prev,
        [field]: { checking: true, available: null, message: '' },
      }));

      try {
        const checkData: Record<string, string> = {};
        checkData[field] = value;

        await api.post('api/auth/check-availability', checkData);

        setAvailabilityStatus((prev) => ({
          ...prev,
          [field]: {
            checking: false,
            available: true,
            message: `${
              field === 'email' ? 'Email' : 'Phone number'
            } is available`,
          },
        }));
      } catch (error: unknown) {
        const apiError = error as {
          status?: number;
          data?: { conflicts?: Array<{ field: string; message: string }> };
          message?: string;
        };

        if (apiError.status === 409) {
          // Conflict - already exists
          const conflict = apiError.data?.conflicts?.find(
            (c) => c.field === field
          );
          setAvailabilityStatus((prev) => ({
            ...prev,
            [field]: {
              checking: false,
              available: false,
              message:
                conflict?.message ||
                `${
                  field === 'email' ? 'Email' : 'Phone number'
                } is already taken`,
            },
          }));
        } else if (
          apiError.message &&
          apiError.message.includes('already exists')
        ) {
          // Handle direct error message about existing records
          setAvailabilityStatus((prev) => ({
            ...prev,
            [field]: {
              checking: false,
              available: false,
              message: `${
                field === 'email' ? 'Email' : 'Phone number'
              } is already taken`,
            },
          }));
        } else {
          // Other error - reset status but log for debugging
          console.error('Unexpected availability check error:', error);
          setAvailabilityStatus((prev) => ({
            ...prev,
            [field]: { checking: false, available: null, message: '' },
          }));
        }
      }
    },
    [availabilityTimeouts]
  );

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

    // Check availability for email and phone number with debounce
    if (name === 'email' || name === 'phoneNumber') {
      // Clear previous timeout
      if (availabilityTimeouts[name as keyof typeof availabilityTimeouts]) {
        clearTimeout(
          availabilityTimeouts[name as keyof typeof availabilityTimeouts]!
        );
      }

      // Clear availability status if field is empty
      if (!value.trim()) {
        setAvailabilityStatus((prev) => ({
          ...prev,
          [name]: { checking: false, available: null, message: '' },
        }));
        return;
      }

      // Set new timeout for checking availability
      const timeoutId = setTimeout(() => {
        if (name === 'email' && /^\S+@\S+\.\S+$/.test(value)) {
          checkAvailability('email', value);
        } else if (name === 'phoneNumber' && value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          // Create full phone number with country code for validation
          const fullPhoneNumber = selectedCountry.dialCode + cleanPhone;
          if (phoneRegex.test(cleanPhone) && cleanPhone.length >= 7) {
            checkAvailability('phoneNumber', fullPhoneNumber);
          } else {
            // Clear status for invalid phone format
            setAvailabilityStatus((prev) => ({
              ...prev,
              phoneNumber: { checking: false, available: null, message: '' },
            }));
          }
        }
      }, 1000); // 1 second debounce

      setAvailabilityTimeouts((prev) => ({
        ...prev,
        [name]: timeoutId,
      }));
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
      case 'email':
        if (!value.trim()) {
          errorMsg = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          errorMsg = 'Please enter a valid email address';
        }
        break;
      case 'name':
        if (!value.trim()) {
          errorMsg = 'Full name is required';
        } else if (value.trim().length < 3) {
          errorMsg = 'Name must be at least 3 characters';
        } else if (value.trim().length > 50) {
          errorMsg = 'Name must be less than 50 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errorMsg = 'Name can only contain letters and spaces';
        }
        break;
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
      case 'phoneNumber':
        if (formData.otpMethod === 'phone' && !value.trim()) {
          errorMsg = 'Phone number is required for SMS verification';
        } else if (value.trim()) {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');

          // Basic format validation
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(cleanPhone)) {
            errorMsg = 'Please enter a valid phone number';
          } else if (cleanPhone.length < 7) {
            errorMsg = 'Phone number must be at least 7 digits';
          } else if (cleanPhone.length > 15) {
            errorMsg = 'Phone number must be less than 15 digits';
          } else {
            // Country-specific validation
            if (selectedCountry.dialCode === '+1') {
              // US/Canada validation
              if (cleanPhone.length !== 10) {
                errorMsg = 'US/Canada phone numbers must be 10 digits';
              } else if (cleanPhone[0] === '0' || cleanPhone[0] === '1') {
                errorMsg = 'US/Canada area codes cannot start with 0 or 1';
              } else if (cleanPhone[3] === '0' || cleanPhone[3] === '1') {
                errorMsg = 'US/Canada exchange codes cannot start with 0 or 1';
              }
            } else if (selectedCountry.dialCode === '+91') {
              // India validation
              if (cleanPhone.length !== 10) {
                errorMsg = 'Indian phone numbers must be 10 digits';
              } else if (!['6', '7', '8', '9'].includes(cleanPhone[0])) {
                errorMsg =
                  'Indian mobile numbers must start with 6, 7, 8, or 9';
              }
            }
          }
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
    const emailValid = validateField('email', formData.email);
    const nameValid = validateField('name', formData.name);
    const passwordValid = validateField('password', formData.password);
    const confirmPasswordValid = validateField(
      'confirmPassword',
      formData.confirmPassword
    );
    const phoneValid = validateField('phoneNumber', formData.phoneNumber);

    // Check availability status
    const emailAvailable = availabilityStatus.email.available !== false;
    const phoneAvailable = availabilityStatus.phoneNumber.available !== false;

    // Mark all fields as touched
    setFormTouched({
      email: true,
      name: true,
      password: true,
      confirmPassword: true,
      phoneNumber: true,
    });

    // Show error if email or phone is not available
    if (!emailAvailable) {
      setError('Email address is already taken. Please use a different email.');
      return false;
    }

    if (formData.phoneNumber && !phoneAvailable) {
      setError(
        'Phone number is already taken. Please use a different phone number.'
      );
      return false;
    }

    return (
      emailValid &&
      nameValid &&
      passwordValid &&
      confirmPasswordValid &&
      phoneValid &&
      emailAvailable &&
      phoneAvailable
    );
  };

  const handleOtpMethodChange = (method: 'email' | 'phone') => {
    setFormData({
      ...formData,
      otpMethod: method,
    });

    // Reset auto-switch indicator when user manually changes method
    setMethodAutoSwitched(false);

    // Validate phone number if switching to phone method
    if (method === 'phone') {
      validateField('phoneNumber', formData.phoneNumber);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Additional validation before sending request
      if (!formData.name.trim()) {
        setError('Name is required');
        setIsLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        setIsLoading(false);
        return;
      }
      if (!formData.password.trim()) {
        setError('Password is required');
        setIsLoading(false);
        return;
      }
      if (formData.otpMethod === 'phone' && !formData.phoneNumber.trim()) {
        setError('Phone number is required for SMS verification');
        setIsLoading(false);
        return;
      }

      // Prepare phone number with country code if provided
      const fullPhoneNumber = formData.phoneNumber.trim()
        ? selectedCountry.dialCode +
          formData.phoneNumber.replace(/[\s\-\(\)]/g, '')
        : undefined;

      console.log('Sending registration data:', {
        email: formData.email.trim(),
        name: formData.name.trim(),
        phoneNumber: fullPhoneNumber,
        otpMethod: formData.otpMethod,
      });

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim(),
          password: formData.password,
          phoneNumber: fullPhoneNumber,
          otpMethod: formData.otpMethod,
        }),
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      // Log detailed error information for 400 status
      if (response.status === 400) {
        console.error('400 Bad Request Details:', {
          message: data.message,
          errors: data.errors,
          validation: data.validation,
          fullResponse: data,
        });
      }

      if (!response.ok) {
        // Debug: Log the exact error message and method
        console.log('Error response details:', {
          message: data.message,
          otpMethod: formData.otpMethod,
          messageIncludes: {
            'Failed to send OTP via phone': data.message?.includes(
              'Failed to send OTP via phone'
            ),
            'SMS verification is': data.message?.includes(
              'SMS verification is'
            ),
            'use email verification instead': data.message?.includes(
              'use email verification instead'
            ),
          },
        });

        // Check if this is an SMS-related error
        const isSMSError =
          data.message &&
          (data.message.includes('SMS verification is currently unavailable') ||
            data.message.includes('Failed to send OTP via phone') ||
            data.message.includes('SMS service unavailable') ||
            data.message.includes('Phone verification unavailable') ||
            data.message.includes('SMS verification is') ||
            data.message.includes('use email verification instead') ||
            data.message.includes('SMS service authentication failed') ||
            data.message.includes('Twilio client not initialized') ||
            data.message.includes(
              'SMS verification is currently unavailable for this phone number'
            ) ||
            data.message.includes('Invalid phone number format') ||
            data.message.includes("Invalid 'To' Phone Number") ||
            data.message.includes('unverified') ||
            data.message.includes('Trial accounts cannot send messages'));

        console.log('SMS Error Detection:', {
          isSMSError,
          currentMethod: formData.otpMethod,
          willAutoSwitch: isSMSError && formData.otpMethod === 'phone',
        });

        // Handle specific SMS verification errors before throwing generic error
        if (isSMSError) {
          // Automatically switch to email method and retry if user was using phone
          if (formData.otpMethod === 'phone') {
            console.log(
              'SMS unavailable, switching to email verification and retrying automatically'
            );

            // Switch to email method immediately
            setFormData((prev) => ({
              ...prev,
              otpMethod: 'email',
            }));
            setMethodAutoSwitched(true);

            // Show user-friendly message
            let errorMessage =
              'SMS verification is not available for this phone number. Automatically switching to email verification...';

            // Provide more specific guidance for phone number format issues
            if (
              data.message.includes('Invalid phone number format') ||
              data.message.includes("Invalid 'To' Phone Number")
            ) {
              errorMessage =
                'The phone number format is invalid for SMS verification. Switching to email verification...';
            } else if (
              data.message.includes('unverified') ||
              data.message.includes('Trial accounts cannot send messages')
            ) {
              errorMessage =
                'SMS verification is not available for this phone number (trial account limitation). Switching to email verification...';
            }

            setError(errorMessage);
            toast.network(
              'SMS unavailable. Switching to email verification...',
              'SMS Service Unavailable'
            );

            // Automatically retry with email verification
            try {
              console.log('Retrying registration with email verification...');

              const retryResponse = await fetch(
                `${API_URL}/api/auth/register`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: formData.email.trim(),
                    name: formData.name.trim(),
                    password: formData.password,
                    phoneNumber: fullPhoneNumber,
                    otpMethod: 'email', // Force email method
                  }),
                }
              );

              const retryData = await retryResponse.json();
              console.log('Retry registration response:', {
                status: retryResponse.status,
                data: retryData,
              });

              if (!retryResponse.ok) {
                throw new Error(
                  retryData.message || 'Email verification also failed'
                );
              }

              // Success with email verification
              setUserId(retryData.userId);
              setCurrentOtpMethod('email');
              setShowOtpVerification(true);

              setSuccessMessage(
                'Registration successful! A 6-digit verification code has been sent to your email.'
              );

              toast.success(
                'Registration successful! Please check your email for verification code.',
                'Account Created'
              );
              setIsLoading(false);
              return; // Exit successfully
            } catch (retryError) {
              console.error('Email verification retry failed:', retryError);
              setError(
                'Both SMS and email verification failed. Please try again later or contact support.'
              );
              setIsLoading(false);
              return;
            }
          } else {
            // User was already using email, just show error
            setError(
              'SMS verification is temporarily unavailable. Please use email verification instead.'
            );
            setIsLoading(false);
            return;
          }
        }

        // Handle 400 Bad Request with specific validation errors
        if (response.status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            // Handle validation errors array
            const errorMessages = data.errors
              .map((err: { msg?: string; message?: string } | string) =>
                typeof err === 'string'
                  ? err
                  : err.msg || err.message || 'Validation error'
              )
              .join(', ');
            throw new Error(errorMessages);
          } else if (data.validation && Array.isArray(data.validation)) {
            // Handle validation array
            const errorMessages = data.validation
              .map((err: { msg?: string; message?: string } | string) =>
                typeof err === 'string'
                  ? err
                  : err.msg || err.message || 'Validation error'
              )
              .join(', ');
            throw new Error(errorMessages);
          }
        }

        throw new Error(
          data.message || `Registration failed with status ${response.status}`
        );
      }

      // Registration was successful, proceed to OTP verification
      setUserId(data.userId);
      setCurrentOtpMethod(data.otpMethod || formData.otpMethod);
      setShowOtpVerification(true);

      // Show success message for OTP sent
      const methodText = data.otpMethod === 'phone' ? 'phone number' : 'email';
      setSuccessMessage(
        `Registration successful! A 6-digit verification code has been sent to your ${methodText}.`
      );

      // Show toast notification
      toast.success(
        `Registration successful! Please verify your ${methodText}.`,
        'Account Created'
      );
    } catch (error) {
      console.error('Registration error:', error);

      // Enhanced error messaging for different scenarios
      if (error instanceof Error) {
        if (error.message.includes('User with this email already exists')) {
          setError(
            `An account with email ${formData.email} already exists. Please login instead.`
          );
        } else if (
          error.message.includes('SMS verification is currently unavailable') ||
          error.message.includes('Failed to send OTP via phone') ||
          error.message.includes('SMS verification is') ||
          error.message.includes('use email verification instead')
        ) {
          setError(
            'SMS verification is currently unavailable. Please use email verification instead.'
          );
          // Automatically switch to email method
          setFormData((prev) => ({
            ...prev,
            otpMethod: 'email',
          }));
          setMethodAutoSwitched(true);
          toast.network(
            'SMS unavailable. Switching to email verification...',
            'SMS Service Unavailable'
          );
        } else if (error.message.includes('Invalid email format')) {
          setError('Please enter a valid email address.');
        } else if (error.message.includes('Invalid phone number format')) {
          setError('Please enter a valid phone number.');
        } else if (
          error.message.includes(
            'Phone number is required for phone verification'
          )
        ) {
          setError(
            'Phone number is required for SMS verification. Please enter a phone number or switch to email verification.'
          );
          // Automatically switch to email method
          setFormData((prev) => ({
            ...prev,
            otpMethod: 'email',
          }));
          setMethodAutoSwitched(true);
        } else if (error.message.includes('password')) {
          setError('Password issue: ' + error.message);
        } else {
          setError(error.message);
        }
      } else {
        setError(
          'An error occurred during registration. Please try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerificationSuccess = (data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin' | 'superadmin';
    };
  }) => {
    // Successful verification and login
    login(data.token, data.user);

    // Show success toast
    toast.success(
      `Welcome, ${data.user.name}! Your account has been verified successfully.`,
      'Account Verified'
    );

    router.push('/');
  };

  const handleSwitchOtpMethod = async (
    newMethod: 'email' | 'phone',
    phoneNumber?: string
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/switch-otp-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newMethod,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to switch OTP method');
      }

      setCurrentOtpMethod(newMethod);
      const methodText = newMethod === 'phone' ? 'phone' : 'email';
      toast.success(
        `Switched to ${methodText} verification. New code sent.`,
        'OTP Method Switched'
      );
    } catch (error) {
      console.error('Switch OTP method error:', error);
      throw error;
    }
  };

  const handleBackToRegistration = () => {
    setShowOtpVerification(false);
    setUserId('');
    setError('');
    setSuccessMessage('');
    setMethodAutoSwitched(false);
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
      <div className='relative z-10 w-full max-w-6xl mx-auto h-[95vh]'>
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 h-full'>
          <div className='flex flex-col lg:flex-row h-full'>
            {/* Left Side - Registration Form */}
            <div className='flex-1 lg:max-w-md xl:max-w-lg p-4 sm:p-6 flex flex-col justify-center overflow-y-auto'>
              {showOtpVerification ? (
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Verify Your Account
                  </h2>
                  <OTPVerification
                    userId={userId}
                    otpMethod={currentOtpMethod}
                    email={formData.email}
                    phoneNumber={formData.phoneNumber}
                    onVerificationSuccess={handleOtpVerificationSuccess}
                    onBack={handleBackToRegistration}
                    onSwitchMethod={handleSwitchOtpMethod}
                    isLoading={isLoading}
                    context='registration'
                  />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className='mb-4'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-1'>
                      Create Account
                    </h1>
                    <p className='text-sm text-gray-600'>
                      or{' '}
                      <Link
                        href='/auth/login'
                        className='text-orange-500 hover:text-orange-600 font-medium underline'
                      >
                        sign in to your account
                      </Link>{' '}
                      if you already have one
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className='mb-3 bg-red-50 border border-red-200 rounded-xl p-3'>
                      <p className='text-xs text-red-800'>
                        {error}
                        {error.includes('already exists') && (
                          <span className='block mt-1'>
                            <Link
                              href='/auth/login'
                              className='text-orange-500 hover:text-orange-600 font-medium underline'
                            >
                              Go to login
                            </Link>
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className='mb-3 bg-green-50 border border-green-200 rounded-xl p-3'>
                      <p className='text-xs text-green-800'>{successMessage}</p>
                    </div>
                  )}

                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className='space-y-4'>
                    {/* Name Field */}
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Full Name
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <User className='h-4 w-4 text-gray-400' />
                        </div>
                        <input
                          name='name'
                          type='text'
                          required
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                            formTouched.name && validationErrors.name
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Enter your full name'
                        />
                      </div>
                      {formTouched.name && validationErrors.name && (
                        <p className='mt-1 text-xs text-red-600'>
                          {validationErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Email Address
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Mail className='h-4 w-4 text-gray-400' />
                        </div>
                        <input
                          name='email'
                          type='email'
                          required
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                            (formTouched.email && validationErrors.email) ||
                            availabilityStatus.email.available === false
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : availabilityStatus.email.available === true
                              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Enter your email address'
                        />
                        <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                          {availabilityStatus.email.checking && (
                            <Loader2 className='h-3 w-3 text-gray-400 animate-spin' />
                          )}
                          {!availabilityStatus.email.checking &&
                            availabilityStatus.email.available === true && (
                              <CheckCircle className='h-3 w-3 text-green-500' />
                            )}
                          {!availabilityStatus.email.checking &&
                            availabilityStatus.email.available === false && (
                              <XCircle className='h-3 w-3 text-red-500' />
                            )}
                        </div>
                      </div>
                      {formTouched.email && validationErrors.email && (
                        <p className='mt-1 text-xs text-red-600'>
                          {validationErrors.email}
                        </p>
                      )}
                      {!validationErrors.email &&
                        availabilityStatus.email.message && (
                          <p
                            className={`mt-1 text-xs ${
                              availabilityStatus.email.available === true
                                ? 'text-green-600'
                                : availabilityStatus.email.available === false
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {availabilityStatus.email.message}
                          </p>
                        )}
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Phone Number (Optional)
                      </label>
                      <div className='relative flex'>
                        <CountryCodeSelector
                          selectedCountry={selectedCountry}
                          onCountryChange={setSelectedCountry}
                        />
                        <div className='relative flex-1'>
                          <input
                            name='phoneNumber'
                            type='tel'
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`block w-full pl-4 pr-10 py-2 border-2 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                              (formTouched.phoneNumber &&
                                validationErrors.phoneNumber) ||
                              availabilityStatus.phoneNumber.available === false
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : availabilityStatus.phoneNumber.available ===
                                  true
                                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder={
                              selectedCountry.dialCode === '+1'
                                ? '(555) 123-4567'
                                : selectedCountry.dialCode === '+91'
                                ? '9876543210'
                                : 'Enter phone number'
                            }
                          />
                          <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                            {availabilityStatus.phoneNumber.checking && (
                              <Loader2 className='h-3 w-3 text-gray-400 animate-spin' />
                            )}
                            {!availabilityStatus.phoneNumber.checking &&
                              availabilityStatus.phoneNumber.available ===
                                true && (
                                <CheckCircle className='h-3 w-3 text-green-500' />
                              )}
                            {!availabilityStatus.phoneNumber.checking &&
                              availabilityStatus.phoneNumber.available ===
                                false && (
                                <XCircle className='h-3 w-3 text-red-500' />
                              )}
                          </div>
                        </div>
                      </div>
                      {formTouched.phoneNumber &&
                        validationErrors.phoneNumber && (
                          <p className='mt-1 text-xs text-red-600'>
                            {validationErrors.phoneNumber}
                          </p>
                        )}
                      {!validationErrors.phoneNumber &&
                        availabilityStatus.phoneNumber.message && (
                          <p
                            className={`mt-1 text-xs ${
                              availabilityStatus.phoneNumber.available === true
                                ? 'text-green-600'
                                : availabilityStatus.phoneNumber.available ===
                                  false
                                ? 'text-red-600'
                                : 'text-gray-600'
                            }`}
                          >
                            {availabilityStatus.phoneNumber.message}
                          </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Password
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Lock className='h-4 w-4 text-gray-400' />
                        </div>
                        <input
                          name='password'
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                            formTouched.password && validationErrors.password
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Enter your password'
                        />
                        <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='text-gray-400 hover:text-gray-600 focus:outline-none'
                          >
                            {showPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                      </div>
                      {formTouched.password && validationErrors.password && (
                        <p className='mt-1 text-xs text-red-600'>
                          {validationErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Confirm Password
                      </label>
                      <div className='relative'>
                        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                          <Lock className='h-4 w-4 text-gray-400' />
                        </div>
                        <input
                          name='confirmPassword'
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`block w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm ${
                            formTouched.confirmPassword &&
                            validationErrors.confirmPassword
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder='Confirm your password'
                        />
                        <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                          <button
                            type='button'
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className='text-gray-400 hover:text-gray-600 focus:outline-none'
                          >
                            {showConfirmPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                      </div>
                      {formTouched.confirmPassword &&
                        validationErrors.confirmPassword && (
                          <p className='mt-1 text-xs text-red-600'>
                            {validationErrors.confirmPassword}
                          </p>
                        )}
                    </div>

                    {/* OTP Method Selection */}
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-2'>
                        Verification Method
                        {methodAutoSwitched && (
                          <span className='ml-2 text-xs text-orange-600 font-medium'>
                            (Auto-switched to email)
                          </span>
                        )}
                      </label>
                      <div className='space-y-2'>
                        <label className='flex items-center'>
                          <input
                            type='radio'
                            name='otpMethod'
                            value='email'
                            checked={formData.otpMethod === 'email'}
                            onChange={(e) =>
                              handleOtpMethodChange(
                                e.target.value as 'email' | 'phone'
                              )
                            }
                            className='h-3 w-3 text-orange-500 focus:ring-orange-500 border-gray-300'
                          />
                          <span className='ml-2 text-xs text-gray-700'>
                            Send verification code to email
                          </span>
                        </label>
                        <label className='flex items-center'>
                          <input
                            type='radio'
                            name='otpMethod'
                            value='phone'
                            checked={formData.otpMethod === 'phone'}
                            onChange={(e) =>
                              handleOtpMethodChange(
                                e.target.value as 'email' | 'phone'
                              )
                            }
                            disabled={!formData.phoneNumber.trim()}
                            className='h-3 w-3 text-orange-500 focus:ring-orange-500 border-gray-300 disabled:opacity-50'
                          />
                          <span
                            className={`ml-2 text-xs ${
                              !formData.phoneNumber.trim()
                                ? 'text-gray-400'
                                : 'text-gray-700'
                            }`}
                          >
                            Send verification code to phone number
                            {!formData.phoneNumber.trim() && (
                              <span className='text-gray-400'>
                                {' '}
                                (requires phone number)
                              </span>
                            )}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type='submit'
                      disabled={isLoading}
                      className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm'
                    >
                      {isLoading ? (
                        <div className='flex items-center justify-center'>
                          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>

                    {/* Divider */}
                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-gray-200'></div>
                      </div>
                      <div className='relative flex justify-center text-xs'>
                        <span className='px-2 bg-white text-gray-500'>or</span>
                      </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className='space-y-2'>
                      <button
                        type='button'
                        onClick={() =>
                          toast.info(
                            'Google signup is under development',
                            'Feature Coming Soon'
                          )
                        }
                        className='w-full flex items-center justify-center px-3 py-2 border-2 border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all'
                      >
                        <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
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
                        Sign up with Google
                      </button>

                      <button
                        type='button'
                        onClick={() =>
                          toast.info(
                            'Apple signup is under development',
                            'Feature Coming Soon'
                          )
                        }
                        className='w-full flex items-center justify-center px-3 py-2 border-2 border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all'
                      >
                        <Apple className='w-4 h-4 mr-2' />
                        Sign up with Apple
                      </button>
                    </div>
                  </form>
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
                  src='/login2.png'
                  alt='Restaurant Registration'
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

// Main component that wraps RegisterContent with Suspense
export default function Register() {
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
      <RegisterContent />
    </Suspense>
  );
}
