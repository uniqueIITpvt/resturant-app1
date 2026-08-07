'use client';

import { useState } from 'react';
import { Mail, Phone, Check } from 'lucide-react';

interface OTPMethodSelectorProps {
  selectedMethod: 'email' | 'phone';
  onMethodChange: (method: 'email' | 'phone') => void;
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  email: string;
  disabled?: boolean;
  showPhoneInput?: boolean;
}

export default function OTPMethodSelector({
  selectedMethod,
  onMethodChange,
  phoneNumber,
  onPhoneNumberChange,
  email,
  disabled = false,
  showPhoneInput = true,
}: OTPMethodSelectorProps) {
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required for SMS verification');
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (!phoneRegex.test(cleanPhone)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }

    if (cleanPhone.length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (value: string) => {
    onPhoneNumberChange(value);
    if (value.trim()) {
      validatePhoneNumber(value);
    } else {
      setPhoneError('');
    }
  };

  const handleMethodSelect = (method: 'email' | 'phone') => {
    if (method === 'phone' && !validatePhoneNumber(phoneNumber)) {
      return;
    }
    onMethodChange(method);
  };

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-3'>
          Choose verification method
        </label>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {/* Email Option */}
          <div
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedMethod === 'email'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && handleMethodSelect('email')}
          >
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Mail
                  className={`h-5 w-5 ${
                    selectedMethod === 'email'
                      ? 'text-amber-600'
                      : 'text-gray-400'
                  }`}
                />
              </div>
              <div className='ml-3 flex-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        selectedMethod === 'email'
                          ? 'text-amber-900'
                          : 'text-gray-900'
                      }`}
                    >
                      Email Verification
                    </p>
                    <p
                      className={`text-xs ${
                        selectedMethod === 'email'
                          ? 'text-amber-700'
                          : 'text-gray-500'
                      }`}
                    >
                      Send OTP to {email || 'your email'}
                    </p>
                  </div>
                  {selectedMethod === 'email' && (
                    <Check className='h-5 w-5 text-amber-600' />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phone Option */}
          <div
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedMethod === 'phone'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() =>
              !disabled &&
              phoneNumber &&
              validatePhoneNumber(phoneNumber) &&
              handleMethodSelect('phone')
            }
          >
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Phone
                  className={`h-5 w-5 ${
                    selectedMethod === 'phone'
                      ? 'text-amber-600'
                      : 'text-gray-400'
                  }`}
                />
              </div>
              <div className='ml-3 flex-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        selectedMethod === 'phone'
                          ? 'text-amber-900'
                          : 'text-gray-900'
                      }`}
                    >
                      SMS Verification
                    </p>
                    <p
                      className={`text-xs ${
                        selectedMethod === 'phone'
                          ? 'text-amber-700'
                          : 'text-gray-500'
                      }`}
                    >
                      Send OTP to your phone
                    </p>
                  </div>
                  {selectedMethod === 'phone' && (
                    <Check className='h-5 w-5 text-amber-600' />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number Input */}
      {showPhoneInput && (
        <div>
          <label
            htmlFor='phoneNumber'
            className='block text-sm font-medium text-gray-700'
          >
            Phone Number{' '}
            {selectedMethod === 'phone' && (
              <span className='text-red-500'>*</span>
            )}
          </label>
          <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Phone className='h-5 w-5 text-gray-400' />
            </div>
            <input
              type='tel'
              id='phoneNumber'
              name='phoneNumber'
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={disabled}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                phoneError
                  ? 'border-red-300 text-red-900 placeholder-red-300'
                  : 'border-gray-300 placeholder-gray-400'
              } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder='+1 (555) 123-4567'
            />
          </div>
          {phoneError && (
            <p className='mt-1 text-sm text-red-600'>{phoneError}</p>
          )}
          <p className='mt-1 text-xs text-gray-500'>
            Enter your phone number with country code (e.g., +1 for US, +91 for
            India)
          </p>
        </div>
      )}

      {/* Method Selection Info */}
      <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            {selectedMethod === 'email' ? (
              <Mail className='h-5 w-5 text-blue-400' />
            ) : (
              <Phone className='h-5 w-5 text-blue-400' />
            )}
          </div>
          <div className='ml-3'>
            <p className='text-sm text-blue-800'>
              {selectedMethod === 'email' ? (
                <>
                  A 6-digit verification code will be sent to{' '}
                  <strong>{email}</strong>. Please check your inbox and spam
                  folder.
                </>
              ) : (
                <>
                  A 6-digit verification code will be sent via SMS to{' '}
                  <strong>{phoneNumber || 'your phone number'}</strong>.
                  Standard messaging rates may apply.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
