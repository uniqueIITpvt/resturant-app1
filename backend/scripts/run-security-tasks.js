/**
 * Scheduled Security Tasks Runner
 *
 * This script sets up recurring security tasks:
 * - Cleanup expired tokens
 * - Rotate log files
 * - Check for suspicious activities
 *
 * Usage:
 * - node scripts/run-security-tasks.js
 * - Add to PM2 for persistent execution
 */

const { runSecurityCleanup } = require('./security-cleanup');

// Schedule for immediate execution
console.log('Starting initial security cleanup...');
runSecurityCleanup().catch(console.error);

// Schedule recurring execution (every 12 hours)
const CLEANUP_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
console.log(
  `Scheduling recurring security cleanup every ${
    CLEANUP_INTERVAL / (60 * 60 * 1000)
  } hours`
);

setInterval(() => {
  console.log('Running scheduled security cleanup...');
  runSecurityCleanup().catch(console.error);
}, CLEANUP_INTERVAL);

console.log('Security tasks scheduler started successfully');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down security tasks scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down security tasks scheduler...');
  process.exit(0);
});
