const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Alias for verifyToken to match review routes naming
const authenticateToken = verifyToken;

// Check if user is authenticated (any valid user)
const isUser = (req, res, next) => {
  // Any authenticated user can access these routes
  next();
};

// Check if user is admin or higher
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Requires admin privileges' });
  }
  next();
};

// Check if user is superadmin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Requires superadmin privileges' });
  }
  next();
};

// Authorize specific roles (flexible role checking)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authenticateToken,
  isUser,
  isAdmin,
  isSuperAdmin,
  authorizeRoles,
};
