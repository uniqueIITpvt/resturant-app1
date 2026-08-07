// This file is specifically for Vercel serverless function deployment
const app = require('../server');

// Export the Express app as a serverless function
module.exports = app;
