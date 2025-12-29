const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { requestRestore, approveRestore, executeRestore, verifyRestore, listRestoreRequests } = require('../controllers/restoreController');

// All routes require authentication
router.use(protect);

// Request restore (user or admin)
router.post('/',
  [ body('restoreType').optional().isIn(['ACCOUNT','DATA']).withMessage('Invalid restoreType') ],
  requestRestore
);

// Admin: list requests
router.get('/', authorize('admin'), listRestoreRequests);

// Admin: approve
router.put('/:id/approve', authorize('admin'), approveRestore);

// Admin: execute
router.post('/:id/execute', authorize('admin'), executeRestore);

// Admin: verify
router.post('/requests/:id/verify', authorize('admin'), verifyRestore);

module.exports = router;
