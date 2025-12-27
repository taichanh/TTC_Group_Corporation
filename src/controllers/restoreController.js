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
    try { const { sendWebhook } = require('../utils/notify'); sendWebhook('restore.request', { restoreId: doc._id.toString(), targetUser }).catch(()=>{}); } catch(_) {}
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
    try { const { sendWebhook } = require('../utils/notify'); sendWebhook('restore.approved', { restoreId: doc._id.toString(), backupRef: doc.backupRef }).catch(()=>{}); } catch(_) {}
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

    // Determine backup to use
    const Backup = require('../models/Backup');
    const { getStorage } = require('../services/storage');

    let backupRef = req.body.backupRef || doc.backupRef;
    const backupAt = req.body.backupAt || doc.backupAt; // optional timestamp for point-in-time restore
    let backupDoc = null;
    if (backupRef) {
      backupDoc = await Backup.findOne({ $or: [{ _id: backupRef }, { storageRef: backupRef }] });
    }
    if (!backupDoc) {
      if (backupAt) {
        const t = new Date(backupAt);
        if (isNaN(t)) throw new Error('Invalid backupAt timestamp');
        // find latest completed backup at or before the requested time
        backupDoc = await Backup.findOne({ status: 'completed', completedAt: { $lte: t } }).sort({ completedAt: -1 });
      } else {
        // pick latest completed backup
        backupDoc = await Backup.findOne({ status: 'completed' }).sort({ completedAt: -1 });
      }
    }
    if (!backupDoc || !backupDoc.storageRef) {
      throw new Error('No suitable backup snapshot found');
    }

    const storage = getStorage();
    const items = await storage.readJSON(backupDoc.storageRef);

    // Rehydrate: for DATA restore, restore UserData entries for targetUser
    if (doc.restoreType === 'DATA' || doc.restoreType === 'ACCOUNT') {
      const UserData = require('../models/UserData');
      const targetUserId = doc.targetUser.toString();
      const restoreItems = Array.isArray(items) ? items.filter(i => i.owner && i.owner.toString() === targetUserId) : [];

      for (const it of restoreItems) {
        const key = it.key;
        const payload = it.data;
        const tags = it.tags || [];
        await UserData.findOneAndUpdate(
          { owner: targetUserId, key },
          { $set: { data: payload, tags } },
          { upsert: true }
        );
      }
    }

    doc.status = 'completed';
    doc.executedAt = new Date();
    doc.backupRef = backupDoc._id.toString();
    await doc.save();
    await createSystemLog({ user: req.user._id, action: 'RESTORE_EXECUTE', meta: { restoreId: doc._id.toString(), backupId: backupDoc._id.toString() } });
    try { const { sendWebhook } = require('../utils/notify'); sendWebhook('restore.executed', { restoreId: doc._id.toString(), backupId: backupDoc._id.toString() }).catch(()=>{}); } catch(_) {}
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
    try { const { sendWebhook } = require('../utils/notify'); sendWebhook('restore.verified', { restoreId: doc._id.toString() }).catch(()=>{}); } catch(_) {}
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
