const Backup = require('../models/Backup');
const { getStorage } = require('../services/storage');
const { performUserDataFullBackup } = require('../utils/backupCron');
const { createSystemLog } = require('../utils/logger');

// List backups (admin)
const listBackups = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, before } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;
    const filter = {};
    if (before) {
      const t = new Date(before);
      if (!isNaN(t)) filter.completedAt = { $lte: t };
    }
    const docs = await Backup.find(filter).sort({ completedAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
};

// Get backup metadata
const getBackup = async (req, res, next) => {
  try {
    const doc = await Backup.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Backup not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Download backup file
const downloadBackup = async (req, res, next) => {
  try {
    const doc = await Backup.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Backup not found' });
    if (!doc.storageRef) return res.status(404).json({ message: 'No storage ref' });
    // storageRef is a filesystem path for LocalStorage
    return res.download(doc.storageRef);
  } catch (err) { next(err); }
};

// Manual trigger backup (admin)
const triggerBackup = async (req, res, next) => {
  try {
    // run async but return accepted
    performUserDataFullBackup().catch(err => console.error('Manual backup failed', err));
    await createSystemLog({ user: req.user._id, action: 'BACKUP_MANUAL_TRIGGER' });
    res.status(202).json({ success: true, message: 'Backup started' });
  } catch (err) { next(err); }
};

module.exports = { listBackups, getBackup, downloadBackup, triggerBackup };
