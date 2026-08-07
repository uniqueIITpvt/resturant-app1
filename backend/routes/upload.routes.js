const router = require('express').Router();
const upload = require('../middleware/upload.middleware');
const uploadController = require('../controllers/upload.controller');
const {
  verifyToken,
  isAdmin,
  isSuperAdmin,
} = require('../middleware/auth.middleware');

// Handle OPTIONS requests for the image upload endpoint
router.options('/image', (req, res) => {
  res.status(200).end();
});

// Upload image route (admin+ only)
router.post(
  '/image',
  verifyToken,
  isAdmin,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return upload.handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  uploadController.uploadImage
);

// Handle OPTIONS requests for the delete endpoint
router.options('/image/:public_id', (req, res) => {
  res.status(200).end();
});

// Delete image route (admin+ only)
router.delete(
  '/image/:public_id',
  verifyToken,
  isAdmin,
  uploadController.deleteImage
);

module.exports = router;
