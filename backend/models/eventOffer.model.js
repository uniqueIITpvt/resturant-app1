const mongoose = require('mongoose');

const eventOfferSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    banner: {
      public_id: String,
      url: {
        type: String,
        required: [true, 'Banner image URL is required'],
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    offerType: {
      type: String,
      enum: ['discount', 'special', 'seasonal', 'holiday'],
      default: 'discount',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'none'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: String,
        ref: 'Category',
      },
    ],
    couponCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    conversionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
eventOfferSchema.index({ isActive: 1 });
eventOfferSchema.index({ startDate: 1, endDate: 1 });
eventOfferSchema.index({ priority: -1 });
eventOfferSchema.index({ offerType: 1 });

const EventOffer = mongoose.model('EventOffer', eventOfferSchema);

module.exports = EventOffer; 