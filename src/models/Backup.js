const mongoose = require('mongoose');

// Tracks backup snapshots and their status/metadata
const backupSchema = new mongoose.Schema({
  type: { type: String, enum: ['USER_DATA_FULL', 'USER_DATA_OWNER'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for owner-specific backups
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
  itemCount: { type: Number, default: 0 },
  storageRef: { type: String }, // e.g., file path or object storage key
  notes: { type: String },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Backup', backupSchema);
