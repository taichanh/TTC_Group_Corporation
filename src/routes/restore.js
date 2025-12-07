const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { requestRestore, approveRestore, executeRestore, verifyRestore, listRestoreRequests } = require('../controllers/restoreController');

// All routes require authentication
router.use(protect);

// Request restore (user or admin)
router.post('/requests',
  [ body('restoreType').optional().isIn(['ACCOUNT','DATA']).withMessage('Invalid restoreType') ],
  requestRestore
);

// Admin: list requests
router.get('/requests', authorize('admin'), listRestoreRequests);

// Admin: approve
router.post('/requests/:id/approve', authorize('admin'), approveRestore);

// Admin: execute
router.post('/requests/:id/execute', authorize('admin'), executeRestore);

// Admin: verify
router.post('/requests/:id/verify', authorize('admin'), verifyRestore);

module.exports = router;
