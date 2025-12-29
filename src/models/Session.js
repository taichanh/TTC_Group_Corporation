const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true }, // JWT token
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceInfo: Object, // Browser, OS, etc.
  loginAt: { type: Date, default: Date.now },
  logoutAt: { type: Date },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true }, // Token expiration
}, { timestamps: true });

// Index for token lookup and cleanup
sessionSchema.index({ token: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto cleanup
sessionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Session', sessionSchema);