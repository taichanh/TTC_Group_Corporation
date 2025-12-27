const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, getMe, updateMe, deleteMe } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllUsers);
// Current user
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);

router.get('/:id', protect, getUserById);


module.exports = router;
