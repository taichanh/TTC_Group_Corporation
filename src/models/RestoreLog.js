const mongoose = require('mongoose');

const restoreLogSchema = new mongoose.Schema({
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // admin
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restoreType: {
    type: String,
    enum: ['ACCOUNT', 'DATA'],
    required: true,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RestoreLog', restoreLogSchema);
