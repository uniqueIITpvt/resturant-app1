const {
  sendSMSOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
} = require('../utils/twilioService');
require('dotenv').config();

async function testTwilioIntegration() {
  console.log('🧪 Testing Twilio SMS Integration...\n');

  // Test phone number formatting
  console.log('📱 Testing phone number formatting:');
  const testNumbers = [
    '1234567890',
    '+1234567890',
    '(123) 456-7890',
    '123-456-7890',
    '91 98765 43210',
    '+91 98765 43210',
  ];

  testNumbers.forEach((number) => {
    const formatted = formatPhoneNumber(number);
    const isValid = isValidPhoneNumber(formatted);
    console.log(
      `  ${number} → ${formatted} (${isValid ? '✅ Valid' : '❌ Invalid'})`
    );
  });

  console.log('\n🔧 Checking Twilio configuration:');

  // Check environment variables
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log(
      'Please check your .env file and add the missing Twilio credentials.'
    );
    return;
  }

  console.log('✅ All Twilio environment variables are set');
  console.log(`📞 Twilio Phone Number: ${process.env.TWILIO_PHONE_NUMBER}`);

  // Test SMS sending (only if test phone number is provided)
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER;

  if (testPhoneNumber) {
    console.log('\n📤 Testing SMS sending...');
    try {
      const testOTP = '123456';
      await sendSMSOTP(testPhoneNumber, testOTP);
      console.log(`✅ Test SMS sent successfully to ${testPhoneNumber}`);
      console.log('Check your phone for the test message!');
    } catch (error) {
      console.log('❌ SMS sending failed:', error.message);

      // Provide specific troubleshooting tips
      if (error.message.includes('Invalid phone number format')) {
        console.log(
          '💡 Tip: Make sure the phone number is in E.164 format (+1234567890)'
        );
      } else if (error.message.includes('Permission denied')) {
        console.log(
          '💡 Tip: Add the phone number to verified caller IDs in Twilio Console'
        );
      } else if (error.message.includes('credentials')) {
        console.log('💡 Tip: Check your Twilio Account SID and Auth Token');
      }
    }
  } else {
    console.log(
      '\n⚠️  To test SMS sending, add TEST_PHONE_NUMBER=+1234567890 to your .env file'
    );
  }

  console.log('\n🎉 Twilio integration test completed!');
  console.log('\n📚 For more information, see: ./docs/TWILIO_SETUP.md');
}

// Run the test
testTwilioIntegration().catch(console.error);
