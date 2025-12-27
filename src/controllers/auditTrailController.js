const AuditTrail = require('../models/AuditTrail');

// List audit trails (admin)
const listAuditTrails = async (req, res, next) => {
  try {
    const { limit = 50, page = 1, user, action, before } = req.query;
    const skip = (Math.max(1, page) - 1) * limit;
    const filter = {};
    if (user) filter.user = user;
    if (action) filter.action = action;
    if (before) {
      const t = new Date(before);
      if (!isNaN(t)) filter.timestamp = { $lte: t };
    }
    const docs = await AuditTrail.find(filter).sort({ timestamp: -1 }).skip(skip).limit(Number(limit)).populate('user', 'username');
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) { next(err); }
};

// Get audit trail
const getAuditTrail = async (req, res, next) => {
  try {
    const doc = await AuditTrail.findById(req.params.id).populate('user', 'username');
    if (!doc) return res.status(404).json({ message: 'Audit trail not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
};

// Create audit trail (internal use, perhaps from middleware)
const createAuditTrail = async (data) => {
  try {
    const doc = new AuditTrail(data);
    await doc.save();
  } catch (err) {
    console.error('Failed to create audit trail', err);
  }
};

module.exports = {
  listAuditTrails,
  getAuditTrail,
  createAuditTrail,
};