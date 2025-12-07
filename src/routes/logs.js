const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const SystemLog = require('../models/SystemLog');
const RestoreLog = require('../models/RestoreLog');

// System logs
router.get('/system', protect, authorize('admin'), async (req, res) => {
  const logs = await SystemLog.find()
    .populate('user', 'email role')
    .sort({ createdAt: -1 });

  res.json(logs);
});

// Restore logs
router.get('/restore', protect, authorize('admin'), async (req, res) => {
  const logs = await RestoreLog.find()
    .populate('restoredBy', 'email')
    .populate('targetUser', 'email')
    .sort({ createdAt: -1 });

  res.json(logs);
});

module.exports = router;
