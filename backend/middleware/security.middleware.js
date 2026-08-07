const helmet = require('helmet');

/**
 * Configures security middleware using Helmet
 * @param {Object} corsOrigins - Array of allowed CORS origins
 * @returns {Function} - Configured helmet middleware
 */
const configureSecurityMiddleware = (corsOrigins = []) => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          ...corsOrigins,
          'https://*.cloudinary.com',
          'https://api.cloudinary.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.cloudinary.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        mediaSrc: ["'self'", 'https://*.cloudinary.com'],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xssFilter: true,
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true, // X-Content-Type-Options
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
  });
};

module.exports = { configureSecurityMiddleware };
