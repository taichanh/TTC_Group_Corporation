const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { listAuditTrails, getAuditTrail } = require('../controllers/auditTrailController');

router.use(protect);

router.get('/', authorize('admin'), listAuditTrails);
router.get('/:id', authorize('admin'), getAuditTrail);

module.exports = router;