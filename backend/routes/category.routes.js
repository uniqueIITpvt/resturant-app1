const router = require('express').Router();
const categoryController = require('../controllers/category.controller');
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

// Public routes (available to all, even unauthenticated users)
// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Protected routes (require authentication)
// Create new category (admin+ only)
router.post('/', verifyToken, isAdmin, categoryController.createCategory);

// Update category (admin+ only)
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);

// Delete category (admin+ only)
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
