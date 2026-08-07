const router = require('express').Router();
const emailController = require('../controllers/email.controller');
const {
  verifyToken,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

// Handle OPTIONS requests
router.options('/', (req, res) => {
  res.status(200).end();
});

// ======== EVENT/OFFER EMAILS ========

// Send event/offer email to a single user (admin only)
router.post(
  '/send-event-offer/:userId/:eventOfferId',
  verifyToken,
  isAdmin,
  emailController.sendEventOfferEmail
);

// Broadcast event/offer email to all users (admin only)
router.post(
  '/broadcast-event-offer/:eventOfferId',
  verifyToken,
  isAdmin,
  emailController.broadcastEventOfferEmail
);

// ======== WELCOME EMAILS ========

// Send welcome email (admin only or automatically triggered)
router.post(
  '/welcome/:userId',
  verifyToken,
  isAdmin,
  emailController.sendWelcomeEmail
);

// ======== CUSTOM EMAILS ========

// Send custom email to a single user (admin only)
router.post(
  '/custom/:userId',
  verifyToken,
  isAdmin,
  emailController.sendCustomEmail
);

// Send custom email to multiple users (admin only)
router.post(
  '/bulk-custom',
  verifyToken,
  isAdmin,
  emailController.sendBulkCustomEmail
);

module.exports = router; 