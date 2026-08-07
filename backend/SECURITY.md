# Security Implementation Guide

## Overview

This document outlines the security measures implemented in the restaurant business application's backend to protect against common web vulnerabilities.

## Table of Contents

1. [HTTP Security Headers](#http-security-headers)
2. [CORS Configuration](#cors-configuration)
3. [Rate Limiting](#rate-limiting)
4. [Authentication & Authorization](#authentication--authorization)
5. [Input Validation](#input-validation)
6. [Audit Logging](#audit-logging)
7. [Security Maintenance](#security-maintenance)
8. [Dependency Management](#dependency-management)
9. [Security Contact](#security-contact)

## HTTP Security Headers

We use Helmet.js to set secure HTTP headers that help protect the application from common web vulnerabilities:

- **Content-Security-Policy**: Controls allowed sources for loading resources
- **Strict-Transport-Security (HSTS)**: Forces browsers to use HTTPS
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser's XSS filtering
- **Referrer-Policy**: Controls information sent in the Referer header

## CORS Configuration

Cross-Origin Resource Sharing is carefully configured to restrict access to the API:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://resturant-app-frontend-delta.vercel.app',
    // Other trusted origins
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours in seconds
};
```

## Rate Limiting

Three types of rate limiters are implemented to prevent abuse:

1. **Standard Limiter**: 100 requests per 15 minutes per IP for general API endpoints
2. **Auth Limiter**: 10 requests per 15 minutes per IP for authentication endpoints
3. **Signup Limiter**: 5 requests per hour per IP for new account creation

Rate limiting helps prevent:

- Brute force attacks
- Denial of service
- Account enumeration

## Authentication & Authorization

We use a robust, multi-layered authentication system:

1. **JWT Authentication**: Short-lived access tokens (15 minutes)
2. **Refresh Token Rotation**: Secure token rotation with database tracking
3. **Role-Based Access Control**: Three roles (user, admin, superadmin)
4. **OTP Verification**: Email verification required for new accounts

### Token Security

- Access tokens expire after 15 minutes
- Refresh tokens are stored securely in the database with expiration
- Tokens include IP information to detect token theft
- Token rotation occurs on every refresh

## Input Validation

All user input is validated:

- Data sanitization to prevent NoSQL injection
- Schema validation with Mongoose
- Input length and format validation

## Audit Logging

Security-relevant events are logged:

- Authentication attempts
- Administrative actions
- Password changes
- API access to sensitive data

Logs include:

- Timestamp
- User information
- IP address
- Action type
- Target resource

## Security Maintenance

Automated security tasks:

- Expired token cleanup
- Log rotation
- Suspicious activity monitoring

Scripts are located in the `scripts` directory:

- `security-cleanup.js`: Core security maintenance functions
- `run-security-tasks.js`: Scheduled execution (runs every 12 hours)

## Dependency Management

Regular security updates:

- Dependencies are regularly updated
- Security vulnerabilities are addressed immediately
- Package lockfiles are committed to prevent supply chain attacks

## Security Contact

To report security vulnerabilities, please contact:

- Email: security@example.com
- Do not disclose security vulnerabilities publicly until they have been addressed

## Testing Security Measures

You can test the security measures:

1. **Check Headers**:

   ```
   curl -I https://your-api-url.com
   ```

2. **Test Rate Limiting**:

   ```
   for i in {1..15}; do curl -I https://your-api-url.com/api/auth/login; done
   ```

3. **Verify CORS**:
   ```
   curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS --verbose \
     https://your-api-url.com/api/users
   ```
