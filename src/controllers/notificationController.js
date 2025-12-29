const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Create notification (for internal use or admin)
// @route   POST /api/v1/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
  const { user, title, message, type } = req.body;

  const notification = await Notification.create({
    user,
    title,
    message,
    type: type || 'info'
  });

  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification
};