const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter - general purpose for most endpoints
 * Limits to 100 requests per 15 minutes per IP
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  },
  skip: (req) => {
    // Skip rate limiting for trusted sources (e.g., internal systems)
    // You can customize this based on your requirements
    return false;
  },
});

/**
 * Authentication rate limiter - stricter limits for auth endpoints
 * Limits to 10 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later.',
  },
});

/**
 * Signup rate limiter - prevent mass account creation
 * Limits to 5 account creations per hour per IP
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 signup requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many accounts created, please try again later.',
  },
});

module.exports = {
  standardLimiter,
  authLimiter,
  signupLimiter,
};
