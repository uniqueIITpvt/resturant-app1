const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const {
  verifyToken,
  isUser,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

router.post('/register', authController.publicRegister);

// Check email/phone availability
router.post('/check-availability', authController.checkAvailability);

router.post(
  '/admin-register',
  verifyToken,
  isSuperAdmin,
  authController.adminRegister
);

router.post('/verify-otp', authController.verifyOTP);

router.post('/login', authController.login);

// Resend OTP
router.post('/resend-otp', authController.resendOTP);

// Send OTP to phone number (for existing users)
router.post('/send-phone-otp', authController.sendPhoneOTP);

// Switch OTP method
router.post('/switch-otp-method', authController.switchOTPMethod);

// Forgot Password
router.post('/forgot-password', authController.forgotPassword);

// Verify Reset Token
router.post('/verify-reset-token', authController.verifyResetToken);

// Reset Password
router.post('/reset-password', authController.resetPassword);

router.get('/me', verifyToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
