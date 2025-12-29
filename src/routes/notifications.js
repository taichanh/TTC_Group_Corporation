const express = require('express');
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes require authentication

router.route('/')
  .get(getNotifications)
  .post(protect, authorize('admin'), createNotification);

router.route('/:id/read')
  .put(markAsRead);

router.route('/:id')
  .delete(deleteNotification);

module.exports = router;