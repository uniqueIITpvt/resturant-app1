/**
 * Security Middleware Index
 *
 * This file exports all security-related middleware functions
 * to make imports cleaner in other files.
 */

const {
  verifyToken,
  isUser,
  isAdmin,
  isSuperAdmin,
} = require('./auth.middleware');

const {
  standardLimiter,
  authLimiter,
  signupLimiter,
} = require('./rate-limit.middleware');

const { auditLogMiddleware, logAuditEvent } = require('./audit-log.middleware');

const { configureSecurityMiddleware } = require('./security.middleware');

/**
 * Apply security middleware to Express app
 * @param {Express} app - Express application instance
 * @param {Array} allowedOrigins - Array of allowed CORS origins
 */
const applySecurityMiddleware = (app, allowedOrigins = []) => {
  // Apply Helmet and other security headers
  app.use(configureSecurityMiddleware(allowedOrigins));

  // Apply global rate limiting
  app.use(standardLimiter);

  // Apply audit logging
  app.use(auditLogMiddleware);

  return app;
};

module.exports = {
  // Authentication & Authorization
  verifyToken,
  isUser,
  isAdmin,
  isSuperAdmin,

  // Rate Limiting
  standardLimiter,
  authLimiter,
  signupLimiter,

  // Audit Logging
  auditLogMiddleware,
  logAuditEvent,

  // Security Headers
  configureSecurityMiddleware,

  // One-step application
  applySecurityMiddleware,
};
