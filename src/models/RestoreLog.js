const mongoose = require('mongoose');

const restoreLogSchema = new mongoose.Schema({
  // Who owns the data to be restored
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Who requested the restore
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Admin who approves (optional until approved)
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Admin who executes (may be same as approvedBy)
  restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  restoreType: { type: String, enum: ['ACCOUNT', 'DATA'], required: true },
  status: { type: String, enum: ['pending','approved','in_progress','completed','failed'], default: 'pending' },
  backupRef: { type: String }, // reference to backup snapshot used
  notes: { type: String },
  error: { type: String },
  executedAt: { type: Date },
  verifiedAt: { type: Date },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RestoreLog', restoreLogSchema);
