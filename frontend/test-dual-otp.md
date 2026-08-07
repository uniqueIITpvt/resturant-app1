# Dual OTP Authentication System - Frontend Testing Guide

## Overview

This guide helps you test the newly implemented dual OTP authentication system that supports both email and SMS verification.

## Features Implemented

### 1. Registration with OTP Method Selection

- Users can choose between email or phone verification during registration
- Phone number input with validation
- Real-time method switching
- Visual feedback for selected method

### 2. Enhanced OTP Verification

- Modern 6-digit OTP input with auto-focus and paste support
- Method switching during verification
- Countdown timer for resend functionality
- Clear error messaging

### 3. Login with Dual OTP Support

- Automatic detection of user's preferred OTP method
- Support for method switching during login verification
- Seamless integration with existing login flow

## Testing Steps

### Registration Flow

1. **Navigate to Registration Page**

   ```
   http://localhost:3000/auth/register
   ```

2. **Fill Basic Information**

   - Enter name, email, password, and confirm password
   - All fields should have proper validation

3. **Select OTP Method**

   - **Email Method**: Default selection, shows email address
   - **Phone Method**: Click to select, enter phone number with country code
   - Phone validation should work for formats like:
     - `+1 (555) 123-4567`
     - `+91 9876543210`
     - `+44 20 7946 0958`

4. **Submit Registration**

   - Should redirect to OTP verification screen
   - Success message should indicate the chosen method

5. **OTP Verification**
   - Enter 6-digit code (use test codes from backend)
   - Test auto-submit when all digits are entered
   - Test paste functionality
   - Test method switching (if implemented in backend)

### Login Flow

1. **Navigate to Login Page**

   ```
   http://localhost:3000/auth/login
   ```

2. **Enter Credentials**

   - Use existing account credentials
   - Should detect if account needs verification

3. **OTP Verification**
   - Should use user's preferred method from registration
   - Test method switching functionality
   - Test resend functionality

### Error Handling

- Test invalid phone numbers
- Test expired OTP codes
- Test incorrect OTP codes
- Test network errors

## Backend Requirements

Ensure the backend is running with:

- Twilio credentials configured
- New API endpoints implemented:
  - `POST /api/auth/register` (with phoneNumber and otpMethod)
  - `POST /api/auth/switch-otp-method`
  - `POST /api/auth/send-phone-otp`

## Environment Variables

Frontend should have:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Backend should have:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Test Scenarios

### Scenario 1: Email Registration

1. Register with email OTP
2. Verify with email code
3. Login should use email by default

### Scenario 2: Phone Registration

1. Register with phone OTP
2. Enter valid phone number
3. Verify with SMS code
4. Login should use phone by default

### Scenario 3: Method Switching

1. Register with email
2. During verification, switch to phone
3. Enter phone number and verify via SMS
4. Future logins should remember preference

## Expected Behavior

### UI/UX

- Smooth transitions between forms
- Clear visual feedback for selected methods
- Proper loading states
- Responsive design on mobile devices

### Validation

- Real-time field validation
- Phone number format validation
- OTP format validation (6 digits only)

### Error Messages

- Clear, actionable error messages
- Proper error recovery flows
- Network error handling

## Troubleshooting

### Common Issues

1. **Phone number not accepted**: Ensure country code is included
2. **SMS not received**: Check Twilio configuration and phone number validity
3. **Method switching fails**: Verify backend API endpoints are working
4. **OTP auto-submit not working**: Check browser compatibility

### Debug Steps

1. Check browser console for errors
2. Verify API calls in Network tab
3. Check backend logs for Twilio errors
4. Validate environment variables

## Success Criteria

- ✅ Users can register with either email or phone verification
- ✅ OTP verification works for both methods
- ✅ Method switching works seamlessly
- ✅ Login flow respects user's preferred method
- ✅ Error handling is robust and user-friendly
- ✅ UI is responsive and accessible
