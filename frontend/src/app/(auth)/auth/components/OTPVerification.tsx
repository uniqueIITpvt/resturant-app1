'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, ArrowLeft, Smartphone } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  phoneNumber?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface OTPVerificationProps {
  userId: string;
  otpMethod: 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
  onVerificationSuccess: (data: { token: string; user: User }) => void;
  onBack: () => void;
  onSwitchMethod?: (newMethod: 'email' | 'phone', phoneNumber?: string) => void;
  isLoading?: boolean;
  context?: 'registration' | 'login';
}

export default function OTPVerification({
  userId,
  otpMethod,
  email,
  phoneNumber,
  onVerificationSuccess,
  onBack,
  onSwitchMethod,
  isLoading = false,
  context = 'registration',
}: OTPVerificationProps) {
  const toast = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showSwitchMethod, setShowSwitchMethod] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState(phoneNumber || '');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Start countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');

      // Auto-submit pasted OTP
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');

    if (otpToVerify.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otp: otpToVerify,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      toast.success('Verification successful!', 'Account Verified');
      onVerificationSuccess(data);
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Verification failed';
      setError(errorMessage);

      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async (method?: 'email' | 'phone') => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          otpMethod: method || otpMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setCountdown(60); // Start 60-second countdown
      setOtp(['', '', '', '', '', '']); // Clear current OTP

      const methodText = (method || otpMethod) === 'phone' ? 'phone' : 'email';
      toast.success(
        `Verification code resent to your ${methodText}`,
        'Code Sent'
      );

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleSwitchMethod = async () => {
    if (!onSwitchMethod) return;

    const newMethod = otpMethod === 'email' ? 'phone' : 'email';

    if (newMethod === 'phone' && !newPhoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      await onSwitchMethod(
        newMethod,
        newMethod === 'phone' ? newPhoneNumber : undefined
      );
      setShowSwitchMethod(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to switch method'
      );
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Simple formatting for display
    if (phone.startsWith('+1') && phone.length === 12) {
      return `${phone.slice(0, 2)} (${phone.slice(2, 5)}) ${phone.slice(
        5,
        8
      )}-${phone.slice(8)}`;
    }
    return phone;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100'>
          {otpMethod === 'email' ? (
            <Mail className='h-6 w-6 text-amber-600' />
          ) : (
            <Smartphone className='h-6 w-6 text-amber-600' />
          )}
        </div>
        <h2 className='mt-4 text-2xl font-bold text-gray-900'>
          {context === 'login'
            ? 'Account Verification Required'
            : `Verify Your ${otpMethod === 'email' ? 'Email' : 'Phone Number'}`}
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          {context === 'login'
            ? "Your account needs verification before you can sign in. We've sent a 6-digit verification code to "
            : "We've sent a 6-digit verification code to "}
          <span className='font-medium'>
            {otpMethod === 'email'
              ? email
              : formatPhoneNumber(phoneNumber || '')}
          </span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <p className='text-sm text-red-800'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* OTP Input */}
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Enter verification code
        </label>
        <div className='flex justify-center space-x-2'>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isVerifying || isLoading}
              className='w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:cursor-not-allowed'
            />
          ))}
        </div>
        <p className='mt-2 text-xs text-gray-500 text-center'>
          Enter the 6-digit code or paste it from your clipboard
        </p>
      </div>

      {/* Verify Button */}
      <button
        onClick={() => handleVerifyOtp()}
        disabled={otp.join('').length !== 6 || isVerifying || isLoading}
        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isVerifying ? (
          <>
            <RefreshCw className='animate-spin -ml-1 mr-3 h-5 w-5' />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </button>

      {/* Resend and Switch Options */}
      <div className='space-y-3'>
        {/* Resend OTP */}
        <div className='text-center'>
          {countdown > 0 ? (
            <p className='text-sm text-gray-500'>
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={() => handleResendOtp()}
              disabled={isResending}
              className='text-sm text-amber-600 hover:text-amber-500 font-medium disabled:opacity-50'
            >
              {isResending ? (
                <>
                  <RefreshCw className='inline animate-spin -ml-1 mr-1 h-4 w-4' />
                  Resending...
                </>
              ) : (
                'Resend verification code'
              )}
            </button>
          )}
        </div>

        {/* Switch Method */}
        {onSwitchMethod && (
          <div className='text-center'>
            {!showSwitchMethod ? (
              <button
                onClick={() => setShowSwitchMethod(true)}
                className='text-sm text-blue-600 hover:text-blue-500 font-medium'
              >
                Use {otpMethod === 'email' ? 'SMS' : 'email'} verification
                instead
              </button>
            ) : (
              <div className='bg-gray-50 rounded-md p-4 space-y-3'>
                <p className='text-sm font-medium text-gray-700'>
                  Switch to {otpMethod === 'email' ? 'SMS' : 'email'}{' '}
                  verification
                </p>

                {otpMethod === 'email' && (
                  <div>
                    <input
                      type='tel'
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      placeholder='Enter phone number'
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                    />
                  </div>
                )}

                <div className='flex space-x-2'>
                  <button
                    onClick={handleSwitchMethod}
                    className='flex-1 py-2 px-3 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    Switch Method
                  </button>
                  <button
                    onClick={() => setShowSwitchMethod(false)}
                    className='flex-1 py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className='text-center'>
        <button
          onClick={onBack}
          className='inline-flex items-center text-sm text-gray-500 hover:text-gray-700'
        >
          <ArrowLeft className='h-4 w-4 mr-1' />
          Back to {context === 'registration' ? 'registration' : 'login'}
        </button>
      </div>
    </div>
  );
}
