'use client';

import { useState, Suspense } from 'react';

interface VerificationError extends Error {
  data?: {
    requiresVerification: boolean;
    userId: string;
    email?: string;
    phoneNumber?: string;
    sentMethods?: string[];
    otpMethod?: string;
    availableMethods?: {
      email: boolean;
      phone: boolean;
    };
  };
  status?: number;
}
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Apple } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import OTPVerification from '../components/OTPVerification';
import CountryCodeSelector, {
  countries,
  type Country,
} from '../../../../components/CountryCodeSelector';
import api from '../../../../utils/api';
import Image from 'next/image';

// Create a separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userId, setUserId] = useState('');
  const [currentOtpMethod, setCurrentOtpMethod] = useState<'email' | 'phone'>(
    'email'
  );
  const [userEmail, setUserEmail] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Login form state
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
  });

  // Country code state
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to US

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [formTouched, setFormTouched] = useState({
    email: false,
    phoneNumber: false,
    password: false,
  });

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
        if (loginMethod === 'email' && !value.trim()) {
          errorMsg = 'Email is required';
        } else if (loginMethod === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
          errorMsg = 'Please enter a valid email address';
        }
        break;
      case 'phoneNumber':
        if (loginMethod === 'phone' && !value.trim()) {
          errorMsg = 'Phone number is required';
        } else if (loginMethod === 'phone' && value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
            errorMsg = 'Please enter a valid phone number';
          }
        }
        break;
      case 'password':
        if (!value) {
          errorMsg = 'Password is required';
        } else if (value.length < 6) {
          errorMsg = 'Password must be at least 6 characters';
        }
        break;
    }

    setValidationErrors({
      ...validationErrors,
      [name]: errorMsg,
    });

    return !errorMsg;
  };

  // Validate entire form
  const validateForm = () => {
    // Validate each field based on login method
    const emailValid =
      loginMethod === 'email' ? validateField('email', formData.email) : true;
    const phoneValid =
      loginMethod === 'phone'
        ? validateField('phoneNumber', formData.phoneNumber)
        : true;
    const passwordValid = validateField('password', formData.password);

    // Mark all fields as touched
    setFormTouched({
      email: loginMethod === 'email',
      phoneNumber: loginMethod === 'phone',
      password: true,
    });

    return emailValid && phoneValid && passwordValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate form before submission
    if (!validateForm()) {
      toast.warning('Please fix the validation errors', 'Form Validation');
      return;
    }

    setIsLoading(true);
    toast.loading('Signing you in...', 'Please wait');

    try {
      try {
        // Prepare login data based on method
        const loginData = {
          password: formData.password,
          ...(loginMethod === 'email'
            ? { email: formData.email }
            : {
                phoneNumber:
                  selectedCountry.dialCode +
                  formData.phoneNumber.replace(/[\s\-\(\)]/g, ''),
              }),
        };

        const data = await api.post('api/auth/login', loginData, {
          skipAuthRedirect: true,
        });

        // Handle OTP verification case
        if (data.requiresVerification || data.userId) {
          setUserId(data.userId);

          // Determine the primary OTP method based on what was sent
          let primaryMethod: 'email' | 'phone' = 'email'; // default
          if (data.sentMethods && data.sentMethods.length > 0) {
            // Use the first successful method, preferring email if both are available
            primaryMethod = data.sentMethods.includes('email')
              ? 'email'
              : data.sentMethods.includes('phone')
              ? 'phone'
              : 'email';
          } else if (
            data.otpMethod &&
            (data.otpMethod === 'email' || data.otpMethod === 'phone')
          ) {
            primaryMethod = data.otpMethod;
          }

          setCurrentOtpMethod(primaryMethod);
          setUserEmail(data.email || formData.email || '');
          setUserPhoneNumber(data.phoneNumber || formData.phoneNumber || '');
          setShowOtpVerification(true);

          // Create a more informative success message
          let successMessage = 'Please verify your account. ';
          if (data.sentMethods && data.sentMethods.length > 1) {
            successMessage +=
              'Verification codes have been sent to both your email and phone number.';
          } else if (data.sentMethods && data.sentMethods.includes('phone')) {
            successMessage +=
              'A verification code has been sent to your phone number.';
          } else {
            successMessage +=
              'A verification code has been sent to your email address.';
          }

          setSuccessMessage(successMessage);

          // Show toast notification
          const methodText =
            data.sentMethods && data.sentMethods.length > 1
              ? 'email and phone'
              : primaryMethod === 'phone'
              ? 'phone'
              : 'email';
          toast.info(
            `Verification code sent to your ${methodText}`,
            'Account Verification'
          );
          return;
        }

        // Successful login with token
        login(data.token, data.user);

        // Show success toast with user's name
        toast.celebration(
          `Welcome back, ${data.user.name}!`,
          'Login Successful'
        );

        // Redirect based on user role or the redirect parameter
        if (data.user.role === 'superadmin' || data.user.role === 'admin') {
          router.push('/dashboard');
        } else {
          // Redirect to the specified path or home page
          router.push(redirectPath);
        }
      } catch (err) {
        throw err;
      }
    } catch (error) {
      console.error('Login error:', error);

      // Check if this is a verification-required error with data
      if (
        error instanceof Error &&
        (error as VerificationError).data &&
        (error as VerificationError).data?.requiresVerification
      ) {
        // Handle verification required case
        const data = (error as VerificationError).data!;
        setUserId(data.userId);

        // Determine the OTP method based on what was sent (now only one method)
        let primaryMethod: 'email' | 'phone' = 'email'; // default
        if (
          data.otpMethod &&
          (data.otpMethod === 'email' || data.otpMethod === 'phone')
        ) {
          primaryMethod = data.otpMethod;
        } else if (data.sentMethods && data.sentMethods.length > 0) {
          // Fallback to sentMethods for backward compatibility
          primaryMethod = data.sentMethods[0] as 'email' | 'phone';
        }

        setCurrentOtpMethod(primaryMethod);
        setUserEmail(data.email || formData.email || '');
        setUserPhoneNumber(data.phoneNumber || formData.phoneNumber || '');
        setShowOtpVerification(true);

        // Create a success message based on the method used
        const methodText =
          primaryMethod === 'phone' ? 'phone number' : 'email address';
        const successMessage = `Please verify your account. A verification code has been sent to your ${methodText}.`;

        setSuccessMessage(successMessage);

        // Show toast notification
        toast.info(
          `Verification code sent to your ${methodText}`,
          'Account Verification'
        );
        return;
      }

      // Enhanced error messaging for different scenarios
      if (error instanceof Error) {
        const identifier =
          loginMethod === 'email' ? formData.email : formData.phoneNumber;
        const identifierType =
          loginMethod === 'email' ? 'email' : 'phone number';

        if (error.message.includes('User not found')) {
          const errorMsg = `Account with ${identifierType} ${identifier} doesn't exist. Please sign up first.`;
          setError(errorMsg);
          toast.warning(errorMsg, 'Account Not Found');
        } else if (
          error.message.includes('Invalid password') ||
          error.message.includes('invalid password')
        ) {
          const errorMsg = `Incorrect password for ${identifier}. Please check your password and try again.`;
          setError(errorMsg);
          toast.error(errorMsg, 'Invalid Password');
          // Clear the password field for retry
          setFormData({
            ...formData,
            password: '',
          });
        } else if (error.message.includes('not verified')) {
          const errorMsg = `Your account needs verification. We've sent a new verification code to your ${identifierType}.`;
          setError(errorMsg);
          toast.warning(errorMsg, 'Account Verification Required');
        } else if (error.message.includes('Failed to send verification code')) {
          const errorMsg = `Your account needs verification, but we couldn't send the verification code. ${error.message}`;
          setError(errorMsg);
          toast.error(errorMsg, 'Verification Failed');
        } else if (error.message.includes('Email service is not configured')) {
          const errorMsg =
            'Your account needs verification, but email service is currently unavailable. Please contact support.';
          setError(errorMsg);
          toast.network(errorMsg, 'Service Unavailable');
        } else if (
          error.message.includes('SMS service is currently unavailable')
        ) {
          const errorMsg =
            'Your account needs verification, but SMS service is currently unavailable. Please try logging in with your email address instead.';
          setError(errorMsg);
          toast.network(errorMsg, 'SMS Service Unavailable');
        } else if (error.message.includes('Authentication failed')) {
          // This is from 401 responses
          const errorMsg = `Incorrect password for ${identifier}. Please check your password and try again.`;
          setError(errorMsg);
          toast.error(errorMsg, 'Authentication Failed');
          // Clear only the password field for retry
          setFormData({
            ...formData,
            password: '',
          });
        } else {
          setError(error.message);
          toast.error(error.message, 'Login Error');
        }
      } else {
        const errorMsg =
          'An error occurred while logging in. Please try again later.';
        setError(errorMsg);
        toast.error(errorMsg, 'Login Failed');
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
      role: 'superadmin' | 'admin' | 'user';
    };
  }) => {
    // Login the user
    login(data.token, data.user);

    // Show success toast
    toast.celebration(
      `Welcome, ${data.user.name}! Your account has been verified.`,
      'Verification Successful'
    );

    // Redirect based on user role
    if (data.user.role === 'superadmin' || data.user.role === 'admin') {
      router.push('/dashboard');
    } else {
      // Redirect to the specified path or home page
      router.push(redirectPath);
    }
  };

  const handleBackToLogin = () => {
    setShowOtpVerification(false);
    setUserId('');
    setError('');
    setSuccessMessage('');
  };

  const handleSwitchOtpMethod = async (
    newMethod: 'email' | 'phone',
    phoneNumber?: string
  ) => {
    try {
      const requestData: {
        userId: string;
        method: string;
        phoneNumber?: string;
      } = {
        userId,
        method: newMethod,
      };

      if (newMethod === 'phone' && phoneNumber) {
        requestData.phoneNumber = phoneNumber;
      }

      await api.post('api/auth/resend-otp', requestData);

      setCurrentOtpMethod(newMethod);
      if (phoneNumber) {
        setUserPhoneNumber(phoneNumber);
      }

      const methodText =
        newMethod === 'phone' ? 'phone number' : 'email address';
      toast.success(
        `New verification code sent to your ${methodText}`,
        'Code Sent'
      );
    } catch (error) {
      console.error('Error switching OTP method:', error);
      toast.error(
        'Failed to send verification code. Please try again.',
        'Switch Method Failed'
      );
    }
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
            {/* Left Side - Login Form */}
            <div className='flex-1 lg:max-w-md xl:max-w-lg p-8 sm:p-12 flex flex-col justify-center'>
              {showOtpVerification ? (
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                    Verify Your Account
                  </h2>
                  <OTPVerification
                    userId={userId}
                    otpMethod={currentOtpMethod}
                    email={userEmail}
                    phoneNumber={userPhoneNumber}
                    onVerificationSuccess={handleOtpVerificationSuccess}
                    onBack={handleBackToLogin}
                    onSwitchMethod={handleSwitchOtpMethod}
                    isLoading={isLoading}
                    context='login'
                  />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                      Log in
                    </h1>
                    <p className='text-gray-600'>
                      or{' '}
                      <Link
                        href='/auth/register'
                        className='text-orange-500 hover:text-orange-600 font-medium underline'
                      >
                        create an account
                      </Link>{' '}
                      if you don&apos;t have one yet
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className='mb-6 bg-red-50 border border-red-200 rounded-2xl p-4'>
                      <p className='text-sm text-red-800'>{error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className='mb-6 bg-green-50 border border-green-200 rounded-2xl p-4'>
                      <p className='text-sm text-green-800'>{successMessage}</p>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className='space-y-6'>
                    {/* Login Method Toggle */}
                    <div className='flex bg-gray-100 rounded-xl p-1'>
                      <button
                        type='button'
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          loginMethod === 'email'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type='button'
                        onClick={() => setLoginMethod('phone')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          loginMethod === 'phone'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Phone
                      </button>
                    </div>

                    {/* Email/Phone Input */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {loginMethod === 'email'
                          ? 'Username or email'
                          : 'Phone number'}
                      </label>
                      {loginMethod === 'email' ? (
                        <div className='relative'>
                          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                            <Mail className='h-5 w-5 text-gray-400' />
                          </div>
                          <input
                            name='email'
                            type='email'
                            required
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`block w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                              formTouched.email && validationErrors.email
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder='mike142@yourmail.com'
                          />
                        </div>
                      ) : (
                        <div className='relative flex'>
                          <CountryCodeSelector
                            selectedCountry={selectedCountry}
                            onCountryChange={setSelectedCountry}
                          />
                          <div className='relative flex-1'>
                            <input
                              name='phoneNumber'
                              type='tel'
                              required
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`block w-full pl-4 pr-4 py-3 border-2 border-l-0 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                                formTouched.phoneNumber &&
                                validationErrors.phoneNumber
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              placeholder='(555) 123-4567'
                            />
                          </div>
                        </div>
                      )}
                      {loginMethod === 'email' &&
                        formTouched.email &&
                        validationErrors.email && (
                          <p className='mt-2 text-sm text-red-600'>
                            {validationErrors.email}
                          </p>
                        )}
                      {loginMethod === 'phone' &&
                        formTouched.phoneNumber &&
                        validationErrors.phoneNumber && (
                          <p className='mt-2 text-sm text-red-600'>
                            {validationErrors.phoneNumber}
                          </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Password
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
                          placeholder='••••••••••'
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

                    {/* Remember Me & Forgot Password */}
                    <div className='flex items-center justify-between'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className='h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded'
                        />
                        <span className='ml-2 text-sm text-gray-600'>
                          Remember me
                        </span>
                      </label>
                      <Link
                        href='/auth/forgot-password'
                        className='text-sm text-orange-500 hover:text-orange-600 font-medium'
                      >
                        I forgot the password
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
                          Logging in...
                        </div>
                      ) : (
                        'Log me in'
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
                      {/* Test Toast Button - Remove this after testing */}
                      <button
                        type='button'
                        onClick={() => {
                          toast.success(
                            'Test toast message for positioning',
                            'Test Toast'
                          );
                          setTimeout(
                            () =>
                              toast.error(
                                'This is an error toast',
                                'Error Test'
                              ),
                            1000
                          );
                          setTimeout(
                            () =>
                              toast.info('This is an info toast', 'Info Test'),
                            2000
                          );
                        }}
                        className='w-full flex items-center justify-center px-4 py-3 border-2 border-orange-200 rounded-xl text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 transition-all'
                      >
                        🧪 Test Toast Positioning
                      </button>

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
                        Log in with Google
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
                        Log in with Apple
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
                  src='/login1.png'
                  alt='Restaurant'
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

// Main component that wraps LoginContent with Suspense
export default function Login() {
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
      <LoginContent />
    </Suspense>
  );
}
