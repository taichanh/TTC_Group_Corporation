const RestoreLog = require('../models/RestoreLog');
const Backup = require('../models/Backup');
const UserData = require('../models/UserData');
const { createSystemLog } = require('../utils/logger');

// Request a restore (user or admin)
const requestRestore = async (req, res, next) => {
  try {
    const { targetUserId, restoreType = 'DATA', notes } = req.body;
    const targetUser = targetUserId || req.user._id;
    const doc = await RestoreLog.create({
      targetUser: targetUser,
      requestedBy: req.user._id,
      restoreType,
      status: 'pending',
      notes,
    });
    await createSystemLog({ user: req.user._id, action: 'RESTORE_REQUEST', meta: { restoreId: doc._id.toString(), targetUser: targetUser } });
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Approve restore (admin)
const approveRestore = async (req, res, next) => {
  try {
    const { backupRef } = req.body;
    const doc = await RestoreLog.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Restore request not found' });
    if (doc.status !== 'pending') return res.status(400).json({ message: 'Invalid status transition' });
    doc.status = 'approved';
    doc.approvedBy = req.user._id;
    doc.backupRef = backupRef || doc.backupRef;
    await doc.save();
    await createSystemLog({ user: req.user._id, action: 'RESTORE_APPROVE', meta: { restoreId: doc._id.toString(), backupRef: doc.backupRef } });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Execute restore (admin)
const executeRestore = async (req, res, next) => {
  try {
    const doc = await RestoreLog.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Restore request not found' });
    if (doc.status !== 'approved') return res.status(400).json({ message: 'Invalid status transition' });
    doc.status = 'in_progress';
    doc.restoredBy = req.user._id;
    await doc.save();
    // Simplified example: for DATA restore, we could copy last backup data back into UserData
    // Here we simulate success without actual S3/MongoDump restore
    // TODO: integrate storage abstraction to read snapshot and rehydrate
    doc.status = 'completed';
    doc.executedAt = new Date();
    await doc.save();
    await createSystemLog({ user: req.user._id, action: 'RESTORE_EXECUTE', meta: { restoreId: doc._id.toString() } });
    res.json({ success: true, data: doc });
  } catch (err) {
    try {
      const doc = await RestoreLog.findById(req.params.id);
      if (doc) { doc.status = 'failed'; doc.error = err.message; await doc.save(); }
    } catch (_) {}
    next(err);
  }
};

// Verify restore (admin)
const verifyRestore = async (req, res, next) => {
  try {
    const doc = await RestoreLog.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Restore request not found' });
    if (doc.status !== 'completed') return res.status(400).json({ message: 'Invalid status transition' });
    doc.verifiedAt = new Date();
    await doc.save();
    await createSystemLog({ user: req.user._id, action: 'RESTORE_VERIFY', meta: { restoreId: doc._id.toString() } });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// List restore requests (admin)
const listRestoreRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const docs = await RestoreLog.find(filter)
      .populate('targetUser', 'email')
      .populate('requestedBy', 'email')
      .populate('approvedBy', 'email')
      .populate('restoredBy', 'email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
};

module.exports = { requestRestore, approveRestore, executeRestore, verifyRestore, listRestoreRequests };
