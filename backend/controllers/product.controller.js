const Product = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

class ProductController {
  // Get all product items
  async getAllProducts(req, res) {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new product item
  async createProduct(req, res) {
    try {
      const { name, description, price, category, addonGroups } = req.body;

      // Validate add-on groups if provided
      if (addonGroups && addonGroups.length > 0) {
        for (const group of addonGroups) {
          if (!group.title) {
            return res
              .status(400)
              .json({ message: 'Add-on group title is required' });
          }

          if (
            !group.options ||
            !Array.isArray(group.options) ||
            group.options.length === 0
          ) {
            return res.status(400).json({
              message: `Options are required for add-on group: ${group.title}`,
            });
          }

          for (const option of group.options) {
            if (!option.name) {
              return res.status(400).json({
                message: `Option name is required in group: ${group.title}`,
              });
            }
            if (typeof option.price !== 'number' || option.price < 0) {
              return res.status(400).json({
                message: `Valid price is required for option: ${option.name}`,
              });
            }
          }
        }
      }

      const newProduct = new Product(req.body);
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update product item
  async updateProduct(req, res) {
    try {
      // Validate add-on groups if provided
      if (req.body.addonGroups && req.body.addonGroups.length > 0) {
        for (const group of req.body.addonGroups) {
          if (!group.title) {
            return res
              .status(400)
              .json({ message: 'Add-on group title is required' });
          }

          if (
            !group.options ||
            !Array.isArray(group.options) ||
            group.options.length === 0
          ) {
            return res.status(400).json({
              message: `Options are required for add-on group: ${group.title}`,
            });
          }

          for (const option of group.options) {
            if (!option.name) {
              return res.status(400).json({
                message: `Option name is required in group: ${group.title}`,
              });
            }
            if (typeof option.price !== 'number' || option.price < 0) {
              return res.status(400).json({
                message: `Valid price is required for option: ${option.name}`,
              });
            }
          }
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product item not found' });
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete product item
  async deleteProduct(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product item not found' });
      }

      // Delete associated image from cloudinary if exists
      if (product.image && product.image.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      await product.deleteOne();
      res.json({ message: 'Product item deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get product item by ID
  async getProductById(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product item not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get product items by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = await Product.find({ category });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
