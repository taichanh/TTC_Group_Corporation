const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'No Name' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  profile: {
    fullName: String,
    phone: String,
    address: String,
    avatar: String,
  },
  lastLoginAt: Date,
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Virtual for notifications
userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'user'
});

// Virtual for sessions
userSchema.virtual('sessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'user'
});

// Virtual for userData
userSchema.virtual('userData', {
  ref: 'UserData',
  localField: '_id',
  foreignField: 'user'
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
