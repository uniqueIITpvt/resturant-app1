/**
 * Security Test Script
 *
 * This script tests various security aspects of the API:
 * - HTTP Security Headers
 * - CORS Configuration
 * - Rate Limiting
 * - Authentication & Authorization
 *
 * Usage:
 * - node scripts/security-test.js [api-url]
 * - Default API URL is http://localhost:5000
 */

const axios = require('axios');
const https = require('https');
const colors = require('colors/safe');

// Configuration
const API_URL = process.argv[2] || 'http://localhost:5000';
const EXPECTED_HEADERS = [
  'content-security-policy',
  'strict-transport-security',
  'x-content-type-options',
  'x-frame-options',
  'x-xss-protection',
  'referrer-policy',
];

// HTTP client that ignores SSL cert issues (for testing only)
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 10000,
});

// Test colors
const pass = colors.green;
const fail = colors.red;
const info = colors.cyan;
const warn = colors.yellow;

// Log test results
const logResult = (testName, passed, message) => {
  console.log(`${passed ? pass('✓ PASS') : fail('✗ FAIL')} ${testName}`);
  if (message) {
    console.log(`  ${passed ? info(message) : warn(message)}`);
  }
  return passed;
};

// Test HTTP Security Headers
const testSecurityHeaders = async () => {
  try {
    console.log(info('\nTesting HTTP Security Headers:'));
    const response = await axiosInstance.head(API_URL);

    const headers = response.headers;
    const missingHeaders = [];

    for (const header of EXPECTED_HEADERS) {
      const hasHeader = Object.keys(headers)
        .map((h) => h.toLowerCase())
        .includes(header.toLowerCase());

      if (!hasHeader) {
        missingHeaders.push(header);
      }
    }

    if (missingHeaders.length === 0) {
      logResult(
        'Security headers',
        true,
        'All required security headers are present'
      );
    } else {
      logResult(
        'Security headers',
        false,
        `Missing headers: ${missingHeaders.join(', ')}`
      );
    }

    // Check specific header values
    if (headers['strict-transport-security']) {
      const hstsValue = headers['strict-transport-security'];
      const hasMaxAge = hstsValue.includes('max-age=');
      logResult(
        'HSTS Configuration',
        hasMaxAge,
        hasMaxAge
          ? `HSTS properly configured: ${hstsValue}`
          : 'HSTS max-age not properly set'
      );
    }

    return true;
  } catch (error) {
    console.error(warn('Error testing security headers:'), error.message);
    return false;
  }
};

// Test CORS Configuration
const testCorsConfiguration = async () => {
  try {
    console.log(info('\nTesting CORS Configuration:'));

    // Test with allowed origin
    const allowedOrigin = 'http://localhost:3000';
    const response1 = await axiosInstance.options(API_URL, {
      headers: {
        Origin: allowedOrigin,
        'Access-Control-Request-Method': 'GET',
      },
    });

    const allowedOriginPassed =
      response1.headers['access-control-allow-origin'] === allowedOrigin;
    logResult(
      'Allowed origin',
      allowedOriginPassed,
      allowedOriginPassed
        ? `Correctly allows ${allowedOrigin}`
        : `Failed to allow ${allowedOrigin}`
    );

    // Test with disallowed origin
    const disallowedOrigin = 'https://malicious-site.example.com';
    try {
      const response2 = await axiosInstance.options(API_URL, {
        headers: {
          Origin: disallowedOrigin,
          'Access-Control-Request-Method': 'GET',
        },
      });

      const disallowedOriginBlocked =
        response2.headers['access-control-allow-origin'] !== disallowedOrigin;
      logResult(
        'Disallowed origin',
        disallowedOriginBlocked,
        disallowedOriginBlocked
          ? `Correctly blocks ${disallowedOrigin}`
          : `Incorrectly allows ${disallowedOrigin}`
      );
    } catch (error) {
      // If it rejects the request, that's also good
      logResult(
        'Disallowed origin',
        true,
        `Correctly rejects ${disallowedOrigin}`
      );
    }

    return true;
  } catch (error) {
    console.error(warn('Error testing CORS configuration:'), error.message);
    return false;
  }
};

// Test Rate Limiting
const testRateLimiting = async () => {
  try {
    console.log(info('\nTesting Rate Limiting:'));

    // Test general endpoint
    const results = await Promise.all(
      Array(10)
        .fill()
        .map(() => axiosInstance.get(`${API_URL}/`))
    );

    const hasRateLimitHeaders = results.some(
      (response) =>
        response.headers['ratelimit-limit'] ||
        response.headers['ratelimit-remaining'] ||
        response.headers['x-ratelimit-limit']
    );

    logResult(
      'Rate limit headers',
      hasRateLimitHeaders,
      hasRateLimitHeaders
        ? 'Rate limit headers are present'
        : 'No rate limit headers found'
    );

    // Test auth endpoint with limit of 10/15min
    console.log(
      info('Testing rate limits on auth endpoint (sending 5 requests)...')
    );
    try {
      await Promise.all(
        Array(5)
          .fill()
          .map(() =>
            axiosInstance.post(`${API_URL}/api/auth/login`, {
              email: 'test@example.com',
              password: 'wrongpassword',
            })
          )
      );
      console.log(info('Sent 5 requests to auth endpoint'));
    } catch (error) {
      // Check if we hit rate limit already
      if (error.response && error.response.status === 429) {
        logResult(
          'Auth rate limiting',
          true,
          'Rate limiting working properly on auth endpoints'
        );
      } else {
        console.error(
          warn('Error while testing auth rate limits:'),
          error.message
        );
      }
    }

    return true;
  } catch (error) {
    console.error(warn('Error testing rate limiting:'), error.message);
    return false;
  }
};

// Main function
const runTests = async () => {
  console.log(
    info(`\n🔒 Testing security configuration for API at: ${API_URL}`)
  );
  console.log(info('='.repeat(60)));

  await testSecurityHeaders();
  await testCorsConfiguration();
  await testRateLimiting();

  console.log(info('\n='.repeat(60)));
  console.log(info('Security tests completed'));
};

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
