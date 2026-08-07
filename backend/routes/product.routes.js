const router = require('express').Router();
const productController = require('../controllers/product.controller');
const {
  verifyToken,
  isUser,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

router.get('/', productController.getAllProducts);

router.get('/category/:category', productController.getProductsByCategory);

router.get('/:id', productController.getProductById);

router.post('/', verifyToken, isAdmin, productController.createProduct);

router.put('/:id', verifyToken, isAdmin, productController.updateProduct);

router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
