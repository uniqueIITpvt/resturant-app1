# Twilio SMS OTP Setup Guide

This guide will help you set up Twilio for SMS-based OTP authentication in your Restaurant Business application.

## Prerequisites

1. A Twilio account (sign up at [twilio.com](https://www.twilio.com))
2. A verified phone number for testing
3. Twilio phone number for sending SMS

## Step 1: Create Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a new account or log in
3. Complete the verification process

## Step 2: Get Twilio Credentials

1. In the Twilio Console, go to **Account > API keys & tokens**
2. Find your **Account SID** and **Auth Token**
3. Copy these values for your environment variables

## Step 3: Get a Twilio Phone Number

1. Go to **Phone Numbers > Manage > Buy a number**
2. Choose a phone number that supports SMS
3. Purchase the number
4. Note down the phone number (it will be in E.164 format like +1234567890)

## Step 4: Environment Variables

Add the following environment variables to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Example Values:

```env
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=your_auth_token_32_characters_long
TWILIO_PHONE_NUMBER=+15551234567
```

## Step 5: Testing

### Test with Twilio Console

1. Go to **Develop > Phone Numbers > Manage > Verified caller IDs**
2. Add your personal phone number for testing
3. Use the Twilio Console to send a test SMS

### Test with Your Application

1. Start your backend server
2. Use the registration endpoint with `otpMethod: 'phone'`
3. Check that you receive the SMS OTP

## API Endpoints

### Registration with Phone OTP

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "otpMethod": "phone"
}
```

### Send Phone OTP to Existing User

```bash
POST /api/auth/send-phone-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

### Switch OTP Method

```bash
POST /api/auth/switch-otp-method
Content-Type: application/json

{
  "userId": "user_id_here",
  "newMethod": "phone",
  "phoneNumber": "+1234567890"
}
```

### Resend OTP (Email or Phone)

```bash
POST /api/auth/resend-otp
Content-Type: application/json

{
  "userId": "user_id_here",
  "otpMethod": "phone"
}
```

### Verify OTP (Works for both Email and Phone)

```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "userId": "user_id_here",
  "otp": "123456"
}
```

## Phone Number Format

The system automatically formats phone numbers to E.164 format:

- **US/Canada**: `+1234567890`
- **India**: `+911234567890`
- **UK**: `+441234567890`

### Supported Input Formats:

- `1234567890` (US 10-digit)
- `+1234567890` (E.164 format)
- `(123) 456-7890` (formatted US)
- `123-456-7890` (dashed US)

## Error Handling

The system handles various Twilio errors:

- **21211**: Invalid phone number format
- **21614**: Not a valid mobile number
- **21408**: Permission denied for this number

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Rate Limiting**: Built-in rate limiting for SMS sending
3. **Phone Validation**: Automatic phone number format validation
4. **Secure Storage**: OTPs are stored securely in the database

## Cost Considerations

- Twilio charges per SMS sent
- Current pricing: ~$0.0075 per SMS in the US
- Consider implementing rate limiting to prevent abuse
- Monitor usage in Twilio Console

## Troubleshooting

### Common Issues:

1. **SMS not received**:

   - Check phone number format
   - Verify Twilio phone number is SMS-enabled
   - Check Twilio Console logs

2. **Invalid credentials error**:

   - Verify Account SID and Auth Token
   - Check environment variables are loaded

3. **Permission denied**:
   - Verify phone number in Twilio Console
   - Check if number is on a blocked list

### Debug Mode:

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will log detailed information about SMS sending attempts.

## Production Considerations

1. **Verify your Twilio account** to remove trial limitations
2. **Set up proper error monitoring** for SMS failures
3. **Implement rate limiting** to prevent SMS spam
4. **Monitor costs** in Twilio Console
5. **Use environment-specific phone numbers** for different stages

## Support

For Twilio-specific issues:

- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Support](https://support.twilio.com)

For application-specific issues:

- Check server logs for detailed error messages
- Verify environment variables are correctly set
- Test with Twilio Console first to isolate issues
