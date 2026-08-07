const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // For ordering categories in UI
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Optional field for category icon or image
    image: {
      public_id: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);
