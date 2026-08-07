const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { Readable } = require('stream');

class UploadController {
  // Upload image to cloudinary
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded',
          error: 'MISSING_FILE',
        });
      }

      // Validate file size (should be handled by multer already, but double-check)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          message: 'File too large. Maximum size is 5MB',
          error: 'FILE_TOO_LARGE',
        });
      }

      // Get metadata
      const productName = req.body.productName || 'product';
      const originalName = req.body.originalName || req.file.originalname;
      const uploadedByRole =
        req.body.uploadedByRole || req.user?.role || 'admin';

      // Format filename for cloudinary
      const sanitizedName = productName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 40);

      // Create a buffer stream from the file buffer
      const stream = new Readable();
      stream.push(req.file.buffer);
      stream.push(null);

      // Upload to cloudinary using stream with improved settings
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'restaurant',
            resource_type: 'image',
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
            public_id: `${sanitizedName}_${Date.now()}`,
            overwrite: true,
            format: 'webp',
            context: {
              original_filename: originalName,
              uploaded_by: uploadedByRole,
              product_name: productName,
            },
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary error:', error);
              return reject(error);
            }
            return resolve(result);
          }
        );

        stream.pipe(uploadStream);
      });

      // Return optimized image info
      res.json({
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        original_filename: originalName,
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        message: error.message || 'Error uploading image',
        error: 'UPLOAD_FAILED',
      });
    }
  }

  // Delete image from cloudinary
  async deleteImage(req, res) {
    try {
      const { public_id } = req.params;
      if (!public_id) {
        return res.status(400).json({
          message: 'No public_id provided',
          error: 'MISSING_PUBLIC_ID',
        });
      }

      await cloudinary.uploader.destroy(public_id);
      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Error deleting image',
        error: 'DELETE_FAILED',
      });
    }
  }
}

module.exports = new UploadController();
