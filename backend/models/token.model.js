const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['refresh', 'reset', 'verification'],
      default: 'refresh',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    createdByIp: String,
    revokedByIp: String,
    revokedAt: Date,
    replacedByToken: String,
  },
  { timestamps: true }
);

// Add index for token expiration
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Add index for lookup performance
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1 });

// Remove expired tokens
tokenSchema.statics.removeExpired = async function () {
  await this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Find valid refresh token
tokenSchema.statics.findValidRefreshToken = async function (userId, token) {
  return this.findOne({
    userId,
    token,
    type: 'refresh',
    expiresAt: { $gt: new Date() },
    isRevoked: false,
  });
};

// Revoke token
tokenSchema.methods.revoke = async function (ip) {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedByIp = ip;
  await this.save();
};

module.exports = mongoose.model('Token', tokenSchema);
