const multer = require('multer');
const path = require('path');

// Use memory storage instead of disk storage for Vercel compatibility
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only specified image formats
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        `Invalid file type. Supported formats: ${allowedMimeTypes.join(', ')}`
      ),
      false
    );
  }

  // Additional validation can be added here
  cb(null, true);
};

// Custom error handling for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 5MB',
        error: 'FILE_TOO_LARGE',
      });
    }
    return res.status(400).json({
      message: err.message,
      error: 'UPLOAD_ERROR',
    });
  }
  next(err);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
module.exports.handleMulterError = handleMulterError;
