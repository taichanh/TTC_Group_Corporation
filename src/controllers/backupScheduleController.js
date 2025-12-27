const BackupSchedule = require('../models/BackupSchedule');
const { createSystemLog } = require('../utils/logger');

// List backup schedules (admin)
const listBackupSchedules = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;
    const docs = await BackupSchedule.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'username');
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
};

// Get backup schedule
const getBackupSchedule = async (req, res, next) => {
  try {
    const doc = await BackupSchedule.findById(req.params.id).populate('createdBy', 'username');
    if (!doc) return res.status(404).json({ message: 'Backup schedule not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Create backup schedule
const createBackupSchedule = async (req, res, next) => {
  try {
    const { name, frequency, nextRun, type, owner, notes } = req.body;
    const doc = new BackupSchedule({
      name,
      frequency,
      nextRun,
      type,
      owner,
      notes,
      createdBy: req.user._id,
    });
    await doc.save();
    await createSystemLog({ user: req.user._id, action: 'BACKUP_SCHEDULE_CREATE', details: { scheduleId: doc._id } });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Update backup schedule
const updateBackupSchedule = async (req, res, next) => {
  try {
    const { name, frequency, nextRun, enabled, type, owner, notes } = req.body;
    const doc = await BackupSchedule.findByIdAndUpdate(req.params.id, {
      name,
      frequency,
      nextRun,
      enabled,
      type,
      owner,
      notes,
    }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Backup schedule not found' });
    await createSystemLog({ user: req.user._id, action: 'BACKUP_SCHEDULE_UPDATE', details: { scheduleId: doc._id } });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Delete backup schedule
const deleteBackupSchedule = async (req, res, next) => {
  try {
    const doc = await BackupSchedule.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Backup schedule not found' });
    await createSystemLog({ user: req.user._id, action: 'BACKUP_SCHEDULE_DELETE', details: { scheduleId: req.params.id } });
    res.json({ success: true, message: 'Backup schedule deleted' });
  } catch (err) { next(err); }
};

module.exports = {
  listBackupSchedules,
  getBackupSchedule,
  createBackupSchedule,
  updateBackupSchedule,
  deleteBackupSchedule,
};