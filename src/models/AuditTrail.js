const mongoose = require('mongoose');

// Tracks audit trails for user actions and system events
const auditTrailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g., 'LOGIN', 'BACKUP_TRIGGER', 'DATA_RESTORE'
  timestamp: { type: Date, default: Date.now },
  details: { type: mongoose.Schema.Types.Mixed }, // flexible object for additional info
  ip: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditTrail', auditTrailSchema);