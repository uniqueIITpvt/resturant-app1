const Category = require('../models/category.model');
const cloudinary = require('cloudinary').v2;

class CategoryController {
  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.find().sort({
        displayOrder: 1,
        name: 1,
      });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Create new category
  async createCategory(req, res) {
    try {
      const { name, description, displayOrder } = req.body;

      // Check if category with the same name already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res
          .status(400)
          .json({ message: 'Category with this name already exists' });
      }

      const newCategory = new Category({
        name,
        description,
        displayOrder: displayOrder || 0,
        image: req.body.image,
      });

      const savedCategory = await newCategory.save();
      res.status(201).json(savedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update category
  async updateCategory(req, res) {
    try {
      if (req.body.name) {
        // Check if category with the same name already exists (excluding current category)
        const existingCategory = await Category.findOne({
          name: req.body.name,
          _id: { $ne: req.params.id },
        });

        if (existingCategory) {
          return res
            .status(400)
            .json({ message: 'Category with this name already exists' });
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.json(updatedCategory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Delete category
  async deleteCategory(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Delete associated image from cloudinary if exists
      if (category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }

      await category.deleteOne();
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get category by ID
  async getCategoryById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CategoryController();
