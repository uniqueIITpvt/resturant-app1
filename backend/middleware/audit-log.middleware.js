/**
 * Audit logging middleware for security-sensitive operations
 * This logs important actions like role changes, account creation/deletion, etc.
 */

const fs = require('fs');
const path = require('path');

// Configure log directory
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const auditLogPath = path.join(logDir, 'audit.log');

/**
 * Create audit log entry
 * @param {string} action - The action being performed (e.g., 'USER_ROLE_CHANGE')
 * @param {object} user - The user performing the action
 * @param {object} details - Additional details about the action
 * @param {string} targetId - Optional ID of the target resource
 */
const logAuditEvent = (action, user, details, targetId = null) => {
  try {
    const timestamp = new Date().toISOString();
    const userId = user?._id || 'SYSTEM';
    const userRole = user?.role || 'SYSTEM';
    const userEmail = user?.email || 'SYSTEM';

    const logEntry = {
      timestamp,
      action,
      userId,
      userEmail,
      userRole,
      targetId,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
    };

    // Write to log file
    fs.appendFileSync(auditLogPath, JSON.stringify(logEntry) + '\n', {
      encoding: 'utf8',
    });

    console.log(`[AUDIT] ${action} by ${userEmail} (${userRole})`);

    return true;
  } catch (error) {
    console.error('Error writing audit log:', error);
    return false;
  }
};

/**
 * Middleware to create audit logging functions
 */
const auditLogMiddleware = (req, res, next) => {
  // Add audit logging function to the request object
  req.auditLog = (
    action,
    details = {},
    targetId = null,
    userOverride = null
  ) => {
    // Add request context to details
    details.ip = req.ip || req.connection.remoteAddress;
    details.userAgent = req.get('user-agent');
    details.method = req.method;
    details.path = req.originalUrl;

    // Use provided user object if available, otherwise fall back to req.user
    const userToLog = userOverride || req.user;

    return logAuditEvent(action, userToLog, details, targetId);
  };

  next();
};

// Export both the middleware and the direct logging function
module.exports = {
  auditLogMiddleware,
  logAuditEvent,
};
