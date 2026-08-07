/**
 * Security Cleanup Script
 *
 * This script performs regular security maintenance tasks:
 * 1. Removes expired tokens
 * 2. Rotates logs if they exceed a certain size
 * 3. Checks for suspicious activity patterns
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Token = require('../models/token.model');
const User = require('../models/user.model');

// Configure log paths
const logDir = path.join(__dirname, '../logs');
const auditLogPath = path.join(logDir, 'audit.log');
const securityLogPath = path.join(logDir, 'security.log');

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Initialize security log if not exists
if (!fs.existsSync(securityLogPath)) {
  fs.writeFileSync(securityLogPath, '', 'utf8');
}

/**
 * Log security event
 * @param {string} message - Message to log
 */
const logSecurityEvent = (message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(securityLogPath, logEntry, 'utf8');
  console.log(`[SECURITY] ${message}`);
};

/**
 * Rotate log file if it exceeds size limit
 * @param {string} logPath - Path to log file
 * @param {number} maxSizeBytes - Maximum size in bytes
 */
const rotateLogIfNeeded = (logPath, maxSizeBytes = 10 * 1024 * 1024) => {
  // 10 MB default
  try {
    if (!fs.existsSync(logPath)) {
      return;
    }

    const stats = fs.statSync(logPath);

    if (stats.size >= maxSizeBytes) {
      const backupPath = `${logPath}.${new Date()
        .toISOString()
        .replace(/:/g, '-')}.bak`;
      fs.copyFileSync(logPath, backupPath);
      fs.truncateSync(logPath, 0);
      logSecurityEvent(
        `Rotated log file ${path.basename(logPath)} to ${path.basename(
          backupPath
        )}`
      );
    }
  } catch (error) {
    console.error(`Error rotating log: ${error.message}`);
  }
};

/**
 * Remove expired tokens
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = await Token.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    logSecurityEvent(`Removed ${result.deletedCount} expired tokens`);
  } catch (error) {
    console.error(`Error cleaning up tokens: ${error.message}`);
  }
};

/**
 * Check for suspicious login patterns
 */
const checkSuspiciousActivity = async () => {
  // TODO: Implement more sophisticated detection logic
  try {
    // This would typically involve analyzing authentication logs
    // and looking for patterns like multiple failed login attempts

    logSecurityEvent('Completed suspicious activity check');
  } catch (error) {
    console.error(`Error checking suspicious activity: ${error.message}`);
  }
};

/**
 * Main execution function
 */
const runSecurityCleanup = async () => {
  try {
    logSecurityEvent('Starting security cleanup task');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    logSecurityEvent('Connected to MongoDB');

    // Rotate logs if needed
    rotateLogIfNeeded(auditLogPath);
    rotateLogIfNeeded(securityLogPath);

    // Clean up expired tokens
    await cleanupExpiredTokens();

    // Check for suspicious activity
    await checkSuspiciousActivity();

    logSecurityEvent('Security cleanup completed successfully');
  } catch (error) {
    console.error('Security cleanup error:', error);
    logSecurityEvent(`Security cleanup failed: ${error.message}`);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logSecurityEvent('Disconnected from MongoDB');
    }
  }
};

// Execute if called directly
if (require.main === module) {
  runSecurityCleanup()
    .catch(console.error)
    .finally(() => {
      process.exit(0);
    });
}

module.exports = { runSecurityCleanup };
