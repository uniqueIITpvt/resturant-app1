const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const {
  verifyToken,
  isUser,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

// Get user's orders (authenticated users)
router.get('/user', verifyToken, isUser, orderController.getUserOrders);

// Get all orders (admin only)
router.get('/', verifyToken, isAdmin, orderController.getAllOrders);

// Get order by ID (authenticated users can view their own orders, admins can view all)
router.get('/:id', verifyToken, orderController.getOrderById);

// Create new order (authenticated users)
router.post('/', verifyToken, isUser, orderController.createOrder);

// Update order status (admin only)
router.patch(
  '/:id/status',
  verifyToken,
  isAdmin,
  orderController.updateOrderStatus
);

// Cancel order (users can cancel their own orders)
router.put('/:id/cancel', verifyToken, isUser, orderController.cancelOrder);

module.exports = router;
