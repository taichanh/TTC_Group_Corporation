const mongoose = require('mongoose');

// Tracks backup schedules for automated backups
const backupScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  nextRun: { type: Date, required: true },
  enabled: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastRun: { type: Date },
  type: { type: String, enum: ['USER_DATA_FULL', 'USER_DATA_OWNER'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for owner-specific
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('BackupSchedule', backupScheduleSchema);