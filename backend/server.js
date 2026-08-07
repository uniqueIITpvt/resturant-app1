const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const {
  configureSecurityMiddleware,
} = require('./middleware/security.middleware');
const { setupSwagger } = require('./utils/swagger');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://resturant-app-frontend-delta.vercel.app',
    'https://resturant-app-backend-red.vercel.app',
    'https://resturant-bussiness-api.vercel.app',
    process.env.FRONTEND_URL ||
      'https://resturant-app-frontend-delta.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours in seconds
};

// Security Middleware
app.use(configureSecurityMiddleware(corsOptions.origin));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle OPTIONS preflight requests
app.options('*', cors(corsOptions));

// Add specific handler for OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Return success for OPTIONS requests
    return res.status(200).json({
      status: 'success',
    });
  }
  next();
});

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000, // Timeout after 15s instead of 30s
    heartbeatFrequencyMS: 5000, // Default is 10s, setting to 5s for faster initial connection
  })
  .then(() => {
    console.log('Connected to MongoDB 👽');
    // Create initial users after successful connection
    createInitialUsers();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Don't exit process for serverless - just log the error
    // process.exit(1); // Exit the process with failure
  });

// Create initial users
const User = require('./models/user.model');
const createInitialUsers = async () => {
  try {
    // Create superadmin if not exists
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (!superadmin) {
      const newSuperAdmin = new User({
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
        role: 'superadmin',
        isVerified: true,
      });
      await newSuperAdmin.save();
      console.log('Superadmin created successfully');
    }

    // Create demo admin if not exists
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const newAdmin = new User({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isVerified: true,
      });
      await newAdmin.save();
      console.log('Admin created successfully');
    }

    // Create demo user if not exists
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      const newUser = new User({
        name: process.env.USER_NAME || 'Regular User',
        email: process.env.USER_EMAIL || 'user@example.com',
        password: process.env.USER_PASSWORD || 'user123',
        role: 'user',
        isVerified: true,
      });
      await newUser.save();
      console.log('Demo user created successfully');
    }
  } catch (error) {
    console.error('Error creating initial users:', error);
  }
};

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/event-offers', require('./routes/eventOffer.routes'));
app.use('/api/email', require('./routes/email.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

// Root route handler
/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns basic API information
 *     responses:
 *       200:
 *         description: Success response with API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                 status:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Restaurant Business API is running!',
    endpoints: {
      auth: '/api/auth',
      upload: '/api/upload',
      products: '/api/products',
      orders: '/api/orders',
      users: '/api/users',
      coupons: '/api/coupons',
      categories: '/api/categories',
      eventOffers: '/api/event-offers',
      email: '/api/email',
      payments: '/api/payments',
      reviews: '/api/reviews',
    },
    status: 'online',
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`,
    availableRoutes: [
      '/api/auth',
      '/api/upload',
      '/api/products',
      '/api/orders',
      '/api/users',
      '/api/coupons',
      '/api/categories',
      '/api/event-offers',
      '/api/email',
      '/api/payments',
      '/api/reviews',
    ],
  });
});

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for serverless functions
module.exports = app;
