const router = require('express').Router();
const eventOfferController = require('../controllers/eventOffer.controller');
const {
  verifyToken,
  isUser,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

// Handle OPTIONS requests
router.options('/', (req, res) => {
  res.status(200).end();
});

// Public routes (no authentication required)
// Get all active event offers
router.get('/active', eventOfferController.getActiveEventOffers);

// Get event offers by type (e.g., holiday, seasonal)
router.get('/type/:type', eventOfferController.getEventOffersByType);

// User authenticated routes
// Track offer click
router.post('/:id/track-click', verifyToken, eventOfferController.trackEventOfferClick);

// Track offer conversion 
router.post('/:id/track-conversion', verifyToken, eventOfferController.trackEventOfferConversion);

// Admin routes (require admin authentication)
// Get all event offers
router.get('/', verifyToken, isAdmin, eventOfferController.getAllEventOffers);

// Create new event offer
router.post('/', verifyToken, isAdmin, eventOfferController.createEventOffer);

// Get event offer by ID
router.get('/:id', verifyToken, isAdmin, eventOfferController.getEventOfferById);

// Update event offer
router.put('/:id', verifyToken, isAdmin, eventOfferController.updateEventOffer);

// Delete event offer
router.delete('/:id', verifyToken, isAdmin, eventOfferController.deleteEventOffer);

module.exports = router; 