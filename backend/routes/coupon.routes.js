const router = require('express').Router();
const couponController = require('../controllers/coupon.controller');
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

// Public routes (available for authenticated users)
// Get coupon by code (for validation)
router.get(
  '/validate/:code',
  verifyToken,
  isUser,
  couponController.getCouponByCode
);

// Validate coupon for order
router.post('/validate', verifyToken, isUser, couponController.validateCoupon);

// Protected routes (require admin authentication)
// Get all coupons (admin+ only)
router.get('/', verifyToken, isAdmin, couponController.getAllCoupons);

// Create new coupon (admin+ only)
router.post('/', verifyToken, isAdmin, couponController.createCoupon);

// Get coupon by ID (admin+ only)
router.get('/:id', verifyToken, isAdmin, couponController.getCouponById);

// Update coupon (admin+ only)
router.put('/:id', verifyToken, isAdmin, couponController.updateCoupon);

// Delete coupon (admin+ only)
router.delete('/:id', verifyToken, isAdmin, couponController.deleteCoupon);

// Increment coupon usage count (used when order is placed)
router.post(
  '/:id/increment',
  verifyToken,
  isUser,
  couponController.incrementCouponUsage
);

module.exports = router;
