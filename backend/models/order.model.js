const mongoose = require('mongoose');

const addonOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const addonGroupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  options: [addonOptionSchema],
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: String,
        selectedAddons: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
            },
            options: [
              {
                name: {
                  type: String,
                  required: true,
                  trim: true,
                },
                price: {
                  type: Number,
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    coupon: {
      code: {
        type: String,
        trim: true,
      },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      discountValue: {
        type: Number,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin'],
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    deliveryAddress: {
      addressType: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
      },
      name: {
        type: String,
        trim: true,
      },
      phoneNumber: {
        type: String,
        trim: true,
      },
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
        default: 'USA',
      },
      additionalDirections: {
        type: String,
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card'],
      default: 'cash',
    },
    cardDetails: {
      last4: {
        type: String,
        trim: true,
      },
      brand: {
        type: String,
        trim: true,
      },
    },
    transactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

module.exports = mongoose.model('Order', orderSchema);
