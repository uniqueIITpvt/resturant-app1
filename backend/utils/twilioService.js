require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client
let twilioClient;
try {
  console.log('🔧 Initializing Twilio client...');
  console.log('TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
  console.log('TWILIO_PHONE_NUMBER exists:', !!process.env.TWILIO_PHONE_NUMBER);

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio client initialized successfully');
  } else {
    console.warn(
      '⚠️ Twilio credentials not found. SMS functionality will be disabled.'
    );
  }
} catch (error) {
  console.error('❌ Twilio initialization failed:', error);
}

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} - Success status
 */
const sendSMSOTP = async (phoneNumber, otp) => {
  console.log(
    `📱 sendSMSOTP called for phone: ${phoneNumber}, OTP: ${
      otp ? '******' : 'none'
    }`
  );

  if (!twilioClient) {
    throw new Error(
      'Twilio client not initialized. Please check your credentials.'
    );
  }

  try {
    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new Error(
        'Invalid phone number format. Please use E.164 format (e.g., +1234567890)'
      );
    }

    const message = `Your Restaurant App verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log('SMS sent successfully:', {
      sid: result.sid,
      to: phoneNumber,
      status: result.status,
    });

    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);

    // Handle specific Twilio errors
    if (error.code === 21211) {
      throw new Error('Invalid phone number format');
    } else if (error.code === 21614) {
      throw new Error('Phone number is not a valid mobile number');
    } else if (error.code === 21408) {
      throw new Error('Permission to send SMS to this number is denied');
    } else if (error.code === 21608) {
      // Trial account limitation - unverified number
      throw new Error(
        'SMS verification is currently unavailable for this phone number. Please use email verification instead or contact support.'
      );
    } else if (error.code === 20003) {
      // Authentication error
      throw new Error(
        'SMS service authentication failed. Please use email verification instead.'
      );
    } else if (error.code === 21606) {
      // Phone number not verified for trial account
      throw new Error(
        'SMS verification is currently unavailable for this phone number. Please use email verification instead.'
      );
    } else if (
      error.status === 400 &&
      error.message &&
      error.message.includes('unverified')
    ) {
      // Generic unverified number error for trial accounts
      throw new Error(
        'SMS verification is currently unavailable for this phone number. Please use email verification instead.'
      );
    } else {
      throw new Error(
        'SMS verification is currently unavailable. Please use email verification instead.'
      );
    }
  }
};

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - Phone number in various formats
 * @param {string} countryCode - Default country code (e.g., 'US', 'IN')
 * @returns {string} - Phone number in E.164 format
 */
const formatPhoneNumber = (phoneNumber, countryCode = 'US') => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Country code mappings
  const countryCodeMap = {
    US: '+1',
    CA: '+1',
    IN: '+91',
    UK: '+44',
    AU: '+61',
    // Add more country codes as needed
  };

  // If number already starts with +, return as is (assuming it's already formatted)
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }

  // If number starts with country code digits, add +
  if (
    countryCode === 'US' &&
    cleaned.length === 11 &&
    cleaned.startsWith('1')
  ) {
    return `+${cleaned}`;
  }

  if (
    countryCode === 'IN' &&
    cleaned.length === 12 &&
    cleaned.startsWith('91')
  ) {
    return `+${cleaned}`;
  }

  // Add country code prefix
  const prefix = countryCodeMap[countryCode] || '+1';

  // For US/CA numbers, expect 10 digits
  if ((countryCode === 'US' || countryCode === 'CA') && cleaned.length === 10) {
    return `${prefix}${cleaned}`;
  }

  // For Indian numbers, expect 10 digits
  if (countryCode === 'IN' && cleaned.length === 10) {
    return `${prefix}${cleaned}`;
  }

  // Default: add prefix to cleaned number
  return `${prefix}${cleaned}`;
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

module.exports = {
  sendSMSOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
};
