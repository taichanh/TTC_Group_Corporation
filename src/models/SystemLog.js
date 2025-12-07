const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // login fail có thể không có user
  },
  action: {
    type: String,
    required: true, // LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SystemLog', systemLogSchema);
