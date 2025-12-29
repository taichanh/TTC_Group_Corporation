const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { listBackups, getBackup, downloadBackup, triggerBackup } = require('../controllers/backupController');

router.use(protect);

router.get('/', authorize('admin'), listBackups);
router.get('/:id', authorize('admin'), getBackup);
router.get('/:id/download', authorize('admin'), downloadBackup);
router.post('/trigger', authorize('admin'), triggerBackup);

module.exports = router;
