const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
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
        isDefault: {
          type: Boolean,
          default: false,
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
    ],
    otp: {
      type: String,
      // Don't hide OTP as it's needed for verification
    },
    otpExpires: {
      type: Date,
      // Don't hide OTP expiry as it's needed for verification
    },
    otpMethod: {
      type: String,
      enum: ['email', 'phone'],
      default: 'email',
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Generate 6-digit OTP
userSchema.methods.generateOTP = function (method = 'email') {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP and expiration time (10 minutes from now)
  this.otp = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  this.otpMethod = method;

  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (code) {
  if (!this.otp || !this.otpExpires) {
    return false;
  }
  return this.otp === code && this.otpExpires > new Date();
};

// Ensure only one default address
userSchema.methods.setDefaultAddress = function (addressId) {
  if (!this.addresses || this.addresses.length === 0) return;

  this.addresses.forEach((address) => {
    address.isDefault = address._id.toString() === addressId.toString();
  });
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
