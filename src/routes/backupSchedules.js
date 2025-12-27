const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  listBackupSchedules,
  getBackupSchedule,
  createBackupSchedule,
  updateBackupSchedule,
  deleteBackupSchedule,
} = require('../controllers/backupScheduleController');

router.use(protect);

router.get('/', authorize('admin'), listBackupSchedules);
router.get('/:id', authorize('admin'), getBackupSchedule);
router.post('/', authorize('admin'), createBackupSchedule);
router.put('/:id', authorize('admin'), updateBackupSchedule);
router.delete('/:id', authorize('admin'), deleteBackupSchedule);

module.exports = router;