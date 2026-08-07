const router = require('express').Router();
const User = require('../models/user.model');
const userController = require('../controllers/user.controller');
const {
  verifyToken,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

// Get all users (admin+ only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp -otpExpiry').sort({
      createdAt: -1,
    });

    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
    }));

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
});

// Get current user profile
router.get('/me', verifyToken, userController.getCurrentUser);

// Update current user profile
router.put('/me', verifyToken, userController.updateUserProfile);

// Get current user addresses
router.get('/me/addresses', verifyToken, userController.getUserAddresses);

// Add a new address for current user
router.post('/me/addresses', verifyToken, userController.addUserAddress);

// Update an address for current user
router.put(
  '/me/addresses/:addressId',
  verifyToken,
  userController.updateUserAddress
);

// Set an address as default
router.patch(
  '/me/addresses/:addressId/default',
  verifyToken,
  userController.setDefaultAddress
);

// Delete an address
router.delete(
  '/me/addresses/:addressId',
  verifyToken,
  userController.deleteUserAddress
);

// Update user role (superadmin only)
router.patch('/:userId/role', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password -otp -otpExpiry' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res
      .status(500)
      .json({ message: 'Error updating user role', error: error.message });
  }
});

// Manually verify a user (superadmin only)
router.patch('/:userId/verify', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({
      message: 'User verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    return res
      .status(500)
      .json({ message: 'Error verifying user', error: error.message });
  }
});

// Delete user (superadmin only)
router.delete('/:userId', verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent superadmin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own account' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      userId: deletedUser._id,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res
      .status(500)
      .json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
